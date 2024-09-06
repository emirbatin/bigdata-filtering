import { createReadStream } from "fs";
import csvParser from "csv-parser";
import Ihracat from "../models/ihracatModel.js";
import Ithalat from "../models/ithalatModel.js";
import fs from "fs/promises";
import path from "path";

const uploadDir = path.resolve("uploads");

function convertExcelDateToUTC(excelDate) {
  if (!isNaN(excelDate)) {
    // Eğer tarih bir serial number ise
    return convertExcelSerialDateToJSDate(excelDate);
  }
  const date = new Date(excelDate); // Eğer tarih string formatındaysa
  const utcDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000); // Zaman dilimi farkını ayarla
  return utcDate;
}
function convertExcelSerialDateToJSDate(excelSerialDate) {
  const excelEpochStart = new Date(1899, 11, 30); // Excel'in 1900 tarihi başlangıç noktası
  const days = Math.floor(excelSerialDate); // Tam gün sayısı
  const millisecondsInDay = 24 * 60 * 60 * 1000; // Bir gündeki milisaniye sayısı
  const excelDateInMS = days * millisecondsInDay;
  return new Date(excelEpochStart.getTime() + excelDateInMS);
}

export const processCSV = async (filePath, type, mapping, res) => {
  let totalRows = 0;

  // Dosyadaki toplam satır sayısını belirle
  await new Promise((resolve, reject) => {
    createReadStream(filePath)
      .pipe(csvParser({ skipEmptyLines: true }))
      .on("data", () => {
        totalRows++;
      })
      .on("end", () => {
        console.log(`Toplam satır sayısı: ${totalRows}`);
        resolve();
      })
      .on("error", reject);
  });

  const readStream = createReadStream(filePath);
  let rowCount = 0;
  let processedCount = 0;
  const mappedData = [];

  readStream
    .pipe(csvParser({ skipEmptyLines: true }))
    .on("data", (row) => {
      rowCount++;

      const newRow = {};
      Object.entries(mapping).forEach(([dbField, excelHeader]) => {
        let value = row[excelHeader];

        // Eğer tarih alanı ise UTC'ye çevir
        if (dbField.includes("Tarihi") || dbField.includes("KapanisTarihi")) {
          value = convertExcelDateToUTC(value);
        }

        newRow[dbField] = value;
      });

      mappedData.push(newRow);

      if (mappedData.length >= 10000) {
        readStream.pause();
        saveBatch(mappedData.splice(0, 10000), type)
          .then(() => {
            processedCount += 10000;
            // Yüzdelik hesaplama ve konsola yazdırma
            const progress = ((processedCount / totalRows) * 100).toFixed(2);
            console.log(`İlerleme: %${progress}`);
            readStream.resume();
          })
          .catch((error) => {
            console.error("Veri kaydedilirken hata oluştu:", error);
            res
              .status(500)
              .json({ message: "Veri işlenirken hata oluştu.", error });
          });
      }
    })
    .on("end", async () => {
      if (mappedData.length > 0) {
        await saveBatch(mappedData, type);
        processedCount += mappedData.length;

        // Son yüzdelik hesaplama ve konsola yazdırma
        const progress = ((processedCount / totalRows) * 100).toFixed(2);
        console.log(`İlerleme: %${progress}`);
      }

      console.log(
        `Veritabanına kaydedilen toplam satır sayısı: ${processedCount}`
      );

      if (processedCount === totalRows) {
        console.log("İşlem %100 tamamlandı. Upload dizini temizleniyor...");
        await clearUploadDirectory(); // Tüm veriler kaydedildiyse klasörü temizle
      }

      res.status(200).json({
        message: `Toplam ${rowCount} satır işlendi. ${processedCount} satır veritabanına kaydedildi.`,
      });
    })
    .on("error", (error) => {
      console.error("CSV okuma hatası:", error);
      res.status(500).json({ message: "Veri işlenirken hata oluştu.", error });
    });
};

export const saveBatch = async (data, type) => {
  try {
    if (type === "ihracat") {
      await Ihracat.insertMany(data, { ordered: false });
    } else if (type === "ithalat") {
      await Ithalat.insertMany(data, { ordered: false });
    }
  } catch (error) {
    console.error("Veri kaydedilirken hata oluştu:", error);

    // Yazma hatalarını kontrol et
    if (error.writeErrors && error.writeErrors.length > 0) {
      console.log(`Toplam hatalı belge sayısı: ${error.writeErrors.length}`);

      // Hatalı belgeleri konsola yazdır
      error.writeErrors.forEach((writeError, index) => {
        const failedDoc = writeError.getOperation();
        console.log(`Hatalı belge ${index + 1}:`, failedDoc);
      });
    }
  }
};

export const clearUploadDirectory = async () => {
  try {
    const files = await fs.readdir(uploadDir);
    for (const file of files) {
      await fs.unlink(path.join(uploadDir, file));
    }
    console.log("Uploads klasörü temizlendi.");
  } catch (error) {
    console.error("Uploads klasörü temizlenirken hata oluştu:", error);
  }
};
