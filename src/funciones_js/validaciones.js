import bcrypt from "bcrypt";
const db = require('../../config/database');
const random = require('string-random');

export const validarCurp = function (curp) {
    const regex = /^([A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d])(\d)$/;
    if (regex.test(curp)) {
        return true;
    } else {
        return false;
    }
}

export const Fecha_actual = function () {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    return year + '-' + month + '-' + day;
}

export const generarCodigoValido = function () {
    return new Promise(async (resolve, reject) => {
        let cont = 0;
        while (true) {
            const rand = random(6, { letters: false });
            //comprobar que el codigo de grupo no exista
            let query = "SELECT * FROM grupos WHERE Codigo_grupo = ?";
            const [rows] = await db.query(query, [rand])

            if (rows.length == 0) {
                return resolve(rand);
            }

            if (cont++ >= 10) return resolve("-");
        }
    });
}

// Funcion para saber si un json tiene campos como undefined
export const campos_incompletos = (objeto) => {
    for (let key in objeto) {
        if (objeto[key] === undefined) {
            console.log(key);
            return true;
        }
    }

    return false;
}

// Valida si el grupo existe en la BD
export const existe_grupo = async (Grupo_id) => {
    let query = "SELECT * FROM grupos WHERE Codigo_grupo = ? or Grupo_id = ?";
    const [grupo] = await db.query(query, [Grupo_id, Grupo_id]);

    if (grupo.length != 0) {
        return grupo[0];
    }

    throw "No existe el Grupo con el Id: " + Grupo_id;
};

// Valida si el socio existe en la BD
export const existe_socio = async (Socio_id) => {
    let query = "SELECT * FROM socios WHERE Socio_id = ?";
    const [socio] = await db.query(query, [Socio_id]);

    if (socio.length != 0) {
        return socio[0];
    }

    throw "No existe el socio con el Id: " + Socio_id;
}

// Verificar que el socio esté en el grupo
export const socio_en_grupo = async (Socio_id, Grupo_id) => {
    let query = "SELECT * FROM grupo_socio WHERE Socio_id = ? and Grupo_id = ? and Status = 1";
    const [socio_grupo] = await db.query(query, [Socio_id, Grupo_id]);

    if (socio_grupo.length != 0) {
        return socio_grupo[0];
    }

    throw "El socio con id " + Socio_id + " no está en e grupo con el id " + Grupo_id;
}

export const existe_sesion = async (Sesion_id) => {
    let query = "SELECT * FROM sesiones WHERE Sesion_id = ?";
    const [sesion] = await db.query(query, [Sesion_id]);

    if (sesion.length != 0) {
        return sesion[0];
    }

    throw "No existe la sesion con el Id: " + Sesion_id;
}

export const existe_multa = async (Multa_id) => {
    let query = "SELECT * FROM multas WHERE Multa_id = ?";
    const [multa] = await db.query(query, [Multa_id]);

    if (multa.length != 0) {
        return multa[0];
    }

    throw "No existe la multa con el Id: " + Multa_id;
}

export const existe_Acuerdo = async (Acuerdo_id) => {
    let query = "SELECT * FROM acuerdos WHERE Acuerdo_id = ?";
    const [acuerdo] = await db.query(query, [Acuerdo_id]);

    if (acuerdo.length != 0) {
        return acuerdo[0];
    }

    throw "No existe el acuerdo con el Id: " + Acuerdo_id;
}

