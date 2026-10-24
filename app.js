const express = require('express');
const path = require('path');
const app = express();
const sequelize = require('./src/config/database');
const productoRoutes = require('./src/routes/productoRoutes');

// 1. Motor de vistas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// 2. Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Lee tu CSS y JS de cliente

// 3. Ruteo
app.use('/', productoRoutes);

// 4. Conexión a la Base de Datos y arranque del servidor
const PORT = 3000;
sequelize.sync().then(() => {
    console.log('Base de datos conectada correctamente con Sequelize');
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Error al conectar con la base de datos:', err);
});