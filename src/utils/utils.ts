import { node_env } from "../config/config";
import { CommonError } from "../types/misc";

/**
 * Recibe un error y lo convierte en uno listo para el front
 * @param error El error obtenido del catch
 * @returns Un error formateado como CommonError
 */
export const getCommonError = (error: string | CommonError | Error | any): CommonError => {
    if (typeof (error) === "string") {
        return { code: 400, message: error };
    }

    if ("code" in error && "message" in error && typeof (error["code"]) === "number") {
        return error;
    }

    return { message: "Error interno del servidor", code: 500 };
}

export const validarCurp = function (curp: string) {
    const regex = /^([A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d])(\d)$/;
    if (regex.test(curp) || node_env !== "PROD") {
        return true;
    } else {
        return false;
    }
}

export const formatearFecha = function (date: Date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    return year + '-' + month + '-' + day;
}

export const random = (...values) => {
    const num = Math.random();

    let index = 0;

    values.forEach((value, ind) => {
      if ((num >= ind / values.length && num <= (ind + 1) / values.length))
      index = ind;
      return ind;
    })

    return values[index];
}