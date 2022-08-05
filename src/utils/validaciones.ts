import bcrypt from "bcrypt";
import { RowDataPacket } from "mysql2";
import random from 'string-random';
import db from "../config/database";

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
            const [rows] = (await db.query(query, [rand])) as [Grupo[], any];

            if (rows.length == 0) {
                return resolve(rand);
            }

            if (cont++ >= 10) return resolve("-");
        }
    });
}

// Funcion para saber si un json tiene campos como undefined
export const campos_incompletos = ( objeto) => {
    for (let key in objeto) {
        if (objeto[key] === undefined) {
            console.log(key);
            return true;
        }
    }

    return false;
}

// Valida si el grupo existe en la BD
export const existe_grupo = async ( Grupo_id) => {
    let query = "SELECT * FROM grupos WHERE Codigo_grupo = ? or Grupo_id = ?";
    const [grupo] =  (await db.query(query, [Grupo_id, Grupo_id])) as [Grupo[], any];

    if (grupo.length != 0) {
        return grupo[0];
    }

    throw "No existe el Grupo con el Id: " + Grupo_id;
};

// Valida si el socio existe en la BD
export const existe_socio = async ( Socio_id) => {
    let query = "SELECT * FROM socios WHERE Socio_id = ?";
    const  [socio] =  (await db.query(query, [Socio_id])) as [Socio[], any];

    if (socio.length != 0) {
        return socio[0];
    }

    throw "No existe el socio con el Id: " + Socio_id;
}

// Verificar que el socio esté en el grupo
export const socio_en_grupo = async (Socio_id, Grupo_id) => {
    let query = "SELECT * FROM grupo_socio WHERE Socio_id = ? and Grupo_id = ? and Status = 1";
    const [socio_grupo] =  (await db.query(query, [Socio_id, Grupo_id])) as [GrupoSocio[], any];

    if (socio_grupo.length != 0) {
        return socio_grupo[0];
    }

    throw "El socio con id " + Socio_id + " no está en e grupo con el id " + Grupo_id;
}

export const existe_sesion = async ( Sesion_id) => {
    let query = "SELECT * FROM sesiones WHERE Sesion_id = ?";
    const [sesion] =  (await db.query(query, [Sesion_id])) as [Sesion[], any];

    if (sesion.length != 0) {
        return sesion[0];
    }

    throw "No existe la sesion con el Id: " + Sesion_id;
}

export const existe_multa = async ( Multa_id) => {
    let query = "SELECT * FROM multas WHERE Multa_id = ?";
    const [multa] =  (await db.query(query, [Multa_id])) as [Multa[], any];

    if (multa.length != 0) {
        return multa[0];
    }

    throw "No existe la multa con el Id: " + Multa_id;
}

export const existe_Acuerdo = async ( Acuerdo_id) => {
    let query = "SELECT * FROM acuerdos WHERE Acuerdo_id = ?";
    const [acuerdo] =  (await db.query(query, [Acuerdo_id])) as [Acuerdo[], any];

    if (acuerdo.length != 0) {
        return acuerdo[0];
    }

    throw "No existe el acuerdo con el Id: " + Acuerdo_id;
}

export const obtener_acuerdo_actual = async ( Grupo_id) => {
    let query = "SELECT * FROM acuerdos WHERE Grupo_id = ? and Status = 1";
    const [acuerdo] =  (await db.query(query, [Grupo_id])) as [Acuerdo[], any];

    if (acuerdo.length != 0) {
        return acuerdo[0];
    }

    throw "No hay un acuerdo vigente para este grupo";
}

/**
 * @param {string} respuesta
 */
