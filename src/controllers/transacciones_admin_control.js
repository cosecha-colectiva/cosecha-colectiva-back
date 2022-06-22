const { query } = require("express");
const db = require("../../config/database");

const transacciones_control = {

    // POST para agregar tipos de transaccion
    agregar_catalogo_transaccion: async (req, res) => {
        const { Catalogo_id, Tipo } = req.body;
        if(Catalogo_id && Tipo){
            let consulta = "SELECT * FROM catalogo_transacciones WHERE Catalogo_id = ?";
            const resultado = await db.query(consulta, [Catalogo_id]);
            if(resultado.length == 0){
                try{
                    const query = "INSERT INTO catalogo_transacciones (Catalogo_id, Tipo) VALUES (?, ?)";
                    db.query(query, [Catalogo_id, Tipo]);
                    return res.json({ code: 200, message: 'Nuevo tipo de transaccion agregado' }).status(200);
                }catch(err){
                    console.log(err);
                    return res.json({ code: 500, message: 'Error al crear catalogo' }).status(500);
                }
            }else{
                return res.json({ code: 500, message: 'Ya existe esta transaccion' }).status(500);
            }
        }else{
            return res.json({ code: 500, message: 'Campos incompletos' }).status(500);
        }
    },
}

module.exports = transacciones_control;