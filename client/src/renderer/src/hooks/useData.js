import { useState, useEffect, useCallback } from 'react'
import { API_URL } from '../main' // API URL'yi buradan alıyoruz

export const useData = (initialDataType) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)
  const [selectedDataType, setSelectedDataType] = useState(initialDataType)
  const [totalPages, setTotalPages] = useState(1)
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

  // Hata yönetimi için bir fonksiyon
  const handleError = (error) => {
    console.error('Veri çekme hatası:', error)
    alert(`Veri çekilirken bir hata oluştu: ${error.message}`)
  }

  // API'den veriyi çeken fonksiyon
  const fetchData = async () => {
    setLoading(true)
    const query = new URLSearchParams({
      ...filters,
      page: currentPage,
      limit: itemsPerPage
    }).toString()

    try {
      const url = `${API_URL}/api/v1/commerce/${selectedDataType}?${query}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setData(result.data)
      setTotalPages(result.totalPages)
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  // Filtreler ya da sayfa numarası değiştiğinde veriyi yeniden getir
  useEffect(() => {
    fetchData()
  }, [filters, currentPage, selectedDataType]) // Tetikleyiciler

  // Filtre değişikliğini yöneten fonksiyon
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value
    }))
  }

  // Sayfa değişikliği
  const handlePageChange = useCallback((pageNumber) => {
    setCurrentPage(pageNumber)
  }, [])

  // Yenileme işlemi için manuel çağrılacak fonksiyon
  const refreshData = () => {
    fetchData()
  }

  return {
    data,
    loading,
    currentPage,
    totalPages,
    filters,
    setFilters,
    handleFilterChange,
    fetchData, // Manuel yenileme veya başka yerlerden tetiklemek için kullanılabilir
    handlePageChange,
    selectedDataType,
    setSelectedDataType,
    refreshData // Yenileme işlemi
  }
}
