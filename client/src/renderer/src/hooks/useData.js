import { useState, useEffect, useCallback } from 'react'

export const useData = (selectedDataType) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageGroup, setPageGroup] = useState(0)
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

  const applyFilters = useCallback(async () => {
    setLoading(true)

    const query = new URLSearchParams({
      ...filters,
      page: currentPage,
      limit: 30 // Assuming 30 items per page
    }).toString()

    console.log('Query Params:', query) // Add this line to log the query params

    try {
      const url = `http://localhost:3000/api/v1/commerce/${selectedDataType}?${query}`
      console.log('API Request URL:', url) // Add this line to check the full URL
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('API Response:', result) // Add this to log the backend response
      setData(result.data)
      setTotalPages(result.totalPages)
    } catch (error) {
      console.error('Veri çekme hatası:', error)
    } finally {
      setLoading(false)
    }
  }, [filters, currentPage, selectedDataType])

  useEffect(() => {
    applyFilters()
  }, [applyFilters, currentPage, selectedDataType])

  const handlePageChange = useCallback((pageNumber) => {
    setCurrentPage(pageNumber)
  }, [])

  return {
    data,
    loading,
    currentPage,
    totalPages,
    pageGroup,
    filters,
    setFilters,
    applyFilters,
    handlePageChange,
    setPageGroup
  }
}