export const obtener_acuerdo_actual = async (Grupo_id) => {
    let query = "SELECT * FROM acuerdos WHERE Grupo_id = ? and Status = 1";
    const [acuerdo] = await db.query(query, [Grupo_id]);

    if (acuerdo.length != 0) {
        return acuerdo[0];
    }

    throw "No hay un acuerdo vigente para este grupo";
}
export function aplanar_respuesta(respuesta) {
    return respuesta.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export const actualizar_password = async (Socio_id, Password) => {
    return (await db.query(
        "Update Socios set password = ? where Socio_id = ?",
        [bcrypt.hashSync(Password, 10), Socio_id]
    ));
}

export const catch_common_error = (error) => {
    if ("code" in error && "message" in error && typeof (error["code"]) === "number") {
        return error;
    } else if (typeof (error) === "string") {
        return { code: 400, message: error };
    }

    return { message: "Error interno del servidor", code: 500 };
}

export const existe_pregunta = async (Pregunta_id) => {
    let query = "SELECT * FROM preguntas_seguridad WHERE preguntas_seguridad_id = ?";
    const [pregunta] = await db.query(query, [Pregunta_id]);

    if (pregunta.length != 0) {
        return pregunta[0];
    }

    throw "No hay un pregunta con el id: " + Pregunta_id;
}


export const tiene_permiso = async (Socio_id, Grupo_id) => {
    // relacion = obtener campo de la tabla "grupo_socio"
    let query = "SELECT * FROM grupo_socio WHERE Socio_id = ? AND Grupo_id = ? LIMIT 1";
    const [relacion] = await db.query(query, [Socio_id, Grupo_id]); // [[r1,r2,r3], fields]
    // si relacion.tipo === "Admin"
    if (relacion[0].Tipo_socio === "ADMIN") {
        // return true
        return true;
        // si no, si relacion.tipo === "Suplente"
    }
    // else if (relacion.Tipo_socio === "SUPLENTE"){
    //     // Validar que haya una sesion activa
    //     // sesion_activa()


    //     // obtener id del Admin
    //     // obtener asistencias de la sesion actual
    //     let query = "SELECT * FROM grupo_socio INNER JOIN asistencias ON grupo_socio.Socio_id = asistencias.Socio_id  WHERE grupo_socio.Tipo_socio = 'ADMIN' AND grupo_socio.Grupo_id = ? ORDER BY asistencias.Asistencia_id DESC LIMIT 1;"
    //     const [admin] = await db.query(query, [Grupo_id]);


    //     // Si el admin faltó
    //     if(admin[0] !== undefined && admin[0].Presente!==1){
    //         return true;
    //     }


    // }

    throw { code: 401, message: "El socio con el id: " + Socio_id + " no tiene permisos sobre el grupo con id: " + Grupo_id };
}

// export const prestamos_multiples = async (Grupo_id, lista_socios) => {
//     let lista_socios_prestamo = []; //{{"Socio_id" : 1, "Nombres" : "Ale", "Apellidos" : "De Alvino", "puede_pedir" : 0, "message": "Ya tiene un prestamo vigente" }} ----> prestamo en 0 significa que no puede pedir prestamo, si esta en 1 es que si puede pedir un prestamo 
//     let query = "SELECT Ampliacion_prestamos FROM acuerdos WHERE Grupo_id = ? AND Status = 1";
//     const [bool_ampliacion] = await db.query(query, [Grupo_id]);
//     //Verificar si se permiten prestamos multiples
//     if (bool_ampliacion === 0) {
//         //si no se permiten, entonces asegurarse que no tengan ya un prestamo activo
//         for (let i = 0; i < lista_socios.length; i++) {
//             for (let socio in lista_socios[i]) {
//                 await socio_en_grupo(socio.Socio_id, Grupo_id)
//                 let query = "SELECT * FROM prestamos WHERE Socio_id = ? AND Estatus_prestamo = 0";
//                 const [prestamo] = await db.query(query, [socio.Socio_id]);
//                 if (prestamo.length > 0) {
//                     //agregar el porque no puede pedir un prestamo
//                     lista_socios_prestamo.push({ "Socio_id": socio.Socio_id, "Nombres": socio.Nombres, "Apellidos": socio.Apellidos, "puede_pedir": 0, "message": "Ya tiene un prestamo vigente" });
//                 }
//                 else {
//                     //agregar al socio sin mensaje
//                     lista_socios_prestamo.push({ "Socio_id": socio.Socio_id, "Nombres": socio.Nombres, "Apellidos": socio.Apellidos, "puede_pedir": 1, "message": "" });
//                 }
//             }
//         }
//     } else {
//         //si si se permiten, entonces asegurarse que no haya excedido su limite de credito
//         for (let i = 0; i < lista_socios.length; i++) {
//             for (let socio in lista_socios[i]) {
//                 await socio_en_grupo(socio.Socio_id, Grupo_id)
//                 //Primero buscamos cuantas acciones tiene el socio
//                 // let acciones_socio = socio.Acciones;
//                 //Buscamos el limite de credito segun los acuerdos vijentes del grupo
//                 let query2 = "SELECT Limite_credito FROM acuerdos WHERE Grupo_id = ? AND Status = 1";
//                 const [Limite_credito] = await db.query(query, [socio.Grupo_id]);
//                 //Buscamos todos los prestamos activos que tenga y sumamos las cantidades
//                 let query3 = "SELECT * FROM prestamos WHERE Socio_id = ? AND Estatus_prestamo = 0";
//                 const [prestamos] = await db.query(query, [socio.Grupo_id]);
//                 if (prestamos.length <= 0) {
//                     //puede pedir por que ni siquiera tiene algun prestamo
//                     lista_socios_prestamo.push({ "Socio_id": socio.Socio_id, "Nombres": socio.Nombres, "Apellidos": socio.Apellidos, "puede_pedir": 1, "message": "" });
//                 } else {
//                     let total_prestamos = 0;
//                     for (let i = 0; i < prestamos.length; i++) {
//                         for (let prestamo in prestamos[i]) {
//                             total_prestamos = total_prestamos + (prestamo.Monto_prestamo - prestamo.Monto_pagado);
//                         }
//                         let puede_pedir = total_prestamos < (socio.Acciones * Limite_credito) ? 1 : 0;
//                         if (puede_pedir === 1) {
//                             //si puede pedir porque sus prestamos no superan su limite
//                             lista_socios_prestamo.push({ "Socio_id": socio.Socio_id, "Nombres": socio.Nombres, "Apellidos": socio.Apellidos, "puede_pedir": 1, "message": "" });
//                         } else {
//                             //agregar el porque no puede pedir un prestamo
//                             lista_socios_prestamo.push({ "Socio_id": socio.Socio_id, "Nombres": socio.Nombres, "Apellidos": socio.Apellidos, "puede_pedir": 0, "message": "Sus prestamos llegan a su limite de credito" });
//                         }
//                     }

//                 }
//             }
//         }
//     }
//     return lista_socios_prestamo;
// }


export const prestamos_multiples = async (Grupo_id, lista_socios) => {
    let lista_socios_prestamo = []; //{{"Socio_id" : 1, "Nombres" : "Ale", "Apellidos" : "De Alvino", "puede_pedir" : 0, "message": "Ya tiene un prestamo vigente" }} ----> prestamo en 0 significa que no puede pedir prestamo, si esta en 1 es que si puede pedir un prestamo 
    let query = "SELECT Ampliacion_prestamos FROM acuerdos WHERE Grupo_id = ? AND Status = 1";
    const [bool_ampliacion] = await db.query(query, [Grupo_id]);
    //Buscamos el limite de credito segun los acuerdos vijentes del grupo
    let query2 = "SELECT Limite_credito FROM acuerdos WHERE Grupo_id = ? AND Status = 1";
    const [Limite_credito] = await db.query(query, [Grupo_id]);
    //asegurarse que no haya excedido su limite de credito
    for (let i = 0; i < lista_socios.length; i++) {
        for (let socio in lista_socios[i]) {
            await socio_en_grupo(socio.Socio_id, Grupo_id)
            //Buscamos todos los prestamos activos que tenga y sumamos las cantidades
            let query3 = "SELECT * FROM prestamos WHERE Socio_id = ? AND Estatus_prestamo = 0";
            const [prestamos] = await db.query(query, [socio.Socio_id]);
            if (prestamos.length <= 0) {
                //puede pedir por que ni siquiera tiene algun prestamo
                lista_socios_prestamo.push({ "Socio_id": socio.Socio_id, "Nombres": socio.Nombres, "Apellidos": socio.Apellidos, "puede_pedir": 1, "message": "", "Limite_credito_disponible" : (socio.Acciones * Limite_credito) });
            } else {
                //si no se permiten prestamos multiples mardar que no puede pedir otro prestamo
                if (bool_ampliacion === 0) {
                    lista_socios_prestamo.push({ "Socio_id": socio.Socio_id, "Nombres": socio.Nombres, "Apellidos": socio.Apellidos, "puede_pedir": 0, "message": "Ya tiene un prestamo vigente" });
                }else{
                    let total_prestamos = 0;
                    for (let i = 0; i < prestamos.length; i++) {
                        for (let prestamo in prestamos[i]) {
                            total_prestamos = total_prestamos + prestamo.Monto_prestamo;
                        }
                        let puede_pedir = total_prestamos < (socio.Acciones * Limite_credito) ? 1 : 0;
                        let Limite_credito_disponible = (socio.Acciones * Limite_credito) - total_prestamos;
                        if (puede_pedir === 1) {
                            //si puede pedir porque sus prestamos no superan su limite
                            lista_socios_prestamo.push({ "Socio_id": socio.Socio_id, "Nombres": socio.Nombres, "Apellidos": socio.Apellidos, "puede_pedir": 1, "message": "", "Limite_credito_disponible": Limite_credito_disponible });
                        } else {
                            //agregar el porque no puede pedir un prestamo
                            lista_socios_prestamo.push({ "Socio_id": socio.Socio_id, "Nombres": socio.Nombres, "Apellidos": socio.Apellidos, "puede_pedir": 0, "message": "Sus prestamos llegan a su limite de credito" });
                        }
                    }
                }
            }
        }
    }
    return lista_socios_prestamo;
}


export const validar_password = async (Socio_id, Password) => {
    let query = "SELECT * FROM socios WHERE Socio_id = ?";
    let [result] = await db.query(query, [Username.toLowerCase()]);

    //validar que existe el usuario
    if (result.length > 0) {
        //validar que la contraseña sea correcta
        if (bcrypt.compareSync(Password, result[0].Password)) {
            return true;
        }
        else {
            return false
        }
    } else {
        return false
    }
}

export const obtener_sesion_activa = async (Grupo_id) => {
    let query = "SELECT * FROM sesiones WHERE sesiones.Activa = TRUE AND sesiones.Grupo_id = ? ORDER BY sesiones.Sesion_id DESC LIMIT 1";
    const [sesiones] = await db.query(query, Grupo_id);

    if (sesiones.length > 0) {
        return sesiones[0];
    }

    throw "No hay una sesion en curso para el grupo " + Grupo_id;
}

export const existe_prestamo = async (Prestamo_id) => {
    let query = "Select * from prestamos where Prestamo_id = ?";
    const prestamo = (await db.query(query, Prestamo_id))[0][0]

    if (prestamo) {
        return prestamo;
    }

    throw "No existe un prestamo con el id " + Prestamo_id;
}