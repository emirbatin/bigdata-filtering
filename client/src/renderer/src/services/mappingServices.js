// src/services/mappingService.js
import Fuse from 'fuse.js'
import { normalizeString } from '../utils/stringUtils'

// Fuzzy matching fonksiyonu, başlıkları normalleştirerek eşleştirir
export const matchHeader = (excelHeader, dbHeaders) => {
  const options = {
    includeScore: true,
    threshold: 0.3 // Eşleşme hassasiyeti
  }

  // Excel ve veritabanı başlıklarını normalize ediyoruz
  const normalizedExcelHeader = normalizeString(excelHeader)
  const normalizedDbHeaders = dbHeaders.map((header) => ({
    original: header,
    normalized: normalizeString(header)
  }))

  // Fuse.js'i normalize edilmiş verilerle çalıştırıyoruz
  const fuse = new Fuse(normalizedDbHeaders, { keys: ['normalized'], ...options })
  const result = fuse.search(normalizedExcelHeader)

  // Eşleşme varsa orijinal başlığı döndürüyoruz
  if (result.length > 0 && result[0].score < 0.1) {
    return result[0].item.original
  } else {
    return null // Eşleşme yoksa null döndür
  }
}
