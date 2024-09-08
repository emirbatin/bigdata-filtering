// src/utils/stringUtils.js

// Türkçe karakterleri İngilizce karşılıklarıyla değiştiren, alt çizgileri kaldıran ve küçük harfe çeviren fonksiyon
export const normalizeString = (str) => {
  return str
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ç/g, 'c')
    .replace(/ö/g, 'o')
    .replace(/[^a-zA-Z0-9]/g, '') // Türkçe karakterleri ve özel işaretleri kaldır
}

// Kullanıcının girdiği başlığı camelCase formatına dönüştüren fonksiyon
export const toCamelCase = (str) => {
  return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase())
}
