import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import internRoutes from "./routes/internRoutes.js";
import stackRoutes from "./routes/stackRoutes.js";
import moduleRoutes from "./routes/moduleRoutes.js";
import topicRoutes from "./routes/topicRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import bookmarkRoutes from "./routes/bookmarkRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

import errorMiddleware from "./middlewares/errorMiddleware.js";

dotenv.config();

const app = express();

/*
====================================
        MIDDLEWARES
====================================
*/

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.use("/uploads", express.static("src/uploads"));
/*
====================================
          HOME ROUTE
====================================
*/

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "StudyHub LMS API is running successfully 🚀",
  });
});

/*
====================================
            API ROUTES
====================================
*/

app.use("/api/auth", authRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/interns", internRoutes);

app.use("/api/stacks", stackRoutes);

app.use("/api/modules", moduleRoutes);

app.use("/api/topics", topicRoutes);

app.use("/api/notes", noteRoutes);

app.use("/api/progress", progressRoutes);

app.use("/api/bookmarks", bookmarkRoutes);

app.use("/api/dashboard", dashboardRoutes);

/*
====================================
        404 ROUTE
====================================
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API Route Not Found",
  });
});

/*
====================================
      GLOBAL ERROR HANDLER
====================================
*/

app.use(errorMiddleware);

export default app;