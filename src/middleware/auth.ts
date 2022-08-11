import { NextFunction, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { CustomJwtPayload, CustomRequest, SocioRequest } from "../types/misc";
import { secret } from "../config/config";
import { getCommonError } from "../utils/utils";
import { socio_es_admin } from "../services/Socios.services";

/**
 * Middleware para verificar el token de acceso de un socio. 
 *
 * Agrega al req, el id del socio autenticado.
 * @returns respuesta con codigo 401 si el token no es válido o no hay un token.
 */
export const authSocio = (req: SocioRequest<any>, res: Response, next: NextFunction) => {
    //rescatar token del header
    const token = req.header('Authorization');
    //validar que exista el token
    if (token) {
        //validar el token
        try {
            req.id_socio_actual = (jwt.verify(token, secret) as JwtPayload & { Socio_id: number }).Socio_id;
            next();
        } catch (err) {
            return res.status(401).json({ code: 401, message: 'Token invalido' });
        }
    } else {
        return res.status(401).json({ code: 401, message: 'No hay token' });
    }
}

// Autenticacion para administradores del grupo

/**
 * Middleware para verificar el token de acceso de un socio administrador de un grupo.
 * Agrega al req, el id del socio actual y el id del grupo.
 * 
 * @returns respuesta con codigo 401 si el token no es válido o no hay un token.
 * @returns respuesta con codigo 403 si el socio no es administrador del grupo.
 * @returns respuesta con codigo 404 si el grupo no existe.
 * @returns respuesta con codigo 500 si ocurre un error.
*/
export const authAdmin = async (req, res, next) => {
    // Obtener el token del header
    const token = req.header('Authorization');
    // Obtener el id del grupo de params
    const id_grupo = req.params.Grupo_id;

    // Verificar que haya token
    if (!token) {
        return res.status(401).json({ code: 401, message: 'No hay token' });
    }

    try {
        // Validar que el token sea válido
        const payload = jwt.verify(token, secret) as CustomJwtPayload;
        const id_socio = payload.Socio_id;

        // Validar que el socio sea administrador del grupo
        await socio_es_admin(id_socio, id_grupo);

        // Agregar el id del socio actual al req
        req.id_socio_actual = id_socio;
        // Agregar el id del grupo al req
        req.id_grupo_actual = id_grupo;

        // Pasar al siguiente middleware
        next();
    } catch (err) {
        const { code, message } = getCommonError(err);
        return res.status(code).json({ code, message });
    }
}

// Autenticacion para Administradores del sistema
export const authSuperUser = (req, res, next) => {
    next()
}