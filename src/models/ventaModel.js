const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Venta = sequelize.define('Venta', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombreCliente: {
        type: DataTypes.STRING,
        allowNull: false
    },
    total: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    fecha: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'ventas',
    timestamps: true
});

module.exports = Venta;