import { Router } from "express"
import { getUser, loginUser, logoutUser, refreshUser, registerUser } from "./auth.controller"
import { validateRequest } from "../../helper/middleware/request.middleware"
import { LoginSchema, RegisterSchema } from "./auth.model"
import { isLoggedInUser } from "./auth.middleware"


const authRouter = Router()

authRouter.post("/register",validateRequest(RegisterSchema), registerUser)
authRouter.post("/login", validateRequest(LoginSchema), loginUser)
authRouter.post("/refresh-token", refreshUser)
authRouter.post("/logout", isLoggedInUser, logoutUser)
authRouter.get("/me", isLoggedInUser, getUser)


export default authRouter