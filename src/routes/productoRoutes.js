const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoControllers');

// Ruta principal (SSR con EJS)
router.get('/', (req, res) => {
    res.render('bienvenido');
});

// Catálogo de productos para clientes
router.get('/productos', productoController.listarCatalogo);

// Login del administrador
router.get('/admin/login', (req, res) => {
    res.render('login');
});

// Validación del login
router.post('/admin/login', (req, res) => {
    const correo = req.body.correo;
    const contrasena = req.body.contrasena;

    if (correo === "admin@gmail.com" && contrasena === "1234") {
        res.render("dashboard");
    } else {
        res.send("Correo o contraseña incorrectos.");
    }
});

// Panel de administración
router.get('/admin/dashboard', (req, res) => {
    res.render('dashboard');
});

// Ver productos del administrador
router.get('/admin/productos', productoController.listarProductosAdmin);

// Pantalla para agregar productos
router.get('/admin/productos/alta', (req, res) => {
    res.render('altaProducto');
});

// Guardar producto nuevo
router.post('/admin/productos/alta', productoController.agregarProducto);

// Pantalla para eliminar productos
router.get('/admin/productos/darBaja', async (req, res) => {
    const productos = await require('../models/productoModel').findAll({where: {activo: true}});

    res.render('darBajaProducto', {
        productos: productos
    });
});

// Eliminar producto seleccionado
router.post('/admin/productos/darBaja/:id', productoController.darBajaProducto);

// Reactivar un producto
router.post('/admin/productos/reactivar/:id', productoController.reactivarProducto);

// Pantalla para reactivar productos
router.get('/admin/productos/reactivar', async (req, res) => {
    const productos = await require('../models/productoModel').findAll({
        where: { activo: false }
    });

    res.render('reactivarProducto', {
        productos: productos
    });
});

// Ruta de API (Manejo de respuestas en JSON)
router.get('/api/productos', productoController.listarJSON);

module.exports = router;