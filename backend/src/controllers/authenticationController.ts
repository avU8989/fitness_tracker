import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username, email, age, height, password, weight } = req.body;

    const newUser = new User({
      username,
      email,
      age,
      height,
      password,
      weight,
    });

    const savedUser = await newUser.save();
    console.log(savedUser);

    res.status(201).json({
      message: "User successfully registered",
    });
  } catch (err: any) {
    res.status(400).json({
      message: "Bad request",
      error: err.message,
    });
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    //find user
    const user = await User.findOne({ email });

    if (!user) {
      console.log("Request body:", req.body);
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    console.log(`Logging in user ${user.id} with ${email}`);

    //compare password
    const isMatch = await user.comparePasswords(password);
    if (!isMatch) {
      console.log("Request body:", req.body);
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const token = jwt.sign(
      { id: user._id }, //payload with user id
      secret, //secret key (set in your environment variables)
      { expiresIn: "1d" }
    );

    res.status(200).json({ token });
  } catch (err: any) {
    res.status(401).json({ message: "Unauthorized", error: err.message });
  }
};
