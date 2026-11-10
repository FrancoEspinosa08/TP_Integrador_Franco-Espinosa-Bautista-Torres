const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoControllers');

// Ruta principal
router.get('/', (req, res) => {
    res.render('bienvenido');
});

// Catálogo para clientes
router.get('/productos', productoController.listarCatalogo);

// Login Admin
router.get('/admin/login', (req, res) => {
    res.render('login');
});

// Validación del login (Redirige obligatoriamente al controlador de productos)
// Validación del login
router.post('/admin/login', (req, res) => {
    const correo = req.body.correo;
    const contrasena = req.body.contrasena;

    if (correo === "admin@gmail.com" && contrasena === "1234") {
        res.redirect('/admin/productos'); // <--- CAMBIAR res.render("dashboard") POR ESTO
    } else {
        res.send("Correo o contraseña incorrectos.");
    }
});

// Redirigir el dashboard general a la gestión de productos
router.get('/admin/dashboard', (req, res) => {
    res.redirect('/admin/productos');
});

// Gestión de productos Admin (Carga la vista con la variable productos asegurada)
router.get('/admin/productos', productoController.listarProductosAdmin);
router.get('/admin/productos/alta', (req, res) => { res.render('altaProducto'); });
router.post('/admin/productos/alta', productoController.agregarProducto);

// Editar producto
router.get('/admin/productos/editar/:id', productoController.formEditarProducto);
router.post('/admin/productos/editar/:id', productoController.actualizarProducto);

// Baja lógica / Reactivación
router.post('/admin/productos/estado/:id', productoController.cambiarEstadoProducto);

// API JSON
router.get('/api/productos', productoController.listarJSON);

module.exports = router;