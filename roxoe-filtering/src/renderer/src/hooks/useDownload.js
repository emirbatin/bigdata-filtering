import { useState, useCallback } from 'react'
import axios from 'axios'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { API_URL } from '../main'

export const useDownload = (selectedDataType, filters) => {
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  const handleDownload = useCallback(
    async (zipFileName) => {
      if (!zipFileName) return

      try {
        setIsDownloading(true)
        const zip = new JSZip()
        let allDataFetched = false
        let currentPage = 1
        const chunkSize = 100000
        let chunkIndex = 1
        let totalChunks = 1

        // Fetch first chunk and calculate total chunks
        const initialQuery = new URLSearchParams({
          ...filters,
          limit: chunkSize,
          page: currentPage
        }).toString()
        const initialResponse = await axios.get(
          `${API_URL}/api/v1/commerce/${selectedDataType}?${initialQuery}`
        )

        if (initialResponse?.data?.data) {
          const totalRecords = initialResponse.data.totalRecords
          if (totalRecords > 0) {
            totalChunks = Math.ceil(totalRecords / chunkSize)
          }
          zip.file(`data_chunk_${chunkIndex}.csv`, convertToCSV(initialResponse.data.data))
          chunkIndex++
          currentPage++
          setDownloadProgress(Math.min((chunkIndex / totalChunks) * 100, 100))
        }

        // Fetch remaining chunks
        while (!allDataFetched) {
          const query = new URLSearchParams({
            ...filters,
            limit: chunkSize,
            page: currentPage
          }).toString()
          const response = await axios.get(
            `${API_URL}/api/v1/commerce/${selectedDataType}?${query}`
          )

          if (response?.data?.data?.length > 0) {
            zip.file(`data_chunk_${chunkIndex}.csv`, convertToCSV(response.data.data))
            chunkIndex++
            currentPage++
            setDownloadProgress(Math.min((chunkIndex / totalChunks) * 100, 100))
          } else {
            allDataFetched = true
          }
        }

        const content = await zip.generateAsync({ type: 'blob' })
        saveAs(content, zipFileName)
      } catch (error) {
        console.error('Download error: ', error)
      } finally {
        setIsDownloading(false)
        setDownloadProgress(0)
      }
    },
    [selectedDataType, filters]
  )

  const convertToCSV = (data) => {
    if (data.length === 0) return ''

    const headers = Object.keys(data[0])

    const wrapValue = (value) => {
      if (value === null || value === undefined) {
        return '""'
      }
      if (typeof value === 'number') {
        return value.toFixed(2)
      }
      return `"${String(value).replace(/"/g, '""')}"`
    }

    const rows = data.map((row) => headers.map((header) => wrapValue(row[header])).join(';'))
    const bom = '\uFEFF'

    return bom + [headers.join(';'), ...rows].join('\n')
  }

  return { handleDownload, isDownloading, downloadProgress }
}
