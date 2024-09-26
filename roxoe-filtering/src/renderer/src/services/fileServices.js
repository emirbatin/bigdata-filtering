import ExcelJS from 'exceljs'
import { matchHeader } from './mappingServices'

const API_URL = 'http://localhost:3000'
const CHUNK_SIZE = 5 * 1024 * 1024 // 5 MB

const processHeaders = (headers, dbHeaders) => {
  const initialMapping = {}
  headers.forEach((header) => {
    const matchedHeader = matchHeader(header, dbHeaders)
    if (matchedHeader) {
      initialMapping[matchedHeader] = header
    }
  })
  return initialMapping
}

export const handleExcelFile = async (file, dbHeaders) => {
  const buffer = await file.arrayBuffer()
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)
  const worksheet = workbook.worksheets[0]

  const headers = []
  worksheet.getRow(1).eachCell((cell) => {
    headers.push(cell.text)
  })

  const rows = []
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber > 1) {
      const rowData = {}
      row.eachCell((cell, colNumber) => {
        rowData[headers[colNumber - 1]] = cell.text
      })
      rows.push(rowData)
    }
  })

  const initialMapping = processHeaders(headers, dbHeaders)
  return { headers, rows, initialMapping }
}

export const handleCsvFile = async (file, dbHeaders) => {
  const text = await file.text()
  const rows = text.split('\n').map((row) => row.split(','))
  const headers = rows[0]

  const csvData = rows.slice(1).map((row) =>
    headers.reduce((acc, header, index) => {
      acc[header] = row[index]
      return acc
    }, {})
  )

  const initialMapping = processHeaders(headers, dbHeaders)
  return { headers, csvData, initialMapping }
}

export const processFiles = async (files, fileType, dbHeaders) => {
  const processedFiles = await Promise.all(
    files.map(async (file) => {
      try {
        let result
        if (fileType === 'xlsx') {
          result = await handleExcelFile(file, dbHeaders)
        } else if (fileType === 'csv') {
          result = await handleCsvFile(file, dbHeaders)
        } else {
          throw new Error('Unsupported file type')
        }
        return { file, ...result }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
        return { file, error: error.message }
      }
    })
  )

  const validFiles = processedFiles.filter((file) => !file.error)
  const errors = processedFiles.filter((file) => file.error)

  return { validFiles, errors }
}

export const handleFileChange = async (event, fileType, dbHeaders, callbacks) => {
  const { setMessage, setProgress, setSelectedFiles, setFileHeaders, setMapping } = callbacks
  const files = Array.from(event.target.files)
  setMessage('')
  setProgress(0)

  const { validFiles, errors } = await processFiles(files, fileType, dbHeaders)

  setSelectedFiles(validFiles)
  if (validFiles.length > 0) {
    setFileHeaders(validFiles[0].headers)
    setMapping(validFiles[0].initialMapping)
  }

  if (errors.length > 0) {
    setMessage(`${errors.length} dosya işlenemedi. Lütfen dosyaları kontrol edin.`)
  }
}

export const uploadFileChunks = async (file, fileType, token, onProgress) => {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE)

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE
    const end = Math.min(start + CHUNK_SIZE, file.size)
    const chunk = file.slice(start, end)

    const formData = new FormData()
    formData.append('chunk', chunk)
    formData.append('index', i)
    formData.append('totalChunks', totalChunks)
    formData.append('fileType', fileType)
    formData.append('fileName', file.name)

    try {
      const response = await fetch(`${API_URL}/api/v1/data/upload-chunk`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Parça yükleme hatası')
      }

      onProgress(((i + 1) / totalChunks) * 100)
    } catch (error) {
      throw new Error(`${file.name} dosyası yüklenirken hata oluştu: ${error.message}`)
    }
  }
}

export const processFile = async (uploadType, mapping, fileType, fileName, token) => {
  try {
    const response = await fetch(`${API_URL}/api/v1/data/process-file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        type: uploadType,
        mapping,
        fileType,
        fileName
      })
    })

    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.message || 'Bilinmeyen hata')
    }

    return result
  } catch (error) {
    throw new Error(`${fileName} dosyası işlenirken hata oluştu: ${error.message}`)
  }
}

export const handleUploadCSV = async (
  selectedFiles,
  fileType,
  uploadType,
  mapping,
  token,
  callbacks
) => {
  const { setIsLoading, setMessage, setProgress } = callbacks

  if (!token) {
    setMessage('Kullanıcı doğrulanmadı.')
    return
  }

  setIsLoading(true)
  setProgress(0)

  for (let fileIndex = 0; fileIndex < selectedFiles.length; fileIndex++) {
    const fileObj = selectedFiles[fileIndex]
    const file = fileObj.file || fileObj

    if (!file || typeof file.slice !== 'function') {
      console.error('Invalid file object:', file)
      setMessage(`${fileObj.name || 'Dosya'} geçerli bir dosya değil.`)
      setIsLoading(false)
      return
    }

    try {
      await uploadFileChunks(file, fileType, token, (progress) => {
        setProgress((fileIndex * 100 + progress) / selectedFiles.length)
      })

      await processFile(uploadType, fileObj.initialMapping || mapping, fileType, file.name, token)
    } catch (error) {
      console.error(error)
      setMessage(error.message)
      setIsLoading(false)
      return
    }
  }

  setMessage('Tüm dosyalar başarıyla yüklendi ve işlendi')
  setIsLoading(false)
  setProgress(100)
}

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleString()
}
