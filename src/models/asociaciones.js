const Producto = require('./productoModel');
const Venta = require('./ventaModel');
const DetalleVenta = require('./detalleVentaModel');
const Usuario = require('./usuarioModel');

// Definir la relación Muchos a Muchos entre Producto y Venta mediante DetalleVenta
Producto.belongsToMany(Venta, { through: DetalleVenta, foreignKey: 'productoId' });
Venta.belongsToMany(Producto, { through: DetalleVector = DetalleVenta, foreignKey: 'ventaId' }); // (o foreignKey: 'ventaId')

module.exports = {
    Producto,
    Venta,
    DetalleVenta,
    Usuario
};