import { config } from "dotenv";

config();

export const port = process.env.PORT as string;
export const host = process.env.DB_HOST as string;
export const user = process.env.DB_USER as string;
export const password = process.env.DB_PASSWORD as string;
export const database = process.env.DB_NAME as string;
export const secret = process.env.JWT_SECRET as string;