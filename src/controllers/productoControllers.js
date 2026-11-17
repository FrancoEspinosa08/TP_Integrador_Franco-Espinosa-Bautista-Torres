const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Producto, Venta, DetalleVenta, Usuario } = require('../models/asociaciones');
const puppeteer = require('puppeteer');

const JWT_SECRET = 'secreto_tp_integrador_utn';
let ultimoTicket = null;

const productoController = {
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
            const { nombre, tipo, precio, stock } = req.body;
            let stockNum = parseInt(stock) || 10;
            
            let rutaImagen = '/img/default.png';
            if (req.file) {
                rutaImagen = '/img/' + req.file.filename;
            }

            let esActivo = stockNum > 0;

            await Producto.create({
                nombre,
                tipo,
                precio,
                stock: stockNum,
                imagen: rutaImagen,
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
            const paginaActual = parseInt(req.query.page) || 1;
            const buscarId = req.query.buscarId ? parseInt(req.query.buscarId) : null;
            const limite = 5;
            const desplazamiento = (paginaActual - 1) * limite;

            let queryOptions = {
                limit: limite,
                offset: desplazamiento,
                order: [['id', 'ASC']]
            };

            if (buscarId) {
                queryOptions.where = { id: buscarId };
            }

            const { count, rows: productos } = await Producto.findAndCountAll(queryOptions);
            const totalPaginas = Math.ceil(count / limite) || 1;

            res.render('dashboardProductos', {
                productos,
                paginaActual,
                totalPaginas,
                buscarId: buscarId || ''
            });
        } catch (error) {
            console.error(error);
            res.status(500).send("Error al cargar los productos del administrador");
        }
    },

    formEditarProducto: async (req, res) => {
        try {
            const producto = await Producto.findByPk(req.params.id);
            res.render('editarProducto', { producto });
        } catch (error) {
            res.status(500).send("Error al cargar el producto para editar");
        }
    },

    actualizarProducto: async (req, res) => {
        try {
            const { nombre, tipo, precio, stock } = req.body;
            let stockNum = parseInt(stock);

            const productoExistente = await Producto.findByPk(req.params.id);

            let rutaImagen = productoExistente.imagen;
            if (req.file) {
                rutaImagen = '/img/' + req.file.filename;
            }

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
                imagen: rutaImagen,
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

    cambiarEstadoProducto: async (req, res) => {
        try {
            const producto = await Producto.findByPk(req.params.id);
            if (producto) {
                const nuevoEstado = !producto.activo;
                producto.activo = nuevoEstado;

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

            const fechaStr = new Date().toLocaleString('es-AR');

            // 1. Crear la Venta principal en la base de datos
            const nuevaVenta = await Venta.create({
                nombreCliente: nombre,
                total: total,
                fecha: fechaStr
            });

            // 2. Guardar en la tabla intermedia (DetalleVenta) y actualizar stock de cada producto
            for (let item of productos) {
                const productoDb = await Producto.findByPk(item.id);
                if (productoDb) {
                    await DetalleVenta.create({
                        ventaId: nuevaVenta.id,
                        productoId: productoDb.id,
                        cantidad: item.cantidad,
                        precioUnitario: productoDb.precio
                    });

                    productoDb.stock -= item.cantidad;
                    if (productoDb.stock <= 0) {
                        productoDb.stock = 0;
                        productoDb.activo = false;
                    }
                    await productoDb.save();
                }
            }

            ultimoTicket = {
                nombre, productos, total, fecha: fechaStr, empresa: "Kiosco Tecnologico"
            };

            res.json({ success: true });

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

    generarPDF: async (req, res) => {
    if (!ultimoTicket) {
        return res.redirect('/productos');
    }

    try {
        const navegador = await puppeteer.launch({
            headless: true
        });

        const pagina = await navegador.newPage();

        const html = `
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial;
                        padding: 30px;
                    }
                    h1, h2 {
                        text-align: center;
                    }
                    .total {
                        font-size: 18px;
                        font-weight: bold;
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <h1>TICKET DE COMPRA</h1>
                <h2>Kiosco Tecnologico</h2>

                <p>Cliente: ${ultimoTicket.nombre}</p>
                <p>Fecha: ${ultimoTicket.fecha}</p>

                <hr>

                ${ultimoTicket.productos.map(producto => `
                    <p>
                        ${producto.cantidad} x ${producto.nombre}
                        - $${(producto.precio * producto.cantidad).toFixed(2)}
                    </p>
                `).join('')}

                <p class="total">
                    TOTAL: $${ultimoTicket.total.toFixed(2)}
                </p>
            </body>
            </html>
        `;

        await pagina.setContent(html);

        const pdf = await pagina.pdf({
            format: 'A4',
            printBackground: true
        });

        await navegador.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=ticket.pdf');

        res.send(pdf);

        } catch (error) {
            console.error(error);
            res.status(500).send('Error al generar el PDF');
        }
    },

    validarLoginAdmin: async (req, res) => {
        try {
            const { correo, contrasena } = req.body;

            let usuario = await Usuario.findOne({ where: { correo } });

            // Si el admin no existe en la BD, creamos uno por defecto con contraseña hasheada
            if (!usuario && correo === "admin@gmail.com") {
                const hashPassword = await bcrypt.hash("1234", 10);
                usuario = await Usuario.create({
                    correo: "admin@gmail.com",
                    contrasena: hashPassword
                });
            }

            if (!usuario) {
                return res.send("Correo o contraseña incorrectos.");
            }

            // Validar clave usando bcrypt
            const passwordValid = await bcrypt.compare(contrasena, usuario.contrasena);

            if (passwordValid) {
                // Generar token JWT con vigencia de 2 horas
                const token = jwt.sign({ id: usuario.id, correo: usuario.correo }, JWT_SECRET, { expiresIn: '2h' });

                // Guardar token en cookie segura y redirigir
                res.cookie('tokenAdmin', token, { httpOnly: true });
                return res.redirect('/admin/productos');
            } else {
                return res.send("Correo o contraseña incorrectos.");
            }
        } catch (error) {
            console.error(error);
            res.status(500).send("Error en el servidor durante el login");
        }
    }
};

module.exports = productoController;