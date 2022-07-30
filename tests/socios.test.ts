import supertest from "supertest"
import app from "../src/app"
import config from "./config";
import db from "../src/config/database";

const request = supertest(app);

describe("Login", () => {
    it("Debería devolver un token si las credenciales son correctas", async () => {
        const response = await request.post("/login").send({ Username: config.Javi.username, Password: config.Javi.password });

        expect(response.body.token).not.toBeUndefined();
    })

    it("Debería devolver un codigo 401 si la contraseña es incorrecta",async () => {
        const response = await request.post("/login").send({ Username: config.Javi.username, Password: config.Javi.password + "hola" });
        expect(response.statusCode).toBe(401);
    })
    
    afterAll(async () => {
        await db.end();
    });
})

describe("Register", () => {
    
})