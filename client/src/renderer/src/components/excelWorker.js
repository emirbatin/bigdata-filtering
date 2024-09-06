importScripts('https://cdn.sheetjs.com/xlsx-0.17.0/package/dist/xlsx.full.min.js')

self.onmessage = function (event) {
  const { buffer } = event.data // Buffer olarak gelen veriyi al
  const workbook = XLSX.read(buffer, { type: 'array' }) // Buffer ile Workbook oluştur
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]
  const jsonData = XLSX.utils.sheet_to_json(worksheet)
  self.postMessage({ status: 'done', data: jsonData }) // Veriyi ana iş parçacığına gönder
}
