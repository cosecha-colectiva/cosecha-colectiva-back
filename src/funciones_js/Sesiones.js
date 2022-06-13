const db = require("../../config/database")

const actualizar_caja = async (sesion_id, monto) => {
    // sumar o restar monto de Caja_cierre
    const query = "UPDATE sesiones SET Caja_cierre = Caja_cierre + ? WHERE Sesion_id = ?";

    db.query(query, [monto, sesion_id])
        .then(result => {
            return { code: 200, message: 'Caja actualizada' };
        })
        .catch(err => {
            return { code: 500, message: 'Error al actualizar caja' };
        });
}

module.exports = { 
    actualizar_caja,
};