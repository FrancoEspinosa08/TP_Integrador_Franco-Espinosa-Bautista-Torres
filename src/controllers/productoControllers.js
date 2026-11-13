const Producto = require('../models/productoModel');
const PDFDocument = require('pdfkit');

let ultimoTicket = null;

const productoController = {
    // Listar catálogo para clientes (solo productos activos)
    listarCatalogo: async (req, res) => {
        try {
            let productos = await Producto.findAll({ where: { activo: true } });
            
            if (productos.length === 0) {
                await Producto.bulkCreate([
                    { nombre: "Auriculares In-Ear con Micrófono", tipo: "perifericos", precio: 8500.00, stock: 15, imagen: "/img/AuricularesInEarConMicrofono.jpg", activo: true },
                    { nombre: "Cable USB-C Carga Rápida", tipo: "perifericos", precio: 4200.00, stock: 30, imagen: "/img/CableUsbCCargaRápida.webp", activo: true },
                    { nombre: "Adaptador USB-C a HDMI", tipo: "perifericos", precio: 18900.00, stock: 10, imagen: "/img/AdaptadorUsbCAHdmi.webp", activo: true },
                    { nombre: "Pendrive USB-C 64GB", tipo: "perifericos", precio: 9500.00, stock: 25, imagen: "/img/PendriveUsbC64gb.jpg", activo: true },
                    { nombre: "Mousepad", tipo: "escritorio", precio: 11000.00, stock: 20, imagen: "/img/Mousepad.jpg", activo: true },
                    { nombre: "Soporte Aluminio Plegable", tipo: "escritorio", precio: 7800.00, stock: 12, imagen: "/img/SoporteAluminioPlegable.webp", activo: true },
                    { nombre: "Organizador de cables", tipo: "escritorio", precio: 3500.00, stock: 40, imagen: "/img/Organizador De Cables.webp", activo: true },
                    { nombre: "Lámpara LED Escritorio USB", tipo: "escritorio", precio: 14500.00, stock: 8, imagen: "/img/LamparaLedEscritorioUSB.jpg", activo: true }
                ]);
                productos = await Producto.findAll({ where: { activo: true } });
            }

            res.render('index', { productosDisponibles: productos });
        } catch (error) {
            console.error(error);
            res.status(500).send("Error al cargar el catálogo de productos");
        }
    },

    listarJSON: async (req, res) => {
        try {
            const productos = await Producto.findAll({ where: { activo: true } });
            res.json({ success: true, data: productos });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    agregarProducto: async (req, res) => {
        try {
            const { nombre, tipo, precio, stock, imagen } = req.body;
            let stockNum = parseInt(stock) || 10;
            
            // Regla de negocio: Si se crea con stock 0, nace inactivo
            let esActivo = stockNum > 0;

            await Producto.create({
                nombre,
                tipo,
                precio,
                stock: stockNum,
                imagen: imagen || '/img/default.png',
                activo: esActivo
            });
            res.redirect('/admin/productos');
        } catch (error) {
            console.error(error);
            res.status(500).send("Error al agregar el producto");
        }
    },

    listarProductosAdmin: async (req, res) => {
        try {
            // El admin ve todos (activos e inactivos para poder reactivarlos)
            const productos = await Producto.findAll();
            res.render('dashboardProductos', { productos });
        } catch (error) {
            console.error(error);
            res.status(500).send("Error al cargar los productos del administrador");
        }
    },

    // Formulario de edición
    formEditarProducto: async (req, res) => {
        try {
            const producto = await Producto.findByPk(req.params.id);
            res.render('editarProducto', { producto });
        } catch (error) {
            res.status(500).send("Error al cargar el producto para editar");
        }
    },

    // Actualizar producto (imagen, precio, stock y regla de stock <= 0)
    actualizarProducto: async (req, res) => {
        try {
            const { nombre, tipo, precio, stock, imagen } = req.body;
            let stockNum = parseInt(stock);

            // Validación: Si el stock es 0 o menor, se fuerza a 0 y se da de baja lógica (activo: false)
            let nuevoActivo = true;
            if (stockNum <= 0) {
                stockNum = 0;
                nuevoActivo = false;
            }

            await Producto.update({
                nombre,
                tipo,
                precio,
                stock: stockNum,
                imagen,
                activo: nuevoActivo
            }, {
                where: { id: req.params.id }
            });

            res.redirect('/admin/productos');
        } catch (error) {
            console.error(error);
            res.status(500).send("Error al actualizar el producto");
        }
    },

    // Baja lógica / Reactivación (cambiar activo a false/true)
    cambiarEstadoProducto: async (req, res) => {
        try {
            const producto = await Producto.findByPk(req.params.id);
            if (producto) {
                const nuevoEstado = !producto.activo; // Alterna entre true y false
                producto.activo = nuevoEstado;

                // Si se da de alta (true) y su stock es 0, se fuerza a 1 automáticamente
                if (nuevoEstado && producto.stock <= 0) {
                    producto.stock = 1;
                }

                await producto.save();
            }
            res.redirect('/admin/productos');
        } catch (error) {
            console.error(error);
            res.status(500).send("Error al cambiar el estado del producto");
        }
    },

    procesarCompra: async (req, res) => {
        try {
            const { nombre, productos } = req.body;

            if (!nombre || !productos || productos.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Datos de compra incompletos."
                });
            }

            let total = 0;

            productos.forEach(producto => {
                total += producto.precio * producto.cantidad;
            });

            const fecha = new Date().toLocaleString('es-AR');

            ultimoTicket = {
                nombre, productos, total, fecha, empresa: "Kiosco Tecnologico"
            };

            res.json({
                success: true
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Error al procesar la compra."
            });
        }
    },

    mostrarTicket: (req, res) => {
        if (!ultimoTicket) {
            return res.redirect('/productos');
        }

        res.render('ticket', { ticket: ultimoTicket });
    },

    generarPDF: (req, res) => {
        if (!ultimoTicket) {
            return res.redirect('/productos');
        }

        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=ticket.pdf');

        doc.pipe(res);

        doc.fontSize(20).text('TICKET DE COMPRA', { align: 'center' });
        doc.moveDown();

        doc.fontSize(14).text('Kiosco Tecnologico', {align: 'center'});

        doc.fontSize(12).text('Cliente: ' + ultimoTicket.nombre);
        doc.text('Fecha: ' + ultimoTicket.fecha);
        doc.moveDown();

        ultimoTicket.productos.forEach(producto => {
            doc.text(
                producto.cantidad + ' x ' + producto.nombre +
                ' - $' + (producto.precio * producto.cantidad).toFixed(2)
            );
        });

        doc.moveDown();
        doc.fontSize(16).text('TOTAL: $' + ultimoTicket.total.toFixed(2));

        doc.end();
    },

    validarLoginAdmin: async (req, res) => {
        const { correo, contrasena } = req.body;

        if (correo === "admin@gmail.com" && contrasena === "1234") {
            try {
                const productos = await Producto.findAll();
                res.render('dashboardProductos', { productos });
            } catch (error) {
                console.error(error);
                res.status(500).send("Error al cargar el panel de administración");
            }
        } else {
            res.send("Correo o contraseña incorrectos.");
        }
    }
};

module.exports = productoController;