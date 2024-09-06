import express from "express";
import multer from "multer";
import path from "path";
import {
  handleUploadChunk,
  processFile,
} from "../controllers/uploadController.js";

const router = express.Router();
const uploadDir = path.resolve("uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Chunk yükleme işlemi
router.post("/upload-chunk", upload.single("chunk"), handleUploadChunk);

// Dosya işleme
router.post("/process-file", processFile);

export default router;
