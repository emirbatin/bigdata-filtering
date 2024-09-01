import express from "express";
import fs from "fs/promises"; // fs modülünün asenkron sürümü için
import { createWriteStream } from "fs"; // fs modülünden createWriteStream fonksiyonunu import et
import path from "path";
import XLSX from "xlsx";
import multer from "multer";
import Ihracat from "../models/ihracatModel.js";
import Ithalat from "../models/ithalatModel.js";

const router = express.Router();
const uploadDir = path.resolve("uploads");

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Upload-chunk endpoint to handle file chunk upload
router.post("/upload-chunk", upload.single("chunk"), async (req, res) => {
  const { index, totalChunks } = req.body;
  const chunk = req.file;

  // Asenkron dosya yeniden adlandırma işlemi
  const chunkPath = path.join(uploadDir, `chunk_${index}`);
  await fs.rename(chunk.path, chunkPath);

  // Check if all chunks are uploaded
  if (Number(index) === Number(totalChunks) - 1) {
    const filePath = path.join(uploadDir, "combinedFile.xlsx");
    const writeStream = createWriteStream(filePath); // createWriteStream'i fs'den import ettik

    // Combine chunks
    for (let i = 0; i < totalChunks; i++) {
      const chunkData = await fs.readFile(path.join(uploadDir, `chunk_${i}`)); // Asenkron dosya okuma
      writeStream.write(chunkData);
      await fs.unlink(path.join(uploadDir, `chunk_${i}`)); // Asenkron dosya silme
    }

    writeStream.end(() => {
      res.json({ message: "Dosya başarıyla yüklendi" });
    });
  } else {
    res.json({ message: `Parça ${Number(index) + 1} yüklendi` });
  }
});

// Process-file endpoint to handle the processing of the uploaded Excel file
router.post("/process-file", async (req, res) => {
  const { type, mapping } = req.body;
  const filePath = path.join(uploadDir, "combinedFile.xlsx");

  try {
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const excelData = XLSX.utils.sheet_to_json(worksheet);

    // Map Excel data to DB fields based on provided mapping
    const mappedData = excelData.map((row) => {
      const newRow = {};
      Object.entries(mapping).forEach(([dbField, excelHeader]) => {
        newRow[dbField] = row[excelHeader] || undefined; // Eğer alan yoksa undefined olarak ayarlayın
      });
      return newRow;
    });

    // Batch işlemleri için kodu buraya ekleyin
    const batchSize = 1000; // Her seferinde 1000 belge ekle
    for (let i = 0; i < mappedData.length; i += batchSize) {
      const batch = mappedData.slice(i, i + batchSize);
      if (type === "ihracat") {
        await Ihracat.insertMany(batch, { ordered: false });
      } else if (type === "ithalat") {
        await Ithalat.insertMany(batch, { ordered: false });
      }
    }

    res.status(200).json({ message: "Veriler başarıyla kaydedildi." });
  } catch (error) {
    console.error("Veri işlenirken hata oluştu:", error);
    res
      .status(500)
      .json({ message: "Veri işlenirken hata oluştu.", error: error.errors });
  }
});

export default router;
