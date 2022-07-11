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
    var month = now.getMonth()+1;
    var day = now.getDate();
    return year + '-' + month + '-' + day;
}

export const generarCodigoValido = function(){
    return new Promise(async (resolve, reject) => {
        while(true){
            const rand = random(6, {letters: false});
            //comprobar que el codigo de grupo no exista
            let query = "SELECT * FROM grupos WHERE Codigo_grupo = ?";
            const rows = await db.query(query, [rand])

            if(rows.length == 0){
                resolve(rand);
            }
        }
    });
}

// Funcion para saber si un json tiene campos como undefined
export const campos_incompletos = (objeto) => {
    for(let key in objeto){
        if(objeto[key] === undefined){
            console.log(key);
            return true;
        }
    }

    return false;
}

// Valida si el grupo existe en la BD
export const existe_grupo = async (Grupo_id) => {
    let query = "SELECT * FROM grupos WHERE Codigo_grupo = ? or Grupo_id = ?";
    const grupo = await db.query(query, [Grupo_id, Grupo_id]);

    if (grupo.length != 0) {
        return grupo[0];
    }
    
    throw "No existe el Grupo con el Id: " + Grupo_id;
};

// Valida si el socio existe en la BD
export const existe_socio = async (Socio_id) => {
    let query = "SELECT * FROM socios WHERE Socio_id = ?";
    const socio = await db.query(query, [Socio_id]);

    if (socio.length != 0) {
        return socio[0];
    }

    throw "No existe el socio con el Id: " + Socio_id;
}

// Verificar que el socio esté en el grupo
export const socio_en_grupo = async (Socio_id, Grupo_id) => {
    let query = "SELECT * FROM grupo_socio WHERE Socio_id = ? and Grupo_id = ? and Status = 1";
    const socio = await db.query(query, [Socio_id, Grupo_id]);

    if (socio.length != 0) {
        return socio[0];
    }

    throw "El socio con id " + Socio_id + " no está en e grupo con el id " + Grupo_id;
}

export const existe_sesion = async (Sesion_id) => {
    let query = "SELECT * FROM sesiones WHERE Sesion_id = ?";
    const sesion = await db.query(query, [Sesion_id]);

    if (sesion.length != 0) {
        return sesion[0];
    }

    throw "No existe la sesion con el Id: " + Sesion_id;
}

export const existe_multa = async (Multa_id) => {
    let query = "SELECT * FROM multas WHERE Multa_id = ?";
    const multa = await db.query(query, [Multa_id]);

    if (multa.length != 0) {
        return multa[0];
    }

    throw "No existe la multa con el Id: " + Multa_id;
}

export const existe_Acuerdo = async (Acuerdo_id) => {
    let query = "SELECT * FROM acuerdos WHERE Acuerdo_id = ?";
    const acuerdo = await db.query(query, [Acuerdo_id]);

    if (acuerdo.length != 0) {
        return acuerdo[0];
    }

    throw "No existe el acuerdo con el Id: " + Acuerdo_id;
}

export const obtener_acuerdo_actual = async (Grupo_id) => {
    let query = "SELECT * FROM acuerdos WHERE Grupo_id = ? and Status = 1";
    const acuerdo = await db.query(query, [Grupo_id]);

    if (acuerdo.length != 0) {
        return acuerdo[0];
    }

    throw "No hay un acuerdo vigente para este grupo";
}