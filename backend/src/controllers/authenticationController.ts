import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { authenticateUser, registerUser } from "../services/user.service";

dotenv.config();

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username, email, age, height, password, weight } = req.body;

    const result = await registerUser(req.body);

    res.status(201).json(result);
  } catch (err: any) {
    next(err);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const { token } = await authenticateUser(email, password);

    res.status(200).json({ token });
    console.log("User successfully logged in");
  } catch (err: any) {
    next(err);
  }
};
