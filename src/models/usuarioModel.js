const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Ajustá la ruta a tu conexión de Sequelize

const Usuario = sequelize.define('Usuario', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    correo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    contrasena: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'usuarios',
    timestamps: true
});

module.exports = Usuario;