const jwt = require('jsonwebtoken');
const JWT_SECRET = 'secreto_tp_integrador_utn';

const verificarToken = (req, res, next) => {
    const token = req.cookies.tokenAdmin;

    if (!token) {
        return res.redirect('/admin/login');
    }

    try {
        const verificado = jwt.verify(token, JWT_SECRET);
        req.admin = verificado;
        next();
    } catch (error) {
        res.clearCookie('tokenAdmin');
        return res.redirect('/admin/login');
    }
};

module.exports = verificarToken;