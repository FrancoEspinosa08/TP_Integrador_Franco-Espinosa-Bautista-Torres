const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const productoController = require('../controllers/productoControllers');

// Importamos el middleware de protección JWT
const verificarToken = require('../middlewares/authMiddlewares');

// Configuración de multer para las imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- RUTAS PÚBLICAS (No piden token) ---
router.get('/', (req, res) => {
    res.render('bienvenido');
});

router.get('/productos', productoController.listarCatalogo);

router.get('/admin/login', (req, res) => {
    res.render('login');
});

router.post('/admin/login', productoController.validarLoginAdmin);

router.get('/api/productos', productoController.listarJSON);

router.post('/compra', productoController.procesarCompra);
router.get('/compra/ticket', productoController.mostrarTicket);
router.get('/compra/pdf', productoController.generarPDF);


// --- RUTAS PROTEGIDAS (Exigen el token JWT mediante 'verificarToken') ---

// Redirigir el dashboard general a la gestión de productos de forma segura
router.get('/admin/dashboard', verificarToken, (req, res) => {
    res.redirect('/admin/productos');
});

// Listar productos en el panel de control
router.get('/admin/productos', verificarToken, productoController.listarProductosAdmin);

// Formulario de alta y procesamiento de nuevo producto
router.get('/admin/productos/alta', verificarToken, (req, res) => { 
    res.render('altaProducto'); 
});
router.post('/admin/productos/alta', verificarToken, upload.single('imagenArchivo'), productoController.agregarProducto);

// Formulario de edición y procesamiento de actualización de producto
router.get('/admin/productos/editar/:id', verificarToken, productoController.formEditarProducto);
router.post('/admin/productos/editar/:id', verificarToken, upload.single('imagenArchivo'), productoController.actualizarProducto);

// Cambio de estado (Baja lógica / Reactivación)
router.post('/admin/productos/estado/:id', verificarToken, productoController.cambiarEstadoProducto);

// Ruta para cerrar sesión del admin
router.get('/admin/logout', (req, res) => {
    res.clearCookie('tokenAdmin');
    res.redirect('/admin/login');
});

module.exports = router;