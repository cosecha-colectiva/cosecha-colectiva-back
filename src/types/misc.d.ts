import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

interface CustomRequest<BodyTemplate> extends Request {
    body: BodyTemplate,
    id_socio_actual?: number
}

interface CommonError {
    code: number,
    message: string
}

interface CustomJwtPayload extends JwtPayload {
    Socio_id: number,
    Username: string,
}