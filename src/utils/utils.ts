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