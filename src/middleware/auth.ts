import { NextFunction, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { CustomRequest } from "../types/misc";
const {secret} = require("../config/config");

//auth con jwt en el header
export const auth = (req: CustomRequest<any>, res: Response, next: NextFunction) => {
    //rescatar token del header
    const token = req.header('Authorization');
    //validar que exista el token
    if(token){
        //validar el token
        try{
            req.id_socio_actual = (jwt.verify(token, secret) as JwtPayload).Socio_id;
            next();
        }catch(err){
            res.status(401).json({code: 401, message: 'Token invalido'});
        }
    }else{
        res.status(401).json({code: 401, message: 'No hay token'});
    }
}

export const authAdmin = (req, res, next) => {
    next()
}