const PedidoRepository = require('../repositories/PedidoRepository');

class PedidoService {
  constructor(pedidoRepository = new PedidoRepository()) {
    this.pedidoRepository = pedidoRepository;
  }

  async aprobarPedido({ pedidoId, usuarioId, observacion }) {
    if (!pedidoId || !usuarioId) {
      const err = new Error('pedidoId y usuarioId son requeridos.');
      err.statusCode = 400;
      throw err;
    }

    const pedido = await this.pedidoRepository.getPedidoById(pedidoId);
    if (!pedido) {
      const err = new Error('Pedido no encontrado.');
      err.statusCode = 404;
      throw err;
    }

    try {
      // Regla critica: siempre aprobar via SP para conservar atomicidad y stock.
      await this.pedidoRepository.callAprobarPedidoSP({
        idPedido: Number(pedidoId),
        idUsuario: Number(usuarioId),
        observacion: observacion || null,
      });
    } catch (error) {
      const err = new Error(error.message || 'No fue posible aprobar el pedido.');
      err.statusCode = error.errno === 1644 ? 400 : 500;
      throw err;
    }

    return {
      success: true,
      message: `Pedido #${pedidoId} aprobado correctamente.`,
    };
  }

  async actualizarPrecio({ idSuministro, idProveedor, precioNuevo, usuarioId }) {
    if (!idSuministro || !idProveedor || precioNuevo == null) {
      const err = new Error('idSuministro, idProveedor y precioNuevo son requeridos.');
      err.statusCode = 400;
      throw err;
    }

    // Regla critica: historico append-only via SP.
    await this.pedidoRepository.callActualizarPrecioSP({
      idSuministro: Number(idSuministro),
      idProveedor: Number(idProveedor),
      precioNuevo: Number(precioNuevo),
      idUsuario: usuarioId ? Number(usuarioId) : null,
    });

    return { success: true };
  }

  async getCatalogoVigentePorTipo({ idTipoSuministro, idPdv }) {
    if (!idTipoSuministro) {
      const err = new Error('idTipoSuministro es requerido.');
      err.statusCode = 400;
      throw err;
    }

    // El repository consulta v_catalogo_disponible, que ya usa solo precio vigente.
    return this.pedidoRepository.getCatalogoVigenteByTipo({
      idTipoSuministro: Number(idTipoSuministro),
      idPdv: idPdv ? Number(idPdv) : null,
    });
  }

  async obtenerPresupuestoDepartamentoActual({ idDepartamento }) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const budget = await this.pedidoRepository.getDepartmentBudgetByPeriod(
      Number(idDepartamento),
      year,
      month
    );

    return {
      periodo_anio: year,
      periodo_mes: month,
      budget,
    };
  }
}

module.exports = PedidoService;
