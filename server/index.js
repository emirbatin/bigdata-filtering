import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import userRoute from "./routes/userRoute.js";
import dataUploadRoute from "./routes/dataUploadRoute.js";
import { app, server } from "./socket/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));

// CORS ayarları
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:3000"], // İzin verilen originler
  credentials: true, // Çerezlerin gönderilmesine izin verir
};

app.use(cors(corsOptions)); // CORS middleware

// Diğer middleware'ler ve rotalar
app.use("/api/v1/user", userRoute);
app.use("/api/v1/data", dataUploadRoute);

server.listen(PORT, () => {
  connectDB();
  console.log(`Server listening at port ${PORT}`);
});
