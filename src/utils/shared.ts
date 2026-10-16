import z from "zod";

export const required = (message: string) =>
  z.preprocess((v) => (v == null ? "" : String(v)), z.string().min(1, message));