import { z } from "zod";

export const BookingSeatParamsSchema = z.object({
    id: z.string(),
    name: z.string().trim().min(1).max(120),
});

export type BookingSeatParamsType = {
    id: number;
    name: string;
}
