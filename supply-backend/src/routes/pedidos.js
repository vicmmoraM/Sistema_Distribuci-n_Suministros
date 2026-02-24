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
  if (!pdvId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'PDV e ítems son requeridos.' })
  }

  const fecha = new Date().toISOString().split('T')[0]
  const conn  = await pool.getConnection()

  try {
    await conn.beginTransaction()

    // ── 2. Verificar que el PDV existe y está activo ────────────────────────
    const [pdvRows] = await conn.query(
      `SELECT p.codigo, p.descripcion, p.direccion,
              c.descripcion AS ciudad,
              gp.monto_autorizado AS cupo
       FROM pdvs p
       INNER JOIN ciudades c    ON p.ciudad    = c.codigo
       INNER JOIN grupo_pdvs gp ON p.grupo_pdv = gp.codigo
       WHERE p.codigo = ? AND p.estado_pdv = 1`,
      [pdvId]
    )

    if (pdvRows.length === 0) {
      await conn.rollback()
      conn.release()
      return res.status(400).json({ error: 'PDV no válido o inactivo.' })
    }

    const pdv = pdvRows[0]

    // ── 3. Validar y recalcular cada ítem desde BD ──────────────────────────
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
        `SELECT s.codigo, s.descripcion, s.precio,
                t.codigo AS tipoId, t.descripcion AS tipoNombre
         FROM suministros s
         INNER JOIN tipo_suministros t ON s.tipo_suministro = t.codigo
         WHERE s.codigo = ? AND s.estado_suministro = 1`,
        [item.suministroId]
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
        suministroId:     suministro.codigo,
        suministroNombre: suministro.descripcion,
        tipoId:           suministro.tipoId,
        tipoNombre:       suministro.tipoNombre,
        cantidad:         Number(item.cantidad),
        precioUnitario:   Number(suministro.precio),
        total:            Number(item.cantidad) * Number(suministro.precio),
      })
    }

    // ── 4. Verificar cupo en el backend ────────────────────────────────────
    const totalPedido = itemsValidados.reduce((s, i) => s + i.total, 0)

    if (totalPedido > Number(pdv.cupo)) {
      await conn.rollback()
      conn.release()
      return res.status(400).json({
        error: `El total $${totalPedido.toFixed(2)} supera el cupo asignado $${Number(pdv.cupo).toFixed(2)}.`
      })
    }

    // ── 5. Obtener o crear usuario (Upsert) ────────────────────────────────
    const [usuRows] = await conn.query(
      'SELECT codigo FROM usuarios WHERE login = ?',
      [req.session.userlogin]
    )

    let usuarioId
    if (usuRows.length === 0) {
      const [ins] = await conn.query(
        'INSERT INTO usuarios (departamento, rol, login, nombres, email) VALUES (?, 1, ?, ?, ?)',
        [req.session.departamento, req.session.userlogin, req.session.username,
         `${req.session.userlogin}@farmcorp.com.ec`]
      )
      usuarioId = ins.insertId
    } else {
      // Upsert — mantener datos sincronizados
      await conn.query(
        'UPDATE usuarios SET nombres = ?, departamento = ? WHERE login = ?',
        [req.session.username, req.session.departamento, req.session.userlogin]
      )
      usuarioId = usuRows[0].codigo
    }

    // ── 6. Insertar cabecera del pedido ────────────────────────────────────
    const [cabIns] = await conn.query(
      'INSERT INTO cabecera_pedidos (usuario, pdv, estadoPedido, fecha) VALUES (?, ?, 1, ?)',
      [usuarioId, pdvId, fecha]
    )
    const cabeceraPedidoId = cabIns.insertId

    // ── 7. Insertar detalles ───────────────────────────────────────────────
    for (const item of itemsValidados) {
      await conn.query(
        'INSERT INTO detalle_pedidos (cabPedido, suministro, cantidad, precioUnitario) VALUES (?, ?, ?, ?)',
        [cabeceraPedidoId, item.suministroId, item.cantidad, item.precioUnitario]
      )
    }

    await conn.commit()
    conn.release()

    // ── 8. Calcular subtotales ─────────────────────────────────────────────
    const subtotalOficina  = itemsValidados.filter(i => i.tipoId === 1).reduce((s, i) => s + i.total, 0)
    const subtotalLimpieza = itemsValidados.filter(i => i.tipoId !== 1).reduce((s, i) => s + i.total, 0)

    // ── 9. Generar CSV ─────────────────────────────────────────────────────
    const filesPath = process.env.FILES_PATH || './temp_files'
    if (!fs.existsSync(filesPath)) fs.mkdirSync(filesPath, { recursive: true })

    const nombreArchivo = `pedidoSuministro_${pdv.descripcion}_${fecha}`
    const csvPath       = path.join(filesPath, `${nombreArchivo}.csv`)

    const headerLines = [
      `Solicitado por:,${req.session.username}`,
      `PDV:,${pdv.descripcion}`,
      `Ciudad:,${pdv.ciudad}`,
      `Dirección:,${pdv.direccion}`,
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

    // ── 10. Enviar email ───────────────────────────────────────────────────
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