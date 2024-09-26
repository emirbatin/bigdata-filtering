import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import moment from 'moment'

const API_URL = 'http://localhost:3000'

export const useData = (initialDataType) => {
  const [data, setData] = useState([])
  const [tableLoading, setTableLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)
  const [selectedDataType, setSelectedDataType] = useState(initialDataType)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({})

  const isDateField = (fieldName) => {
    return fieldName.toLowerCase().includes('tarih') || fieldName.toLowerCase().includes('date')
  }

  const formatDates = (obj) => {
    const formattedObj = { ...obj }
    Object.keys(formattedObj).forEach((key) => {
      if (isDateField(key) && formattedObj[key]) {
        formattedObj[key] = moment(formattedObj[key]).format('YYYY-MM-DD')
      }
    })
    return formattedObj
  }

  const fetchData = useCallback(async () => {
    setTableLoading(true)
    const controller = new AbortController()

    const formattedFilters = formatDates(filters)

    const query = new URLSearchParams({
      ...formattedFilters,
      page: currentPage,
      limit: itemsPerPage
    }).toString()

    try {
      const response = await axios.get(`${API_URL}/api/v1/commerce/${selectedDataType}?${query}`, {
        signal: controller.signal
      })
      const result = response.data

      const formattedData = result.data.map((item) => formatDates(item))

      setData(formattedData)
      setTotalPages(result.totalPages)
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Veri çekme hatası:', error)
      }
    } finally {
      setTableLoading(false)
    }

    return () => {
      controller.abort()
    }
  }, [filters, currentPage, selectedDataType, itemsPerPage])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value
    }))
  }

  const handlePageChange = useCallback((pageNumber) => {
    setCurrentPage(pageNumber)
  }, [])

  const refreshData = () => {
    fetchData()
  }

  return {
    data,
    tableLoading,
    currentPage,
    totalPages,
    filters,
    setFilters,
    handleFilterChange,
    handlePageChange,
    selectedDataType,
    setSelectedDataType,
    refreshData
  }
}
