import { z } from "zod";

export const AUTH_PASSWORD_MIN_LENGTH = 8;

export const authPasswordSchema = z
    .string()
    .min(AUTH_PASSWORD_MIN_LENGTH, `La contraseña debe tener al menos ${AUTH_PASSWORD_MIN_LENGTH} caracteres`);

