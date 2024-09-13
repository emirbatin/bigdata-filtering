import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import userRoute from "./routes/userRoute.js";
import dataUploadRoute from "./routes/dataUploadRoute.js";
import commerceRoute from "./routes/commerceRoute.js";
import { app, server } from "./socket/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));

// CORS ayarları
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
};

app.use(cors(corsOptions));

// Loglama middleware'i
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use("/api/v1/user", userRoute);
app.use("/api/v1/data", dataUploadRoute);
app.use("/api/v1/commerce", commerceRoute);

// Hata yakalama middleware'i
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Sunucu hatası",
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

server.listen(PORT, async () => {
  try {
    await connectDB();
    console.log(`Server listening at port ${PORT}`);
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
});
