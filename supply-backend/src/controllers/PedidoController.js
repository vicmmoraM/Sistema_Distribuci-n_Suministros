const PedidoService = require('../services/PedidoService');

class PedidoController {
  constructor(pedidoService = new PedidoService()) {
    this.pedidoService = pedidoService;
  }

  aprobarPedido = async (req, res) => {
    try {
      const { id } = req.params;
      const { observaciones } = req.body || {};

      const result = await this.pedidoService.aprobarPedido({
        pedidoId: Number(id),
        usuarioId: Number(req.session.userId),
        observacion: observaciones || null,
      });

      return res.json(result);
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        error: error.message || 'Error al aprobar pedido.',
      });
    }
  };
}

module.exports = PedidoController;
