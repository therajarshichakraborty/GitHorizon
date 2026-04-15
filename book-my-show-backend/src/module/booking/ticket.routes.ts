import { bookSeatController, getSeatsController } from "./ticket.controller";
import { Router } from "express";
import { isLoggedInUser } from "../auth/auth.middleware";
import { validateRequestParams } from "../../helper/middleware/request.middleware";
import { BookingSeatParamsSchema } from "./ticket.model";

const ticketRouter = Router();

ticketRouter.get("/seats", getSeatsController);
ticketRouter.put(
    "/:id/:name",
    isLoggedInUser,
    validateRequestParams(BookingSeatParamsSchema),
    bookSeatController as any,
);

export default ticketRouter;
