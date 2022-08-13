import config from "../config";
import db from "../../src/config/database";
import * as falso from "@ngneat/falso";
import { eleccion, formatearFecha } from "../../src/utils/utils";
import { request } from "../utils/utils";
import { grupos_sin_socio } from "../../src/services/Grupos.services";

afterAll(async () => {
    await db.end();
});

describe("Login", () => {
    const reqBody = { Username: config.Javi.username, Password: config.Javi.password }

    it("Debería devolver un token si las credenciales son correctas", async () => {
        const response = await request.post("/api/socios/login")
            .send(reqBody);


        expect(response.body).toHaveProperty("token");
    })

    it("Debería devolver un codigo 401 si la contraseña es incorrecta", async () => {
        const response = await request.post("/api/socios/login")
            .send({ ...reqBody, Password: config.Javi.password + "hola" });


        expect(response.statusCode).toBe(401);
    })
})

describe("Register", () => {
    const reqBody = {
        Nombres: falso.randFirstName(),
        Apellidos: falso.randLastName(),
        CURP: falso.randUuid(),
        Fecha_nac: formatearFecha(falso.randPastDate({ years: 70 })),
        Nacionalidad: falso.randCountry(),
        Sexo: eleccion("H", "M"),
        Escolaridad: eleccion("Posgrado", "Licenciatura", "Preparatoria", "Secundaria", "Primaria"),
        Ocupacion: falso.randJobTitle(),
        Estado_civil: eleccion("Soltero", "casado"),
        Hijos: falso.randNumber({ min: 0, max: 3 }),
        Telefono: falso.randPhoneNumber(),
        Email: falso.randEmail(),
        Localidad: falso.randCounty(),
        Municipio: falso.randCity(),
        Estado: falso.randState(),
        CP: falso.randZipCode(),
        Pais: falso.randCounty(),
        Foto_perfil: falso.randAvatar(),
        Username: falso.randUserName(),
        Password: falso.randPassword(),
        Pregunta_id: eleccion(4, 14),
        Respuesta: falso.randFirstName()
    }

    it("Debería devolver un status de 201", async () => {
        const response = await request.post("/api/socios")
            .send(reqBody);

        expect(response.statusCode).toBe(201);
    });

})

describe("Unirse a un grupo", () => {
    const reqBody = {
        Codigo_grupo: -1,
    }

    const reqHeader = {
        Authorization: config.Ale.token,
    }

    it("Debería devolver un status de 200", async () => {
        reqBody.Codigo_grupo = (await grupos_sin_socio(config.Ale.id))[0];

        const response = await request.post("/api/socios/grupos")
            .send(reqBody)
            .set(reqHeader);

        expect(response.statusCode).toBe(200);
    })
})
