import ApiResponse from "../../helper/api-responce/api-responce";
import { BookingSeatParamsType } from "./ticket.model";
import { bookSeatService, getSeatService } from "./ticket.service";
import { Request, Response } from "express";
import { RequestHandler } from "express";

export const getSeatsController = async (req: Request, res: Response) => {
    const seats = await getSeatService();
    return ApiResponse.ok(res, "Seats fetched successfully", seats);
};

export const bookSeatController: RequestHandler<BookingSeatParamsType> = async (req,res) => {
    const bookedSeat = await bookSeatService({
        id:Number(req.params.id),
        name: req.params.name,
    });
    return ApiResponse.ok(res, "Seat booked successfully", bookedSeat);
};
