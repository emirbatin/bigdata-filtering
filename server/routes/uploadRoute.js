import express from "express";
import multer from "multer";
import path from "path";

const router = express.Router();

// Multer ile dosyaları 'uploads' klasörüne kaydetme
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB boyut limiti
});

router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Dosya yüklenemedi" });
  }
  res
    .status(200)
    .json({ message: "Dosya başarıyla yüklendi", filePath: req.file.path });
});

export default router;
