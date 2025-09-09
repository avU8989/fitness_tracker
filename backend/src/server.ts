import dotenv from "dotenv";
dotenv.config();
import path from "path";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import * as OpenApiValidator from "express-openapi-validator";
import mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import authMiddleware from "./middleware/auth";
import authenticationRoutes from "./routes/authenticationRoutes";
import trainingPlanRoutes from "./routes/trainingPlanRoutes";
import workoutRoutes from "./routes/workoutRoutes";
import "reflect-metadata";
import trainingAssignmentRoutes from "./routes/trainingAssignmentRoutes";
import statsRoutes from "./routes/statsRoutes";
const app = express();
const port = process.env.PORT || 5000;

// load openapi spec
let swaggerDocument;

if (process.env.OPEN_API_DESIGN) {
  swaggerDocument = YAML.load(path.resolve(process.env.OPEN_API_DESIGN));

  if (swaggerDocument) {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  }
}

app.use(
  cors({
    origin: "*", //allow everything
    credentials: true, //for cookies/sessions
  })
);
app.use(express.json());
// route protection with middleware
app.use("/training-plans", authMiddleware, trainingPlanRoutes);
app.use("/auth", authenticationRoutes);
app.use("/workouts", authMiddleware, workoutRoutes);
app.use("/trainingplan-assignments", authMiddleware, trainingAssignmentRoutes);
app.use("/stats", authMiddleware, statsRoutes);
console.log("AYEE WE STARTING");

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

console.log(process.env.MONGODB_URI);
/*
app.use(
  OpenApiValidator.middleware({
    apiSpec: process.env.OPEN_API_DESIGN || "",
    validateRequests: true,
    validateResponses: true,
  })
);
*/
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
