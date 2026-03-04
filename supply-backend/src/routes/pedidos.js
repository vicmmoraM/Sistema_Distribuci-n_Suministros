// Endpoint principal: registrar pedido, validar datos contra BD,
// generar CSV y enviar email

const express    = require('express')
const router     = express.Router()
const path       = require('path')
const fs         = require('fs')
const { pool }   = require('../config/db')
const { requireAuth } = require('../middleware/auth')
const { createObjectCsvWriter } = require('csv-writer')
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host:   process.env.MAIL_HOST,
  port:   Number(process.env.MAIL_PORT),
  secure: process.env.MAIL_SECURE === 'true',
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
})

/**
 * POST /api/pedidos
 * Registra un pedido completo con validaciones server-side.
 * No confía en precios ni totales del frontend — los recalcula desde BD.
 */
router.post('/', requireAuth, async (req, res) => {
  const { pdvId, items } = req.body

  // ── 1. Validación básica de estructura ─────────────────────────────────────
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Los ítems son requeridos.' })
  }

  const fecha = new Date().toISOString().split('T')[0]
  const conn  = await pool.getConnection()

  try {
    await conn.beginTransaction()

    // ── 2. Contexto del usuario (departamento y presupuesto) ───────────────
    const [deptRows] = await conn.query(
      `SELECT
        LOWER(TRIM(d.descripcion)) AS departmentName,
        COALESCE(pd.monto_autorizado, 0) AS departmentBudget
       FROM departamentos d
       LEFT JOIN presupuesto_departamentos pd ON pd.id_departamento = d.id_departamento
       WHERE d.id_departamento = ?
       LIMIT 1`,
      [req.session.departamento]
    )

    const departmentName = deptRows.length > 0 ? deptRows[0].departmentName : ''
    const departmentBudget = deptRows.length > 0 ? Number(deptRows[0].departmentBudget || 0) : 0
    const esComercial = departmentName === 'comercial'

    if (esComercial && !pdvId) {
      await conn.rollback()
      conn.release()
      return res.status(400).json({ error: 'PDV es requerido para el departamento Comercial.' })
    }

    let pdv = null
    if (esComercial) {
      const [pdvRows] = await conn.query(
        `SELECT p.id_pdv, p.descripcion, p.direccion,
                z.zona AS ciudad,
                gp.monto_autorizado AS cupo
         FROM pdvs p
         INNER JOIN zonas_comerciales z ON p.id_zona_comercial = z.id_zona_comercial
         INNER JOIN grupo_pdvs gp       ON p.id_grupo_pdv = gp.id_grupo_pdv
         WHERE p.id_pdv = ? AND p.id_estado_pdv = 1`,
        [pdvId]
      )

      if (pdvRows.length === 0) {
        await conn.rollback()
        conn.release()
        return res.status(400).json({ error: 'PDV no válido o inactivo.' })
      }

      pdv = pdvRows[0]
    }

    // ── 4. Validar y recalcular cada ítem desde BD ──────────────────────────
    // No confiamos en precios ni totales del frontend
    const itemsValidados = []

    for (const item of items) {
      // Validar estructura del ítem
      if (!item.suministroId || !item.cantidad || item.cantidad < 1 || item.cantidad > 10) {
        await conn.rollback()
        conn.release()
        return res.status(400).json({
          error: `Ítem inválido: cantidad debe estar entre 1 y 10.`
        })
      }

      // Verificar que el suministro existe y está disponible
      const [sumRows] = await conn.query(
        `SELECT s.id_suministro, s.descripcion,
          COALESCE(
            MIN(sp.precio_compra),
            (
              SELECT sp2.precio_compra
              FROM suministros_precios sp2
              WHERE sp2.id_suministro = s.id_suministro
              ORDER BY sp2.precio_compra ASC, sp2.id_suministro_precio ASC
              LIMIT 1
            ),
            0
          ) AS precio,
          t.id_tipo_suministro AS tipoId, t.descripcion AS tipoNombre
         FROM suministros s
         INNER JOIN tipo_suministros t ON s.id_tipo_suministro = t.id_tipo_suministro
         LEFT JOIN pdvs p ON p.id_pdv = ?
         LEFT JOIN suministros_precios sp
           ON sp.id_suministro = s.id_suministro
          AND (p.id_proveedor_principal IS NULL OR sp.id_proveedor = p.id_proveedor_principal)
         WHERE s.id_suministro = ? AND s.id_estado_suministro = 1
         GROUP BY s.id_suministro, s.descripcion, t.id_tipo_suministro, t.descripcion`,
        [esComercial ? pdvId : null, item.suministroId]
      )

      if (sumRows.length === 0) {
        await conn.rollback()
        conn.release()
        return res.status(400).json({
          error: `Suministro ID ${item.suministroId} no existe o no está disponible.`
        })
      }

      const suministro = sumRows[0]

      // Recalcular precio y total desde BD — ignoramos lo que mandó el frontend
      itemsValidados.push({
        suministroId:     suministro.id_suministro,
        suministroNombre: suministro.descripcion,
        tipoId:           suministro.tipoId,
        tipoNombre:       suministro.tipoNombre,
        cantidad:         Number(item.cantidad),
        precioUnitario:   Number(suministro.precio),
        total:            Number(item.cantidad) * Number(suministro.precio),
      })
    }

    // ── 5. Verificar límite en el backend ───────────────────────────────────
    const totalPedido = itemsValidados.reduce((s, i) => s + i.total, 0)

    if (esComercial) {
      if (totalPedido > Number(pdv.cupo)) {
        await conn.rollback()
        conn.release()
        return res.status(400).json({
          error: `El total $${totalPedido.toFixed(2)} supera el cupo asignado $${Number(pdv.cupo).toFixed(2)}.`
        })
      }
    } else if (totalPedido > departmentBudget) {
      await conn.rollback()
      conn.release()
      return res.status(400).json({
        error: `El total $${totalPedido.toFixed(2)} supera el presupuesto del departamento $${departmentBudget.toFixed(2)}.`
      })
    }

    // ── 6. Obtener o crear usuario (Upsert) ────────────────────────────────
    const [usuRows] = await conn.query(
      'SELECT id_usuario FROM usuarios WHERE login = ?',
      [req.session.userlogin]
    )

    let usuarioId
    if (usuRows.length === 0) {
      const [ins] = await conn.query(
        'INSERT INTO usuarios (id_departamento, id_rol, login, nombres, email) VALUES (?, 1, ?, ?, ?)',
        [req.session.departamento, req.session.userlogin, req.session.username,
         `${req.session.userlogin}@farmcorp.com.ec`]
      )
      usuarioId = ins.insertId
    } else {
      // Upsert — mantener datos sincronizados
      await conn.query(
        'UPDATE usuarios SET nombres = ?, id_departamento = ? WHERE login = ?',
        [req.session.username, req.session.departamento, req.session.userlogin]
      )
      usuarioId = usuRows[0].id_usuario
    }

    // ── 7. Insertar cabecera del pedido ────────────────────────────────────
    const [cabIns] = await conn.query(
      'INSERT INTO cabecera_pedidos (id_usuario, id_pdv, id_estado_pedido) VALUES (?, ?, 1)',
      [usuarioId, esComercial ? pdvId : null]
    )
    const cabeceraPedidoId = cabIns.insertId

    // ── 8. Insertar detalles ───────────────────────────────────────────────
    for (const item of itemsValidados) {
      await conn.query(
        'INSERT INTO detalle_pedidos (id_pedido, id_suministro, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
        [cabeceraPedidoId, item.suministroId, item.cantidad, item.precioUnitario]
      )
    }

    await conn.commit()
    conn.release()

    // ── 9. Calcular subtotales ─────────────────────────────────────────────
    const subtotalOficina  = itemsValidados.filter(i => i.tipoId === 1).reduce((s, i) => s + i.total, 0)
    const subtotalLimpieza = itemsValidados.filter(i => i.tipoId !== 1).reduce((s, i) => s + i.total, 0)

    // ── 10. Generar CSV ────────────────────────────────────────────────────
    const filesPath = process.env.FILES_PATH || './temp_files'
    if (!fs.existsSync(filesPath)) fs.mkdirSync(filesPath, { recursive: true })

    const nombreArchivo = `pedidoSuministro_${req.session.userlogin}_${fecha}`
    const csvPath       = path.join(filesPath, `${nombreArchivo}.csv`)

    const lugarSolicitud = esComercial
      ? (pdv?.descripcion || req.session.userlogin)
      : `Departamento ${departmentName.toUpperCase()}`
    const ciudadSolicitud = esComercial ? (pdv?.ciudad || 'N/A') : 'N/A'
    const direccionSolicitud = esComercial ? (pdv?.direccion || 'N/A') : 'N/A'
    const limiteMonto = esComercial ? Number(pdv?.cupo || 0) : Number(departmentBudget || 0)
    const limiteEtiqueta = esComercial ? 'Cupo PDV' : 'Presupuesto Departamento'

    const headerLines = [
      `Solicitado por:,${req.session.username}`,
      `Origen:,${lugarSolicitud}`,
      `Ciudad:,${ciudadSolicitud}`,
      `Dirección:,${direccionSolicitud}`,
      `${limiteEtiqueta}:,$${limiteMonto.toFixed(2)}`,
      '',
    ].join('\n')

    const csvWriter = createObjectCsvWriter({
      path: csvPath,
      header: [
        { id: 'descripcion',    title: 'Descripcion' },
        { id: 'tipo',           title: 'Tipo de Suministro' },
        { id: 'cantidad',       title: 'Cantidad' },
        { id: 'precioUnitario', title: 'Precio Unitario' },
        { id: 'total',          title: 'Total' },
      ],
    })

    fs.writeFileSync(csvPath, headerLines)
    await csvWriter.writeRecords(itemsValidados.map(i => ({
      descripcion:    i.suministroNombre,
      tipo:           i.tipoNombre,
      cantidad:       i.cantidad,
      precioUnitario: i.precioUnitario,
      total:          i.total.toFixed(2),
    })))

    fs.appendFileSync(csvPath, [
      '',
      `,,, Total S. Oficina:,${subtotalOficina.toFixed(2)}`,
      `,,, Total S. Limpieza:,${subtotalLimpieza.toFixed(2)}`,
      '',
      `,,, Total:,${totalPedido.toFixed(2)}`,
    ].join('\n'))

    // ── 11. Enviar email ───────────────────────────────────────────────────
    let emailEnviado = false

    if (process.env.MAIL_ENABLED === 'true') {
      try {
        await transporter.sendMail({
          from:    `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_USER}>`,
          replyTo: process.env.MAIL_REPLY_TO,
          to:      process.env.MAIL_TO,
          subject: 'Pedido de Suministro',
          html:    `<font face="verdana" size="3">
                      Hola,<br><br>
                      Tienes un nuevo pedido de suministro por atender.<br><br>
                      Se adjunta la solicitud en formato CSV.<br><br>
                      <strong>Atentamente,</strong><br>Sistema de Pedidos.
                    </font>`,
          attachments: [{ filename: `${nombreArchivo}.csv`, path: csvPath }],
        })
        emailEnviado = true
      } catch (mailErr) {
        console.error('Error enviando email:', mailErr.message)
      } finally {
        if (fs.existsSync(csvPath)) fs.unlinkSync(csvPath)
      }
    } else {
      // En modo test simplemente eliminamos el CSV
      if (fs.existsSync(csvPath)) fs.unlinkSync(csvPath)
    }

    return res.json({
      success: true,
      pedidoId: cabeceraPedidoId,
      emailEnviado,
      mensaje: emailEnviado
        ? 'Su requerimiento ha sido enviado.'
        : 'Pedido registrado correctamente.',
    })

  } catch (err) {
    await conn.rollback()
    conn.release()
    console.error('Error en pedido:', err)
    return res.status(500).json({ error: 'Error al procesar el pedido.' })
  }
})

module.exports = router