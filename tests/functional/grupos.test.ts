import { randCity, randCountry, randCounty, randPhrase, randState, randZipCode } from "@ngneat/falso";
import db from "../../src/config/database";
import config from "../config";
import { request } from "../utils/utils";

afterAll(async () => {
    await db.end();
});

describe.skip("Crear Grupo", () => {
    const reqBody = {
        Nombre_grupo: randPhrase(),
        Localidad: randCounty(),
        Municipio: randCity(),
        Estado: randState(),
        CP: randZipCode(),
        Pais: randCountry(),
    };

    const reqHeader = {
        Authorization: config.Javi.token,
    }

    it("Debería devolver Status 201 si el grupo se creó con exito", async () => {
        const response = await request.post("/crear_grupo")
            .send(reqBody)
            .set(reqHeader);

        expect(response.statusCode).toEqual(201);
    });
});