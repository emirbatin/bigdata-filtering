import fs from "fs/promises";
import { createWriteStream, createReadStream } from "fs";
import path from "path";
import XLSX from "xlsx";
import csvParser from "csv-parser";
import {
  processCSV,
  saveBatch,
  clearUploadDirectory,
} from "../helpers/fileHelpers.js";

const uploadDir = path.resolve("uploads");

export const handleUploadChunk = async (req, res) => {
  const { index, totalChunks, fileType } = req.body;
  const chunk = req.file;

  const chunkPath = path.join(uploadDir, `chunk_${index}`);
  await fs.rename(chunk.path, chunkPath);

  if (Number(index) === Number(totalChunks) - 1) {
    const fileExtension = fileType === "xlsx" ? "xlsx" : "csv";
    const filePath = path.join(uploadDir, `combinedFile.${fileExtension}`);
    const writeStream = createWriteStream(filePath);

    for (let i = 0; i < totalChunks; i++) {
      const chunkData = await fs.readFile(path.join(uploadDir, `chunk_${i}`));
      writeStream.write(chunkData);
      await fs.unlink(path.join(uploadDir, `chunk_${i}`));
    }

    writeStream.end((error) => {
      if (error) {
        console.error("Dosya birleştirme hatası:", error);
        res.status(500).json({ message: "Dosya birleştirme hatası." });
      } else {
        res.json({ message: "Dosya başarıyla yüklendi" });
      }
    });
  } else {
    res.json({ message: `Parça ${Number(index) + 1} yüklendi` });
  }
};

export const processFile = async (req, res) => {
  const { type, mapping, fileType } = req.body;
  const fileExtension = fileType === "xlsx" ? "xlsx" : "csv";
  const filePath = path.join(uploadDir, `combinedFile.${fileExtension}`);

  try {
    if (fileType === "xlsx") {
      const workbook = XLSX.readFile(filePath, { raw: true });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      const csvFilePath = path.join(uploadDir, "convertedFile.csv");
      XLSX.writeFile(workbook, csvFilePath, { bookType: "csv" });

      setTimeout(async () => {
        try {
          await fs.access(csvFilePath);
          console.log("CSV dosyası başarıyla oluşturuldu.");
          await processCSV(csvFilePath, type, mapping, res);
        } catch (error) {
          console.error("CSV dosyası oluşturulamadı veya bulunamadı:", error);
          res.status(500).json({
            message: "CSV dosyası oluşturulamadı veya bulunamadı.",
            error,
          });
        }
      }, 100);
    } else if (fileType === "csv") {
      await processCSV(filePath, type, mapping, res);
    }
  } catch (error) {
    console.error("Veri işlenirken hata oluştu:", error);
    res.status(500).json({ message: "Veri işlenirken hata oluştu.", error });
  }
};