export function aplanar_respuesta(respuesta) {
    return respuesta.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export const actualizar_password = async (Socio_id, Password) => {
    return (await db.query(
        "Update Socios set password = ? where Socio_id = ?",
        [bcrypt.hashSync(Password, 10), Socio_id]
    ));
}

export const catch_common_error = ( error) => {
    if (typeof (error) === "string") {
        return { code: 400, message: error };
    }
    
    if ("code" in error && "message" in error && typeof (error["code"]) === "number") {
        return error;
    }

    return { message: "Error interno del servidor", code: 500 };
}

export const existe_pregunta = async ( Pregunta_id) => {
    let query = "SELECT * FROM preguntas_seguridad WHERE preguntas_seguridad_id = ?";
    const [pregunta] = (await db.query(query, [Pregunta_id])) as [PreguntaSeguridad[], any];

    if (pregunta.length != 0) {
        return pregunta[0];
    }

    throw "No hay un pregunta con el id: " + Pregunta_id;
}


export const tiene_permiso = async (Socio_id: number, Grupo_id: number) => {
    // relacion = obtener campo de la tabla "grupo_socio"
    const relacion = await socio_en_grupo(Socio_id, Grupo_id);
    // si relacion.tipo === "Admin"
    if (relacion.Tipo_socio === "ADMIN") {
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

interface SociosPrestamo {
    Socio_id: number,
    Nombres: string,
    Apellidos: string, 
    puede_pedir: 1 | 0,
    message: string
    Limite_credito_disponible?: number
}
// 
export const prestamos_multiples = async (Grupo_id,  lista_socios) => {
    let lista_socios_prestamo: SociosPrestamo[] = []; //{{"Socio_id" : 1, "Nombres" : "Ale", "Apellidos" : "De Alvino", "puede_pedir" : 0, "message": "Ya tiene un prestamo vigente" }} ----> prestamo en 0 significa que no puede pedir prestamo, si esta en 1 es que si puede pedir un prestamo 
    if(!Grupo_id || !lista_socios){
        return []; // corregir a tipo error
    }
    let query = "SELECT * FROM acuerdos WHERE Grupo_id = ? AND Status = 1";
    const {Ampliacion_prestamos, Limite_credito} = ( ((await db.query(query, [Grupo_id]))[0]))[0];
    
    //asegurarse que no haya excedido su limite de credito
    for (let i = 0; i < lista_socios.length; i++) {
        await socio_en_grupo(lista_socios[i].Socio_id, Grupo_id)//tal vez esta validacion este demas
        //Buscamos todos los prestamos activos que tenga y sumamos las cantidades
        let socio = lista_socios[i];
        let query3 = "SELECT * FROM prestamos WHERE Socio_id = ? AND Estatus_prestamo = 0";
        const prestamos =  ((await db.query(query3, [socio.Socio_id]))[0]) as Prestamo[];
        if (prestamos.length <= 0) {
            //puede pedir por que ni siquiera tiene algun prestamo
            lista_socios_prestamo.push({ "Socio_id": socio.Socio_id, "Nombres": socio.Nombres, "Apellidos": socio.Apellidos, "puede_pedir": 1, "message": "", "Limite_credito_disponible" : (socio.Acciones * Limite_credito) });
        } else {
            //si no se permiten prestamos multiples mandar que no puede pedir otro prestamo
            if (Ampliacion_prestamos === 0) { // [{},{}...] -> 
                lista_socios_prestamo.push({ "Socio_id": socio.Socio_id, "Nombres": socio.Nombres, "Apellidos": socio.Apellidos, "puede_pedir": 0, "message": "Ya tiene un prestamo vigente" });
            }else{
                let total_prestamos = 0;
                for (let i = 0; i < prestamos.length; i++) {
                    prestamos.forEach((prestamo) => {
                        total_prestamos = total_prestamos + prestamo.Monto_prestamo;
                    })
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
    return lista_socios_prestamo;
}


export const validar_password = async (Socio_id, Password) => {
    let query = "SELECT * FROM socios WHERE Socio_id = ?";
    let result = (await db.query(query, [Socio_id]))[0] as Socio[];

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

export const obtener_sesion_activa = async ( Grupo_id) => {
    let query = "SELECT * FROM sesiones WHERE sesiones.Activa = TRUE AND sesiones.Grupo_id = ? ORDER BY sesiones.Sesion_id DESC LIMIT 1";
    const sesiones =  (await db.query(query, Grupo_id))[0] as Sesion[];

    if (sesiones.length > 0) {
        return sesiones[0];
    }

    throw "No hay una sesion en curso para el grupo " + Grupo_id;
}

export const obtener_acuerdos_activos = async ( Grupo_id) => {
    let query = "SELECT * FROM acuerdos WHERE Grupo_id = ? AND Status = 1 DESC LIMIT 1";
    const acuerdos =  (await db.query(query, Grupo_id))[0] as Acuerdo[];

    if (acuerdos.length > 0) {
        return acuerdos[0];
    }

    throw "No hay acuerdos activos para el grupo" + Grupo_id;
}