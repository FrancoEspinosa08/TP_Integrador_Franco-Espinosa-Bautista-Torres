const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Producto = sequelize.define('Producto', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tipo: {
        type: DataTypes.STRING, // 'perifericos' o 'escritorio'
        allowNull: false
    },
    precio: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    imagen: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'default.png'
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
        validate: {
            min: {
                args: [0],
                msg: "El stock no puede ser negativo."
            }
        }
    }, // <--- Acá estaba el detalle de la coma que faltaba separar de la siguiente propiedad
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    tableName: 'productos',
    timestamps: false
});

module.exports = Producto;

module.exports = Producto;