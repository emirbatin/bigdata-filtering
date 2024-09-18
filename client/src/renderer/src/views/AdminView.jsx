import React, { useState } from 'react'
import {
  Upload,
  FileType,
  ArrowUpCircle,
  Plus,
  Trash,
  AlertCircle,
  ArrowLeft,
  LogOut,
  File,
  X,
  FileText,
  HardDrive,
  Calendar
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '../components/Alert'
import { handleExcelFile, handleCsvFile } from '../services/fileServices'
import { toCamelCase } from '../utils/stringUtils'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const CHUNK_SIZE = 5 * 1024 * 1024 // 5 MB

const AdminView = () => {
  const navigate = useNavigate()
  const { isAdmin, logout } = useAuth()

  const [selectedFiles, setSelectedFiles] = useState([])
  const [fileType, setFileType] = useState('')
  const [excelHeaders, setExcelHeaders] = useState([])
  const [csvRows, setCsvRows] = useState([])
  const [uploadType, setUploadType] = useState('')
  const [mapping, setMapping] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [progress, setProgress] = useState(0)

  const [dbHeaders, setDbHeaders] = useState([
    'birinci_alt_rejim_aciklamasi',
    'ticari_tanimi_31',
    'alici_adi',
    'alici_kimlik_no',
    'belge_no',
    'fatura_tutari',
    'gtip_aciklamasi',
    'gtip_kodu',
    'gonderen_adi',
    'gonderici_alici_adi',
    'gonderici_alici_vergi_no',
    'gonderici_kimlik_no',
    'gumruk_istatistik_tarihi_bordro_tarihi',
    'hesaplanmis_kalem_kiymeti_usd_degeri',
    'kalem_rejim_kodu',
    'kalem_sira_no',
    'kap_adedi',
    'mense_ulke_kodu',
    'navlun_tutari_tl_degeri',
    'net_agirlik',
    'sigorta_tutari',
    'sinirdaki_aracin_tasima_sekli_kodu',
    'tcgb_kapanis_tarihi',
    'tcgb_tescil_no',
    'teslim_sekli_kodu',
    'ticaret_yapilan_ulke_kodu',
    'varis_ulkesi_adi',
    'yukleme_bosaltma_yapilan_gumruk_idaresi_kodu',
    'cikis_ulkesi_kodu',
    'ulke_kodu',
    'ulke_tanim',
    'istatistiki_birim_kodu',
    'beyan_sahibi_adi_unvani',
    'beyan_sahibi_kimlik_no',
    'brut_agirlik',
    'doviz_turu_aciklamasi',
    'fatura_doviz_kodu',
    'gtip_tanimi',
    'gidecegi_ulke_17_kodu',
    'gumruk_idaresi_kodu',
    'havale_hatti',
    'hesaplanmis_istatistiki_kiymet',
    'kullanici_birim_kiymeti_usd_degeri',
    'muayene_hatti',
    'rejim_kodu',
    'satisa_esas_miktar',
    'satisa_esas_miktar_olcu_birimi_kodu',
    'tcgb_bolge_mudurlugu_kodu',
    'tcgb_statu_aciklamasi',
    'tcgb_basmudurluk_kodu',
    'ticari_odeme_sekli_tanim',
    'toplam_kap_adedi',
    'cikistaki_aracin_kayitli_oldugu_ulke_kodu',
    'olcu_birimi_aciklamasi',
    'olcu_esya_miktari',
    'istatistiki_kiymet',
    'istatistiki_kiymet_usd_degeri',
    'istatistiki_miktar',
    'gumruk_ve_ticaret_bolge_mudurlugu'
  ])

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files)
    setMessage('')
    setProgress(0)

    // Process each file
    const processedFiles = await Promise.all(
      files.map(async (file) => {
        try {
          let result
          if (fileType === 'xlsx') {
            result = await handleExcelFile(file, dbHeaders)
          } else if (fileType === 'csv') {
            result = await handleCsvFile(file, dbHeaders)
          }
          return {
            file, // Store the actual File object here
            ...result
          }
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error)
          return {
            file, // Still store the actual File object even if there's an error
            error: error.message
          }
        }
      })
    )

    // Filter out files that didn't have errors and set them in the state
    const validFiles = processedFiles.filter((file) => !file.error)
    setSelectedFiles(validFiles)

    // Set headers and mappings for the first valid file
    if (validFiles.length > 0) {
      setExcelHeaders(validFiles[0].headers)
      setMapping(validFiles[0].initialMapping)
    }

    // Handle and display any errors
    const errors = processedFiles.filter((file) => file.error)
    if (errors.length > 0) {
      setMessage(`${errors.length} dosya işlenemedi. Lütfen dosyaları kontrol edin.`)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === undefined || isNaN(bytes)) return 'Bilinmeyen boyut'
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (date) => {
    if (!date) return 'Bilinmeyen tarih'
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleUploadCSV = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setMessage('Kullanıcı doğrulanmadı.')
      return
    }

    setIsLoading(true)
    setProgress(0)

    console.log('Selected Files:', selectedFiles)

    for (let fileIndex = 0; fileIndex < selectedFiles.length; fileIndex++) {
      const fileObj = selectedFiles[fileIndex]
      console.log('Processing file object:', fileObj)

      const file = fileObj.file || fileObj // Try to get the File object

      // Check if it's a valid file-like object
      if (!file || typeof file.slice !== 'function') {
        console.error('Invalid file object:', file)
        setMessage(`${fileObj.name || 'Dosya'} geçerli bir dosya değil.`)
        setIsLoading(false)
        return
      }

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
          const response = await fetch('http://localhost:3000/api/v1/data/upload-chunk', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`
            },
            body: formData
          })

          if (!response.ok) {
            throw new Error('Parça yükleme hatası')
          }

          setProgress(
            ((fileIndex * totalChunks + i + 1) / (selectedFiles.length * totalChunks)) * 100
          )
        } catch (error) {
          console.error(error)
          setMessage(`${file.name} dosyası yüklenirken hata oluştu: ${error.message}`)
          setIsLoading(false)
          return
        }
      }

      // process-file isteği
      try {
        const response = await fetch('http://localhost:3000/api/v1/data/process-file', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            type: uploadType,
            mapping: fileObj.initialMapping || mapping, // Use fileObj.initialMapping if available, otherwise fall back to the global mapping
            fileType,
            fileName: file.name
          })
        })

        const result = await response.json()
        if (!response.ok) {
          throw new Error(result.message || 'Bilinmeyen hata')
        }
      } catch (error) {
        console.error(error)
        setMessage(`${file.name} dosyası işlenirken hata oluştu: ${error.message}`)
        setIsLoading(false)
        return
      }
    }

    setMessage('Tüm dosyalar başarıyla yüklendi ve işlendi')
    setIsLoading(false)
    setProgress(100)
  }

  const handleLogout = async () => {
    await logout()
  }

  const handleMappingChange = (excelHeader, dbField) => {
    setMapping((prevMapping) => ({
      ...prevMapping,
      [dbField]: excelHeader
    }))
  }

  const handleDbHeaderChange = (value, index) => {
    const newDbHeaders = [...dbHeaders]
    const camelCaseHeader = toCamelCase(value)
    newDbHeaders[index] = camelCaseHeader
    setDbHeaders(newDbHeaders)
  }

  const handleAddDbHeader = () => {
    setDbHeaders([...dbHeaders, '']) // Yeni boş başlık ekle
  }

  const handleRemoveDbHeader = (index) => {
    const newDbHeaders = dbHeaders.filter((_, i) => i !== index)
    setDbHeaders(newDbHeaders)
  }

  const handleGoBack = () => {
    navigate('/FilterForm')
  }

  const FileList = ({ files, onRemove }) => (
    <div className="mt-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Seçilen Dosyalar</h3>
      <ul className="bg-white rounded-lg shadow-md divide-y divide-gray-200">
        {files.map((fileObj, index) => {
          const file = fileObj.file || fileObj
          return (
            <li key={index} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <FileText className="h-10 w-10 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name || 'İsimsiz dosya'}
                    </p>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <HardDrive className="flex-shrink-0 mr-1.5 h-4 w-4" />
                      <span>{formatFileSize(file.size)}</span>
                      <span className="mx-2">•</span>
                      <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
                      <span>{formatDate(file.lastModified)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onRemove(index)}
                  className="flex-shrink-0 ml-4 bg-white rounded-full p-1 text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <span className="sr-only">Dosyayı kaldır</span>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Erişim Engellendi</h1>
          <p className="mt-4 text-lg text-gray-600">Bu sayfayı görüntüleme yetkiniz yok.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden w-full">
        <div className="px-6 py-8 sm:p-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-extrabold text-gray-900">Admin Paneli</h1>
            <div className="flex space-x-4">
              <button
                onClick={handleGoBack}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Geri Dön
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Çıkış Yap
              </button>
            </div>
          </div>

          <div className="space-y-8">
            {/* Dosya Türü Seçimi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dosya Türünü Seçin
              </label>
              <div className="mt-1 flex space-x-4">
                <button
                  onClick={() => setFileType('xlsx')}
                  className={`flex-1 inline-flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    fileType === 'xlsx'
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Dosya Yükleyin</label>
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
                        accept={fileType === 'xlsx' ? '.xlsx' : '.csv'}
                        disabled={isLoading || !fileType}
                        multiple
                      />
                    </label>
                    <p className="pl-1">veya sürükleyip bırakın</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {fileType === 'xlsx' ? 'XLSX' : 'CSV'} dosyaları (maksimum 10MB her biri)
                  </p>
                </div>
              </div>

              {/* Seçilen Dosyalar Listesi */}
              {selectedFiles.length > 0 && (
                <FileList
                  files={selectedFiles}
                  onRemove={(index) => {
                    const newFiles = [...selectedFiles]
                    newFiles.splice(index, 1)
                    setSelectedFiles(newFiles)
                  }}
                />
              )}
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
            {selectedFiles.length > 0 && selectedFiles[0].headers && dbHeaders.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Başlık Eşleştirme</h2>
                <div className="grid grid-cols-2 gap-4">
                  {dbHeaders.map((dbHeader, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        className="border rounded-md p-2 flex-1"
                        value={dbHeader}
                        onChange={(e) => handleDbHeaderChange(e.target.value, index)}
                        placeholder="Başlık Adı"
                      />
                      <select
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        value={mapping[dbHeader] || ''}
                        onChange={(e) => handleMappingChange(e.target.value, dbHeader)}
                      >
                        <option value="">--Eşleştirme--</option>
                        {selectedFiles[0].headers.map((fileHeader, idx) => (
                          <option key={idx} value={fileHeader}>
                            {fileHeader} (Önerilen: {selectedFiles[0].initialMapping[dbHeader]})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleRemoveDbHeader(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleAddDbHeader}
                    className="flex items-center space-x-2 text-blue-500 hover:text-blue-700"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Başlık Ekle</span>
                  </button>
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
  )
}

export default AdminView
