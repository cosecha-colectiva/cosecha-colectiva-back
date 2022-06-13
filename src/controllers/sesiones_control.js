const db = require("../../config/database");

/* Estructura de tabla sesiones
Sesion_id
Fecha_sesion
Caja
Grupo_id
*/

/* Estructura de la tabla Asistencias
Asistencia_id
Presente
Sesion_id
Socio_id
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

// registrar asistencias de un grupo
//recibe el id de la sesion y un array de json con {Socio_id, Presente}
export const registrar_asistencias = async (req, res) => {
    const {session_id, socios} = req.body;

    //comprobar que haya session_id y socios
    if(session_id && socios){
        //registrar asistencias
        try{
            for(let i = 0; i < socios.length; i++){
                let query = "INSERT INTO asistencias (Presente, Sesion_id, Socio_id) VALUES (?, ?, ?)";
                await db.query(query, [socios[i].Presente, session_id, socios[i].Socio_id]);
            }
            res.json({code: 200, message: 'Asistencias registradas'}).status(200);
        }catch(err){
            res.json({code: 500, message: 'Error al registrar asistencias'}).status(500);
        }
    }else{
        // campos incompletos
        res.json({code: 400, message: 'Campos incompletos'}).status(400);
    }

    /* Codigos de respuesta
    200: Asistencias registradas
    400: Campos incompletos
    500: Error al registrar asistencias
    */

    /* Json de prueba
    {
        "session_id": 4,
        "socios": [
            {
                "Socio_id": 54,
                "Presente": 1
            },
            {
                "Socio_id": 64,
                "Presente": 0
            }
        ]
    }
    */
}

// Actualizar caja de sesion
// export const actualizar_caja = async (req, res) => {
//     const {Caja, Sesion_id} = req.body;

//     //comprobar que haya Caja y Sesion_id
//     if(Caja && Sesion_id){
//         //actualizar caja
//         try{
//             let query = "UPDATE sesiones SET Caja = ? WHERE Sesion_id = ?";
//             await db.query(query, [Caja, Sesion_id]);
//             res.json({code: 200, message: 'Caja actualizada'}).status(200);
//         }catch(err){
//             res.json({code: 500, message: 'Error al actualizar caja'}).status(500);
//         }
//     }else{
//         // campos incompletos
//         res.json({code: 400, message: 'Campos incompletos'}).status(400);
//     }

//     /* Codigos de respuesta
//     200: Caja actualizada
//     400: Campos incompletos
//     500: Error al actualizar caja
//     */

//     /* Json de prueba
//     {
//         "Caja": 100,
//         "Sesion_id": 4 
//     }
//     */
// }

// registrar asistencia individual
// export const registrar_asistencia = async (req, res) => {
//     const {Presente, Sesion_id, Socio_id} = req.body;

//     //comprobar que haya Presente, Sesion_id y Socio_id
//     if(Presente && Sesion_id && Socio_id){
//         //registrar asistencia
//         try{
//             let query = "INSERT INTO asistencias (Presente, Sesion_id, Socio_id) VALUES (?, ?, ?)";
//             await db.query(query, [Presente, Sesion_id, Socio_id]);
//             res.json({code: 200, message: 'Asistencia registrada'}).status(200);
//         }catch(err){
//             res.json({code: 500, message: 'Error al registrar asistencia'}).status(500);
//         }
//     }else{
//         // campos incompletos
//         res.json({code: 400, message: 'Campos incompletos'}).status(400);
//     }

//     /* Codigos de respuesta
//     200: Asistencia registrada
//     400: Campos incompletos
//     500: Error al registrar asistencia
//     */

//     /* Json de prueba
//     {
//         "Presente": 1,
//         "Sesion_id": 4,
//         "Socio_id": 54
//     }
//     */
// }

