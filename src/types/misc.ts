import { Request } from "express";

export interface CustomRequest<BodyTemplate> extends Request {
    body: BodyTemplate,
    id_socio_actual?: number
}

export interface CommonError {
    code: number,
    message: string
}