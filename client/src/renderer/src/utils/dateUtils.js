// utils/dateUtils.js

export const formatDateForDisplay = (dateString) => {
  if (!dateString || !isValidDate(dateString)) return dateString

  const date = new Date(dateString)
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

export const isValidDate = (dateString) => {
  // Yeni bir tarih validasyonu
  const parsedDate = Date.parse(dateString)
  return !isNaN(parsedDate)
}
