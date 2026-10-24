const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoControllers');

// Ruta principal (SSR con EJS)
router.get('/', productoController.listarCatalogo);

// Ruta de API (Manejo de respuestas en JSON)
router.get('/api/productos', productoController.listarJSON);

module.exports = router;