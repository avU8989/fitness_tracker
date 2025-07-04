import { Express } from "express";
import { Router } from "express";
import { createUser } from "../controllers/authenticationController";
import { loginUser } from "../controllers/authenticationController";
import { validationMiddleware } from "../middleware/validationMiddleware";
import { CreateUserRequest } from "../requests/auth/CreateUserRequest";
import { LoginUserRequest } from "../requests/auth/LoginUserRequest";

const authRouter = Router();

authRouter.post(
  "/register",
  validationMiddleware(CreateUserRequest),
  createUser
);

authRouter.post("/login", validationMiddleware(LoginUserRequest), loginUser);

export default authRouter;
