import { Express } from "express";
import { Router } from "express";
import { createUser } from "../controllers/authenticationController";
import { loginUser } from "../controllers/authenticationController";

const authRouter = Router();

authRouter.post("/register", createUser);
authRouter.post("/login", loginUser);

export default authRouter;
