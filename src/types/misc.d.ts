import { Request } from "express";

interface CustomRequest<BodyTemplate> extends Request {
    body: BodyTemplate,
    id_socio_actual?: number
}

interface CommonError {
    code: number,
    message: string
}