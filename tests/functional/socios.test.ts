import supertest from "supertest"
import app from "../../src/app"
import config from "../config";
import db from "../../src/config/database";
import * as falso from "@ngneat/falso";
import { random, formatearFecha } from "../../src/utils/utils";

const request = supertest(app);

describe("Login", () => {

    it("Debería devolver un token si las credenciales son correctas", async () => {
        const response = await request.post("/login").send({ Username: config.Javi.username, Password: config.Javi.password });

        expect(response.body).toHaveProperty("token");
    })

    it("Debería devolver un codigo 401 si la contraseña es incorrecta", async () => {
        const response = await request.post("/login").send({ Username: config.Javi.username, Password: config.Javi.password + "hola" });
        expect(response.statusCode).toBe(401);
    })
})

describe("Register", () => {
    it("Debería devolver un status de 201", async () => {
        const response = await request.post("/register")
            .send({
                Nombres: falso.randFirstName(),
                Apellidos: falso.randLastName(),
                CURP: falso.randUuid(),
                Fecha_nac: formatearFecha(falso.randPastDate({ years: 70 })),
                Nacionalidad: falso.randCountry(),
                Sexo: random("H", "M"),
                Escolaridad: random("Posgrado", "Licenciatura", "Preparatoria", "Secundaria", "Primaria"),
                Ocupacion: falso.randJobTitle(),
                Estado_civil: random("Soltero", "casado"),
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
                Pregunta_id: random(4, 14),
                Respuesta: falso.randFirstName()
            });

        expect(response.statusCode).toBe(201);
    });

})

afterAll(async () => {
    await db.end();
});