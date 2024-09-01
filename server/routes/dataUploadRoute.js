import express from "express";
import fs from "fs/promises";
import { createWriteStream, createReadStream } from "fs";
import path from "path";
import multer from "multer";
import Ihracat from "../models/ihracatModel.js";
import Ithalat from "../models/ithalatModel.js";
import XLSX from "xlsx";
import csvParser from "csv-parser";

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

router.post("/upload-chunk", upload.single("chunk"), async (req, res) => {
  const { index, totalChunks } = req.body;
  const chunk = req.file;

  const chunkPath = path.join(uploadDir, `chunk_${index}`);
  await fs.rename(chunk.path, chunkPath);

  if (Number(index) === Number(totalChunks) - 1) {
    const filePath = path.join(uploadDir, "combinedFile.xlsx");
    const writeStream = createWriteStream(filePath);

    for (let i = 0; i < totalChunks; i++) {
      const chunkData = await fs.readFile(path.join(uploadDir, `chunk_${i}`));
      writeStream.write(chunkData);
      await fs.unlink(path.join(uploadDir, `chunk_${i}`));
    }

    writeStream.end(() => {
      res.json({ message: "Dosya başarıyla yüklendi" });
    });
  } else {
    res.json({ message: `Parça ${Number(index) + 1} yüklendi` });
  }
});

router.post("/process-file", async (req, res) => {
  const { type, mapping } = req.body;
  const filePath = path.join(uploadDir, "combinedFile.xlsx");

  try {
    // Excel dosyasını CSV'ye dönüştürme ve stream ile okuma
    const workbook = XLSX.readFile(filePath, { raw: true }); // raw: true daha büyük dosyaları işlemek için belleği optimize eder
    const csvFilePath = path.join(uploadDir, "convertedFile.csv");
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    XLSX.writeFile(workbook, csvFilePath, { bookType: "csv" });

    // CSV dosyasını stream ile okuyup işleme
    const readStream = createReadStream(csvFilePath);
    const mappedData = [];
    let rowCount = 0;

    readStream
      .pipe(csvParser())
      .on("data", async (row) => {
        const newRow = {};
        Object.entries(mapping).forEach(([dbField, excelHeader]) => {
          newRow[dbField] = row[excelHeader] || undefined;
        });
        mappedData.push(newRow);
        rowCount++;

        // Batch işlemi: 10000 satırda bir veritabanına yaz
        if (mappedData.length >= 10000) {
          readStream.pause();
          await saveBatch(mappedData.splice(0, 10000), type);
          readStream.resume();
        }
      })
      .on("end", async () => {
        if (mappedData.length > 0) {
          await saveBatch(mappedData, type);
        }
        res
          .status(200)
          .json({ message: `Toplam ${rowCount} satır başarıyla kaydedildi.` });
      })
      .on("error", (error) => {
        console.error("CSV okuma hatası:", error);
        res
          .status(500)
          .json({ message: "Veri işlenirken hata oluştu.", error });
      });
  } catch (error) {
    console.error("Veri işlenirken hata oluştu:", error);
    res.status(500).json({ message: "Veri işlenirken hata oluştu.", error });
  }
});

async function saveBatch(data, type) {
  if (type === "ihracat") {
    await Ihracat.insertMany(data, { ordered: false });
  } else if (type === "ithalat") {
    await Ithalat.insertMany(data, { ordered: false });
  }
}

export default router;
