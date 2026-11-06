const Producto = require('../models/productoModel');

const productoController = {
    // Renderiza la vista EJS trayendo los datos de Sequelize
    listarCatalogo: async (req, res) => {
        try {
            let productos = await Producto.findAll();
            
            // Si la base de datos está vacía, inserta los productos por defecto de tu kiosco
            if (productos.length === 0) {
                await Producto.bulkCreate([
                    { nombre: "Auriculares In-Ear con Micrófono", tipo: "perifericos", precio: 8500.00 },
                    { nombre: "Cable USB-C Carga Rápida 1m", tipo: "perifericos", precio: 4200.00 },
                    { nombre: "Adaptador Multiport USB-C a HDMI", tipo: "perifericos", precio: 18900.00 },
                    { nombre: "Pendrive USB 3.0 64GB", tipo: "perifericos", precio: 9500.00 },
                    { nombre: "Mousepad Gaming XL Borde Cosido", tipo: "escritorio", precio: 11000.00 },
                    { nombre: "Soporte de Aluminio Plegable Celular", tipo: "escritorio", precio: 7800.00 },
                    { nombre: "Organizador de Cables Silicona", tipo: "escritorio", precio: 3500.00 },
                    { nombre: "Lámpara LED de Escritorio USB", tipo: "escritorio", precio: 14500.00 }
                ]);
                productos = await Producto.findAll();
            }

            res.render('index', { productosDisponibles: productos });
        } catch (error) {
            console.error(error);
            res.status(500).send("Error al cargar el catálogo de productos");
        }
    },

    // Respuesta en JSON para cumplir con el requerimiento de API
    listarJSON: async (req, res) => {
        try {
            const productos = await Producto.findAll();
            res.json({ success: true, data: productos });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    agregarProducto: async (req, res) => {
        try {
            const nombre = req.body.nombre;
            const tipo = req.body.tipo;
            const precio = req.body.precio;

            await Producto.create({
                nombre: nombre,
                tipo: tipo,
                precio: precio
            });

            res.redirect('/admin/productos');

        } catch (error) {
            console.error(error);
            res.status(500).send("Error al agregar el producto");
        }
    },
    listarProductosAdmin: async (req, res) => {
    try {
        const productos = await Producto.findAll();

        res.render('dashboard', {
            productos: productos
        });

        } catch (error) {
            console.error(error);
            res.status(500).send("Error al cargar los productos");
        }
    },
    eliminarProducto: async (req, res) => {
        try {
            const id = req.params.id;

            await Producto.destroy({
                where: { id: id }
            });

            res.redirect('/admin/productos/eliminar');

        } catch (error) {
            console.error(error);
            res.status(500).send("Error al eliminar el producto");
        }
    }
};

module.exports = productoController;