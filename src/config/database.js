const { Sequelize } = require('sequelize');

// Conexión usando SQLite (crea un archivo local database.sqlite para que no tengas que configurar MySQL local si no lo tienes instalado)
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
});

module.exports = sequelize;