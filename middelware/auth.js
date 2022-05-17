//auth
export const auth = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.status(400).json({
            code: 400,
            message: 'Usuario no autenticado'
        });
    }
}