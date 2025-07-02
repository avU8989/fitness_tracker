import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import * as OpenApiValidator from "express-openapi-validator";
import mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import dotenv from "dotenv";
import authMiddleware from "./middleware/auth";
import authenticationRoutes from "./routes/authenticationRoutes";
import trainingPlanRoutes from "./routes/trainingPlanRoutes";
import workoutRoutes from "./routes/workoutRoutes";

const app = express();
const port = process.env.PORT || 5000;

dotenv.config();

// load openapi spec
const swaggerDocument = YAML.load(process.env.OPEN_API_DESIGN || "");

app.use(cors());
app.use(express.json());
// route protection with middleware
app.use("/training-plans", authMiddleware, trainingPlanRoutes);
app.use("/auth", authenticationRoutes);
app.use("/workouts", authMiddleware, workoutRoutes);

// connect to mongodb
mongoose
  .connect(process.env.MONGODB_URI || "", {})
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(port, () => {
      console.log(`Server running on ${port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(
  OpenApiValidator.middleware({
    apiSpec: process.env.OPEN_API_DESIGN || "",
    validateRequests: true,
    validateResponses: true,
  })
);

app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  if (err.status && err.errors) {
    res.status(err.status).json({
      message: err.message,
      errors: err.errors,
    });
    return;
  }
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
});
