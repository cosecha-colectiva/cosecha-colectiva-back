const db = require("../../config/database");

/* Estructura de tabla sesiones
Sesion_id
Fecha_sesion
Caja -- got from caja of previous session by a query to db
Grupo_id
*/

//crear nueva sesion
export const crear_sesion = async (req, res) => {
    const Fecha_sesion = Fecha_actual();
    
    // obtener caja final de la sesion anterior
    let query = "SELECT Caja FROM sesiones WHERE Grupo_id = ? ORDER BY Fecha_sesion DESC LIMIT 1";
    const rows = await db.query(query, [req.body.Grupo_id]);
    const Caja = rows[0].Caja || 0;

    //obtener id del grupo del body
    const Grupo_id = req.body.Grupo_id;

    //comprobar que haya Grupo_id
    if(Grupo_id){
        //insertar sesion
        try{
            let query = "INSERT INTO sesiones (Fecha_sesion, Caja, Grupo_id) VALUES (?, ?, ?)";
            await db.query(query, [Fecha_sesion, Caja, Grupo_id]);
            res.json({code: 200, message: 'Sesion creada'}).status(200);
        }catch(err){
            res.json({code: 500, message: 'Error al crear sesion'}).status(500);
        }
    }else{
        // campos incompletos
        res.json({code: 400, message: 'Campos incompletos'}).status(400);
    }

    /* Codigos de respuesta
    200: Sesion creada
    400: Campos incompletos
    500: Error al crear sesion
    */

    /* Json de prueba 
    {
        "Grupo_id": 4
    }
    */
}

// Actualizar caja de sesion
export const actualizar_caja = async (req, res) => {
    const {Caja, Sesion_id} = req.body;

    //comprobar que haya Caja y Sesion_id
    if(Caja && Sesion_id){
        //actualizar caja
        try{
            let query = "UPDATE sesiones SET Caja = ? WHERE Sesion_id = ?";
            await db.query(query, [Caja, Sesion_id]);
            res.json({code: 200, message: 'Caja actualizada'}).status(200);
        }catch(err){
            res.json({code: 500, message: 'Error al actualizar caja'}).status(500);
        }
    }else{
        // campos incompletos
        res.json({code: 400, message: 'Campos incompletos'}).status(400);
    }

    /* Codigos de respuesta
    200: Caja actualizada
    400: Campos incompletos
    500: Error al actualizar caja
    */

    /* Json de prueba
    {
        "Caja": 100,
        "Sesion_id": 4 
    }
    */
}
