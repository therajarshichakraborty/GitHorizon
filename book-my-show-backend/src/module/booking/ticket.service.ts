import { BookingSeatParamsType } from "./ticket.model";
import pool from "../../helper/config/db";
import ApiError from "../../helper/api-responce/api-errors";

export const getSeatService = async () => {
    const sql = "SELECT id, name, is_booked FROM seats order by id";
    const row = await pool.query(sql);
    if (!row) {
        throw new Error("Failed to fetch seats");
    }
    if (row.rowCount === 0) {
        throw new Error("No seats found");
    }
    return row.rows;
};

export const bookSeatService = async ({ id, name }: BookingSeatParamsType) => {
    const connection = await pool.connect();
    try {
    
        await connection.query("BEGIN");

        const checkSql = "SELECT id, is_booked FROM seats WHERE id = $1 FOR UPDATE";
        const checkRow = await connection.query(checkSql, [id]);
        if (!checkRow) {
        throw ApiError.internal("Failed to check seat availability");
        }
        if (checkRow.rowCount === 0) {
        throw ApiError.notFound("Seat not found");
        }

        const updateSql =
        "UPDATE seats SET is_booked = TRUE, name = $1, updated_at = NOW() WHERE id = $2";
        const updateRow = await connection.query(updateSql, [name, id]);

        await connection.query("COMMIT");
        connection.release();

        return updateRow.rows[0];
    } catch (error) {
        await connection.query("ROLLBACK");
        connection.release();
        throw ApiError.internal("Failed to book seat");
    }
};
