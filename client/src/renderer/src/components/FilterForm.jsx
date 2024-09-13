import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  RefreshCw,
  Menu,
  UserCheck,
  LogOut
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import CustomButton from './CustomButton'
import CustomIconButton from './CustomIconButton'

const FilterForm = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(30)
  const [selectedDataType, setSelectedDataType] = useState('import')
  const [selectedRows, setSelectedRows] = useState([]) // Seçilen satırların dizisi
  const [lastSelectedRow, setLastSelectedRow] = useState(null) // Son tıklanan satır
  const [totalPages, setTotalPages] = useState(1)
  const [pageGroup, setPageGroup] = useState(0)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false) // Değiştirilen kısım
  const navigate = useNavigate()
  const [filters, setFilters] = useState({
    tcgbTescilNo: '',
    vergiNo: '',
    gondericiAliciAdi: '',
    aliciAdi: '',
    gonderenAdi: '',
    cikisUlkeKodu: '',
    cikisUlkeAdi: '',
    menseUlkeKodu: '',
    menseUlkeAdi: '',
    tescilTarihi: '',
    kapanisTarihi: '',
    minFaturaTutari: '',
    maxFaturaTutari: '',
    gtipKodu: ''
  })

  const handleRowClick = (index, event) => {
    if (event.shiftKey && lastSelectedRow !== null) {
      const start = Math.min(lastSelectedRow, index)
      const end = Math.max(lastSelectedRow, index)
      let newSelectedRows = [...selectedRows]

      // Eğer tıklanan satır zaten seçiliyse, onu listeden çıkar
      if (newSelectedRows.includes(index)) {
        newSelectedRows = newSelectedRows.filter((row) => row !== index)
      } else {
        // Değilse, aradaki tüm satırları seç
        for (let i = start; i <= end; i++) {
          if (!newSelectedRows.includes(i)) {
            newSelectedRows.push(i)
          }
        }
      }

      setSelectedRows(newSelectedRows)
    } else {
      // Shift'e basılı değilse, sadece tıklanan satırı seç ve diğer seçimleri kaldır
      setSelectedRows([index])
    }
    setLastSelectedRow(index)
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/user/logout', {
        method: 'POST',
        credentials: 'include'
      })
      if (response.ok) {
        console.log('Başarıyla çıkış yaptınız.')
        navigate('/')
      } else {
        console.log('Çıkış işlemi başarısız.')
      }
    } catch (error) {
      console.log('Çıkış işlemi sırasında hata oluştu.')
    }
  }

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token')

      if (!token) {
        console.error('Token bulunamadı, kullanıcı doğrulanamıyor.')
        return
      }

      try {
        const response = await fetch('http://localhost:3000/api/v1/user/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Kullanıcı verisi alınamadı')
        }

        const data = await response.json()
        setIsAdmin(data.permission === 'admin') // Kullanıcının admin olup olmadığını kontrol ediyoruz
      } catch (error) {
        console.error('Kullanıcı verisi alınırken hata oluştu:', error)
      }
    }

    fetchUserData()
  }, [])

  const handleAdminClick = () => {
    navigate('/Admin')
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCellContent = (key, value) => {
    if (typeof value === 'string' && value.includes('T00:00:00.000Z')) {
      return formatDate(value)
    }
    return value
  }

  const applyFilters = useCallback(async () => {
    setLoading(true)

    console.log('Uygulanan filtreler:', filters)

    const query = new URLSearchParams({
      ...filters,
      page: currentPage,
      limit: itemsPerPage
    }).toString()

    console.log('Oluşturulan sorgu stringi:', query)

    try {
      const url = `http://localhost:3000/api/v1/commerce/${selectedDataType}?${query}`
      console.log("İstek URL'si:", url)

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Backend yanıtı:', result)

      setData(result.data)
      setTotalPages(result.totalPages)

      console.log('Alınan veri sayısı:', result.data.length)
      console.log('Toplam sayfa sayısı:', result.totalPages)
      console.log('Mevcut sayfa:', currentPage)

      if (filters.gondericiAliciAdi) {
        console.log('gondericiAliciAdi filtresi uygulandı:', filters.gondericiAliciAdi)
        console.log(
          'Bu filtreyle eşleşen veri sayısı:',
          result.data.filter(
            (item) =>
              item.gonderici_alici_adi &&
              item.gonderici_alici_adi
                .toLowerCase()
                .includes(filters.gondericiAliciAdi.toLowerCase())
          ).length
        )
      }
    } catch (error) {
      console.error('Veri çekme hatası:', error)
      alert(`Veri çekilirken bir hata oluştu: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }, [filters, currentPage, itemsPerPage, selectedDataType])

  useEffect(() => {
    applyFilters()
  }, [applyFilters, currentPage, selectedDataType])

  const handlePageChange = useCallback((pageNumber) => {
    setCurrentPage(pageNumber)
  }, [])

  const renderPageNumbers = useMemo(() => {
    if (totalPages > 0) {
      const pages = []
      const startPage = pageGroup * 10 + 1
      const endPage = Math.min(startPage + 9, totalPages)

      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <CustomButton
            key={i}
            label={i.toString()}
            onClick={() => handlePageChange(i)}
            className={`px-3 py-1 mx-1 rounded ${
              currentPage === i ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          />
        )
      }
      return pages
    }
    return null
  }, [pageGroup, totalPages, currentPage, handlePageChange])

  const filterColumns = useMemo(() => {
    const hiddenColumns = ['id', '_id']
    return (key) => !hiddenColumns.includes(key)
  }, [])

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev)
  }, [])

  const handleDataTypeChange = useCallback((type) => {
    setSelectedDataType(type)
    setCurrentPage(1)
    setPageGroup(0)
  }, [])

  const handleDownload = useCallback(() => {
    console.log('Veriler indiriliyor...')
  }, [])

  const containerVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  }

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, delay: 0.2 } }
  }

  return (
    <motion.div
      className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div
        className={`flex flex-col p-6 flex-grow transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'mr-80' : 'mr-0'
        } relative z-0`}
      >
        <motion.div
          className="flex justify-between items-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold text-gray-800">İthalat ve İhracat Verileri</h1>
        </motion.div>

        <motion.div
          className="mb-4 flex space-x-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <CustomButton
            label="İthalat Verileri"
            onClick={() => handleDataTypeChange('import')}
            className={`py-2 px-4 ${
              selectedDataType === 'import'
                ? 'bg-blue-500 text-white'
                : 'bg-white hover:bg-gray-100 text-gray-800'
            }`}
          />
          <CustomButton
            label="İhracat Verileri"
            onClick={() => handleDataTypeChange('export')}
            className={`py-2 px-4 ${
              selectedDataType === 'export'
                ? 'bg-blue-500 text-white'
                : 'bg-white hover:bg-gray-100 text-gray-800'
            }`}
          />

          {/* Verileri İndir Butonu Şu Anda Deaktif
          <CustomButton
            label="Verileri İndir"
            onClick={handleDownload}
            className="bg-green-500 text-white hover:bg-green-600 py-2 px-4"
            icon={Download}
          />
          */}
          
          <CustomButton
            label="Yenile"
            onClick={applyFilters}
            className="bg-indigo-500 text-white hover:bg-indigo-600 py-2 px-4"
            icon={RefreshCw}
          />
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-lg p-4 flex-grow flex flex-col relative w-[97vw] overflow-x-auto"
          style={{ userSelect: 'none' }}
          variants={tableVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-2xl mb-4 font-semibold text-gray-700">
            {selectedDataType === 'import' ? 'İthalat Verileri' : 'İhracat Verileri'}
          </h2>

          <AnimatePresence>
            {loading ? (
              <motion.div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              </motion.div>
            ) : (
              <motion.div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                <table className="min-w-[800px] divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      {data.length > 0 &&
                        Object.keys(data[0])
                          .filter(filterColumns)
                          .map((key) => (
                            <th
                              key={key}
                              className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                            >
                              {key}
                            </th>
                          ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.slice(0, 20).map((item, index) => (
                      <motion.tr
                        key={index}
                        className={`cursor-pointer ${
                          selectedRows.includes(index) ? 'bg-blue-100' : 'hover:bg-gray-50'
                        }`}
                        onClick={(event) => handleRowClick(index, event)} // Shift + Tıklama işlevi
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {Object.keys(item)
                          .filter(filterColumns)
                          .map((key, i) => (
                            <td
                              key={i}
                              className="px-3 py-2 whitespace-normal break-words text-sm text-gray-500"
                              style={{ maxWidth: '300px' }}
                            >
                              {formatCellContent(key, item[key])}
                            </td>
                          ))}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="flex justify-start mt-4 space-x-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <CustomButton
            label="Önceki"
            onClick={() => pageGroup > 0 && setPageGroup(pageGroup - 1)}
            className={`px-3 py-1 ${
              pageGroup > 0
                ? 'bg-white hover:bg-gray-100 text-gray-800'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            icon={ChevronLeft}
            disabled={pageGroup === 0}
          />
          {renderPageNumbers}
          <CustomButton
            label="Sonraki"
            onClick={() => pageGroup < Math.floor(totalPages / 10) && setPageGroup(pageGroup + 1)}
            className={`px-3 py-1 ${
              pageGroup < Math.floor(totalPages / 10)
                ? 'bg-white hover:bg-gray-100 text-gray-800'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            icon={ChevronRight}
            disabled={pageGroup >= Math.floor(totalPages / 10)}
          />
        </motion.div>
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        filters={filters}
        setFilters={setFilters}
        applyFilters={applyFilters}
      />
      <motion.div
        className={`fixed top-4 right-4 z-50 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'mr-80' : 'mr-0'
        }`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex flex-col items-center space-y-4">
          {/* Menü Butonu */}
          <CustomIconButton
            onClick={toggleSidebar}
            className="w-12 h-12 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center"
            icon={isSidebarOpen ? X : Menu}
            iconSize={24}
          />
          {/* Admin Butonu */}
          {isAdmin ? (
            <>
              <CustomIconButton
                onClick={handleAdminClick}
                className="w-12 h-12 p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-lg flex items-center justify-center"
                icon={UserCheck}
                data-tooltip-id="admin-tooltip"
                data-tooltip-content="Admin Paneli"
              />
            </>
          ) : (
            <>
              {/* Çıkış Yap Butonu */}
              <CustomIconButton
                onClick={handleLogout} // handleLogout fonksiyonu daha önce tanımladığınız logout işlemi için
                className="w-12 h-12 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center"
                data-tooltip-id="logout-tooltip"
                icon={LogOut}
                data-tooltip-content="Çıkış Yap"
              />
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default React.memo(FilterForm)
