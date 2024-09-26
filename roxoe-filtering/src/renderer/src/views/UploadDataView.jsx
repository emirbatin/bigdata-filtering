import React, { useState, useEffect } from 'react'
import {
  Upload,
  FileType,
  ArrowUpCircle,
  AlertCircle,
  ArrowLeft,
  X,
  FileText,
  HardDrive,
  Calendar,
  ChartColumnStacked
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '../components/Alert'
import CustomButton from '../components/CustomButton'
import CustomIconButton from '../components/CustomIconButton'
import {
  handleFileChange,
  handleUploadCSV,
  formatFileSize,
  formatDate
} from '../services/fileServices'
import { useNavigate } from 'react-router-dom'
import HeaderMapping from '../components/HeaderMapping'
import { matchHeader } from '../services/mappingServices'

import dbHeadersData from '../assets/dbHeaders.json'

const UploadFileView = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const [selectedFiles, setSelectedFiles] = useState([])
  const [fileType, setFileType] = useState('')
  const [fileHeaders, setFileHeaders] = useState([])
  const [uploadType, setUploadType] = useState('')
  const [mapping, setMapping] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [progress, setProgress] = useState(0)

  const [dbHeaders, setDbHeaders] = useState(
    Array.isArray(dbHeadersData.dbHeaders) ? dbHeadersData.dbHeaders : []
  )

  useEffect(() => {
    if (!Array.isArray(dbHeaders)) {
      console.error('dbHeaders is not an array:', dbHeaders)
      setDbHeaders([])
    }
  }, [dbHeaders])

  useEffect(() => {
    if (selectedFiles.length > 0 && selectedFiles[0].headers) {
      setFileHeaders(selectedFiles[0].headers)
    }
  }, [selectedFiles])

  const handleFiles = (event) => {
    handleFileChange(event, fileType, dbHeaders, {
      setMessage,
      setProgress,
      setSelectedFiles,
      setFileHeaders,
      setMapping: (headers) => {
        if (!Array.isArray(dbHeaders)) {
          console.error('dbHeaders is not an array:', dbHeaders)
          return
        }
        const initialMapping = {}
        dbHeaders.forEach((dbHeader) => {
          const match = matchHeader(dbHeader, headers)
          if (match) {
            initialMapping[dbHeader] = match
          }
        })
        setMapping(initialMapping)
      }
    })
  }

  const handleUpload = () => {
    handleUploadCSV(selectedFiles, fileType, uploadType, mapping, token, {
      setIsLoading,
      setMessage,
      setProgress
    })
  }

  const handleGoBack = () => {
    navigate('/Admin')
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <ChartColumnStacked className="h-8 w-8 text-orange-600" />
          <h1 className="text-3xl font-bold text-gray-800">Dosya Yükle</h1>
        </div>
        <div className="flex space-x-4">
          <CustomButton
            label="Geri Dön"
            onClick={handleGoBack}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            icon={ArrowLeft}
          />
        </div>
      </div>
      <div className="bg-white shadow-xl rounded-lg overflow-hidden w-full">
        <div className="px-6 py-8 sm:p-10">
          <div className="space-y-8">
            {/* Dosya Türü Seçimi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dosya Türünü Seçin
              </label>
              <div className="mt-1 flex space-x-4">
                <CustomButton
                  label="Excel"
                  icon={FileType}
                  onClick={() => setFileType('xlsx')}
                  className={`flex-1 inline-flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                    fileType === 'xlsx'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                />

                <CustomButton
                  label="CSV"
                  icon={FileType}
                  onClick={() => setFileType('csv')}
                  className={`flex-1 inline-flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    fileType === 'csv'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                />
              </div>
            </div>

            {/* Dosya Yükleme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dosya Yükleyin</label>
              <div className="mt-1 flex justify-center px-6 pt-20 pb-20 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500"
                    >
                      <span>Dosya yükleyin</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFiles}
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

              {/* İhracat/İthalat Seçimi */}
              {/* Yükleme Türü Seçimi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 mt-8">
                  Yükleme Türünü Seçin
                </label>
                <div className="mt-1 flex space-x-4">
                  <CustomButton
                    label="İhracat"
                    onClick={() => setUploadType('ihracat')}
                    className={`flex-1 inline-flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
                      uploadType === 'ihracat'
                        ? 'bg-orange-600 text-white hover:bg-orange-700'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  />
                  <CustomButton
                    label="İthalat"
                    onClick={() => setUploadType('ithalat')}
                    className={`flex-1 inline-flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                      uploadType === 'ithalat'
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  />
                </div>
              </div>

              {/* Seçilen Dosyalar Listesi */}
              {selectedFiles.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Seçilen Dosyalar</h3>
                  <ul className="bg-white rounded-lg shadow-md divide-y divide-gray-200">
                    {selectedFiles.map((fileObj, index) => {
                      const file = fileObj.file || fileObj
                      return (
                        <li key={index} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <FileText className="h-10 w-10 text-orange-500" />
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
                            <CustomButton
                              label="Dosyayı kaldır"
                              icon={X}
                              onClick={() => {
                                const newFiles = [...selectedFiles]
                                newFiles.splice(index, 1)
                                setSelectedFiles(newFiles)
                              }}
                              className="flex-shrink-0 ml-4 bg-white rounded-full p-1 text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            />
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>

            {/* HeaderMapping Bileşeni */}
            {selectedFiles.length > 0 && fileHeaders.length > 0 && (
              <HeaderMapping
                dbHeaders={dbHeaders}
                setDbHeaders={setDbHeaders}
                fileHeaders={fileHeaders}
                mapping={mapping}
                setMapping={setMapping}
              />
            )}

            {/* Yükle Butonu */}
            <div>
              <CustomButton
                label={isLoading ? 'Yükleniyor...' : 'Veritabanına Yükle'}
                onClick={handleUpload}
                className={`w-full text-white bg-orange-600 hover:bg-orange-700 focus:ring-orange-500 ${
                  isLoading || Object.keys(mapping).length === 0 || !uploadType
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
                icon={!isLoading ? ArrowUpCircle : null}
                disabled={isLoading || Object.keys(mapping).length === 0 || !uploadType}
              >
                {isLoading && (
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
                )}
              </CustomButton>
            </div>

            {/* İlerleme Çubuğu */}
            {isLoading && (
              <div className="mt-4">
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-orange-200">
                    <div
                      style={{ width: `${progress}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-orange-500"
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

export default UploadFileView
