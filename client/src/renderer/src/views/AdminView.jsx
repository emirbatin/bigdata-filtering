import React, { useState } from 'react'
import {
  Upload,
  FileType,
  ArrowUpCircle,
  Plus,
  Trash,
  AlertCircle,
  ArrowLeft,
  LogOut
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

  const [selectedFile, setSelectedFile] = useState(null)
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
    const file = event.target.files[0]
    setSelectedFile(file)
    setMessage('')
    setProgress(0)

    if (file) {
      let result = {}

      try {
        setIsLoading(true)

        if (fileType === 'xlsx') {
          result = await handleExcelFile(file, dbHeaders)
        } else if (fileType === 'csv') {
          result = await handleCsvFile(file, dbHeaders)
        }

        // İşlenen sonuçları state'e yerleştiriyoruz
        setExcelHeaders(result.headers)
        setCsvRows(result.rows || result.csvData)
        setMapping(result.initialMapping)

        setIsLoading(false)
      } catch (error) {
        setMessage('Dosya işleme hatası: ' + error.message)
        setIsLoading(false)
      }
    } else {
      setMessage('Lütfen dosya seçin.')
    }
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
    setProgress(0)

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
    setProgress(100)

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
    const camelCaseHeader = toCamelCase(value) // Yeni camelCase formatına çeviriyoruz
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
    navigate('/FilterForm') // Ana sayfaya yönlendir (FilterForm'un bulunduğu sayfa)
  }

  // Admin yetkisini kontrol et ve admin değilse yönlendir
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
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
                      />
                    </label>
                    <p className="pl-1">veya sürükleyip bırakın</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {fileType === 'xlsx' ? 'XLSX' : 'CSV'} dosyası (maksimum 10MB)
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
                        {excelHeaders.map((excelHeader, idx) => (
                          <option key={idx} value={excelHeader}>
                            {excelHeader} (Önerilen: {mapping[dbHeader]})
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
