/* const db = require("../../config/database")

const actualizar_caja = (sesion_id, monto) => {
    // sumar o restar monto de Caja_cierre
    const query = "UPDATE sesiones SET Caja_cierre = Caja_cierre + ? WHERE Sesion_id = ?";

    try{
        db.query(query, [monto, sesion_id]);
        return true;
    }
    catch(err){
        return false;
    }
}

module.exports = { 
    actualizar_caja,
}; */