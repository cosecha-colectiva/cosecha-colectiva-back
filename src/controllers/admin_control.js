const { query } = require("express");
const db = require("../../config/database");

const admin_control = {

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

    // POST para agregar una pregunta al catalogo de preguntas de seguridad
    agregar_catalogo_preguntas_seguridad: async (req, res) => {
        const { Pregunta } = req.body;
        if(Pregunta){
            let consulta = "SELECT * FROM preguntas_seguridad WHERE Pregunta = ?";
            const resultado = await db.query(consulta, [Pregunta]);
            if(resultado.length == 0){
                try{
                    const query = "INSERT INTO preguntas_seguridad (Pregunta) VALUES (?)";
                    db.query(query, [Pregunta]);
                    return res.json({ code: 200, message: 'Nueva pregunta agregada' }).status(200);
                }catch(err){
                    console.log(err);
                    return res.json({ code: 500, message: 'Error al crear pregunta' }).status(500);
                }
            }else{
                return res.json({ code: 500, message: 'Ya existe esta pregunta de seguridad' }).status(500);
            }
        }else{
            return res.json({ code: 500, message: 'Campos incompletos' }).status(500);
        }
    },
}

module.exports = admin_control;