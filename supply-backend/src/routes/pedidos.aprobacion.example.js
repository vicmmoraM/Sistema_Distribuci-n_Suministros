const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware/auth');
const { requirePermission } = require('../middleware/requirePermission');
const PedidoController = require('../controllers/PedidoController');

const pedidoController = new PedidoController();

// Ejemplo SOLID en capas: Route -> Controller -> Service -> Repository.
router.post(
  '/:id/aprobar',
  requireAuth,
  requirePermission('APROBACION'),
  pedidoController.aprobarPedido
);

module.exports = router;
