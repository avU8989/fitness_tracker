import User from "../models/User";
import { generateToken } from "../utils/jwt";

export const registerUser = async (data: any) => {
  const { username, email, age, height, password, weight } = data;
  const checkUser = await User.findOne(email);

  if (checkUser) {
    const err = new Error("User with this email already exists");
    (err as any).statusCode = 400;
    throw err;
  }

  const newUser = new User({
    username,
    email,
    age,
    height,
    password,
    weight,
  });

  const savedUser = await newUser.save();
  const token = generateToken(savedUser.id);

  return { token, message: "User successfully registered" };
};

export const authenticateUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePasswords(password))) {
    const err = new Error("Invalid email or password");
    (err as any).statusCode = 401;
    throw err;
  }

  const token = generateToken(user.id);
  return { token };
};
