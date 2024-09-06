import React, { useState } from 'react'
import ExcelJS from 'exceljs'
import { Upload, FileType, ArrowUpCircle, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from './alert'

const CHUNK_SIZE = 5 * 1024 * 1024 // 5 MB

const AdminView = () => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileType, setFileType] = useState('')
  const [excelHeaders, setExcelHeaders] = useState([])
  const [csvRows, setCsvRows] = useState([])
  const [uploadType, setUploadType] = useState('')
  const [mapping, setMapping] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [progress, setProgress] = useState(0) // İlerleme durumunu izlemek için yeni state

  const dbHeaders = [
    'tcgbGumrukIdaresiKodu',
    'tcgbGumrukIdaresiAdi',
    'tcgbTescilNo',
    'tcgbTescilTarihi',
    'tcgbKapanisTarihi',
    'gondericiAliciVergiNo',
    'gondericiAliciAdi',
    'gonderenAdi',
    'cikisUlkesiKodu',
    'cikisUlkesiAdi',
    'menseUlkeKodu',
    'menseUlkeAdi',
    'teslimSekliKodu',
    'kalemSiraNo',
    'kalemRejimKodu',
    'kalemRejimAciklamasi',
    'gtipKodu',
    'gtipAciklamasi',
    'ticariTanimi31',
    'faturaTutari',
    'faturaTutariDovizTuruKodu',
    'faturaTutariDovizTuru',
    'olcuEsyaMiktari',
    'olcuBirimiAciklamasi',
    'netAgirlikKg',
    'hesaplanmisKalemKiymetiUsdDegeri',
    'istatistikiKiymetUsdDegeri'
  ]

  const handleFileChange = async (event) => {
    const file = event.target.files[0]
    setSelectedFile(file)
    setMessage('')
    setProgress(0)

    if (file) {
      const extension = file.name.split('.').pop().toLowerCase()
      let fileTypeLocal = ''

      if (extension === 'xlsx' || extension === 'xls') {
        fileTypeLocal = 'xlsx'
        setFileType('xlsx')
      } else if (extension === 'csv') {
        fileTypeLocal = 'csv'
        setFileType('csv')
      } else {
        setMessage('Geçersiz dosya türü seçildi.')
        setFileType('')
        return
      }

      setIsLoading(true)

      const reader = new FileReader()
      reader.onload = async (e) => {
        if (fileTypeLocal === 'xlsx') {
          try {
            const buffer = e.target.result
            const workbook = new ExcelJS.Workbook()
            await workbook.xlsx.load(buffer)
            const worksheet = workbook.worksheets[0]

            const headers = []
            worksheet.getRow(1).eachCell((cell, colNumber) => {
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

            if (rows.length > 0) {
              setExcelHeaders(headers)
              setCsvRows(rows)
            } else {
              setMessage('Dosya boş veya okunamıyor.')
              setExcelHeaders([])
              setCsvRows([])
            }
          } catch (error) {
            console.error(error)
            setMessage('Dosya okuma hatası: ' + error.message)
          } finally {
            setIsLoading(false)
          }
        } else if (fileTypeLocal === 'csv') {
          const text = e.target.result
          const rows = text.split('\n').map((row) => row.split(','))
          const headers = rows[0]
          const csvData = rows.slice(1).map((row) =>
            headers.reduce((acc, header, index) => {
              acc[header] = row[index]
              return acc
            }, {})
          )

          setExcelHeaders(headers)
          setCsvRows(csvData)
          setIsLoading(false)
        }
      }

      if (fileTypeLocal === 'xlsx') {
        reader.readAsArrayBuffer(file)
      } else if (fileTypeLocal === 'csv') {
        reader.readAsText(file)
      }
    } else {
      setMessage('Lütfen dosya seçin.')
    }
  }

  const handleMappingChange = (excelHeader, dbField) => {
    setMapping((prevMapping) => ({
      ...prevMapping,
      [dbField]: excelHeader
    }))
  }

  const handleUploadCSV = async () => {
    if (!selectedFile) {
      setMessage('Lütfen bir dosya seçin.')
      return
    }

    if (!uploadType) {
      setMessage('Lütfen bir yükleme türü seçin.')
      return
    }

    const totalChunks = Math.ceil(selectedFile.size / CHUNK_SIZE)
    setIsLoading(true)
    setProgress(0) // İlerlemeyi sıfırla

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE
      const end = start + CHUNK_SIZE
      const chunk = selectedFile.slice(start, end)

      const formData = new FormData()
      formData.append('chunk', chunk)
      formData.append('index', i)
      formData.append('totalChunks', totalChunks)
      formData.append('fileType', fileType)

      try {
        const response = await fetch('http://localhost:3000/api/v1/data/upload-chunk', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error('Parça yükleme hatası')
        }

        // İlerlemeyi güncelle
        setProgress(((i + 1) / totalChunks) * 100)
      } catch (error) {
        console.error(error)
        setMessage(`Veri yükleme hatası: ${error.message}`)
        setIsLoading(false)
        return
      }
    }

    setMessage('Dosya başarıyla yüklendi')
    setIsLoading(false)
    setProgress(100) // Yükleme tamamlandı

    try {
      const response = await fetch('http://localhost:3000/api/v1/data/process-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: uploadType, mapping, fileType })
      })

      const result = await response.json()
      if (response.ok) {
        setMessage(result.message)
      } else {
        setMessage(`Veri işleme hatası: ${result.message || 'Bilinmeyen hata'}`)
      }
    } catch (error) {
      console.error(error)
      setMessage(`Veri işleme hatası: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="px-6 py-8 sm:p-10">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Admin Paneli</h1>

            <div className="space-y-8">
              {/* Dosya Türü Seçimi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dosya Türünü Seçin
                </label>
                <div className="mt-1 flex space-x-4">
                  <button
                    onClick={() => setFileType('excel')}
                    className={`flex-1 inline-flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      fileType === 'excel'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FileType className="mr-2 h-5 w-5" />
                    Excel
                  </button>
                  <button
                    onClick={() => setFileType('csv')}
                    className={`flex-1 inline-flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                      fileType === 'csv'
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FileType className="mr-2 h-5 w-5" />
                    CSV
                  </button>
                </div>
              </div>

              {/* Dosya Yükleme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dosya Yükleyin
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Dosya yükleyin</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                          accept={fileType === 'excel' ? '.xlsx, .xls' : '.csv'}
                          disabled={isLoading || !fileType}
                        />
                      </label>
                      <p className="pl-1">veya sürükleyip bırakın</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {fileType === 'excel' ? 'XLSX veya XLS' : 'CSV'} dosyası (maksimum 10MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Yükleme Türü Seçimi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yükleme Türünü Seçin
                </label>
                <div className="mt-1 flex space-x-4">
                  <button
                    onClick={() => setUploadType('ihracat')}
                    className={`flex-1 inline-flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      uploadType === 'ihracat'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    İhracat
                  </button>
                  <button
                    onClick={() => setUploadType('ithalat')}
                    className={`flex-1 inline-flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                      uploadType === 'ithalat'
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    İthalat
                  </button>
                </div>
              </div>

              {/* Başlık Eşleştirme */}
              {excelHeaders.length > 0 && dbHeaders.length > 0 && (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Başlık Eşleştirme</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {dbHeaders.map((dbHeader, index) => (
                      <div key={index} className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">{dbHeader}</label>
                        <select
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          value={mapping[dbHeader] || ''}
                          onChange={(e) => handleMappingChange(e.target.value, dbHeader)}
                        >
                          <option value="">--Eşleştirme--</option>
                          {excelHeaders.map((excelHeader, idx) => (
                            <option key={idx} value={excelHeader}>
                              {excelHeader}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Yükle Butonu */}
              <div>
                <button
                  onClick={handleUploadCSV}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={isLoading || Object.keys(mapping).length === 0}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Yükleniyor...
                    </>
                  ) : (
                    <>
                      <ArrowUpCircle className="mr-2 h-5 w-5" />
                      Veritabanına Yükle
                    </>
                  )}
                </button>
              </div>

              {/* İlerleme Çubuğu */}
              {isLoading && (
                <div className="mt-4">
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-200">
                      <div
                        style={{ width: `${progress}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                      ></div>
                    </div>
                    <div className="text-center text-sm text-gray-600 mt-2">
                      {Math.round(progress)}% tamamlandı
                    </div>
                  </div>
                </div>
              )}

              {/* Mesaj Gösterimi */}
              {message && (
                <Alert variant={message.includes('hata') ? 'destructive' : 'default'}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{message.includes('hata') ? 'Hata' : 'Başarılı'}</AlertTitle>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminView
