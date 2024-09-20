import React, { useMemo } from 'react'
import CustomButton from './CustomButton'
import {
    ChevronLeft,
    ChevronRight,
  } from 'lucide-react'

const Pagination = ({ currentPage, totalPages, handlePageChange }) => {
  const renderPageNumbers = useMemo(() => {
    if (totalPages > 0) {
      const pages = []
      const startPage = (currentPage - 1) * 10 + 1
      const endPage = Math.min(startPage + 9, totalPages)

      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <CustomButton
            key={i}
            label={i.toString()}
            onClick={() => handlePageChange(i)}
            className={`px-3 py-1 mx-1 rounded ${
              currentPage === i ? 'bg-orange-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          />
        )
      }
      return pages
    }
    return null
  }, [currentPage, totalPages, handlePageChange])

  return (
    <div className="flex justify-start mt-4 space-x-2">
      <CustomButton
        label="Önceki"
        onClick={() => handlePageChange(currentPage - 1)}
        className={`px-3 py-1 ${
          currentPage > 1
            ? 'bg-white hover:bg-gray-100 text-gray-800'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
        icon={ChevronLeft}
        disabled={currentPage === 1}
      />
      {renderPageNumbers}
      <CustomButton
        label="Sonraki"
        onClick={() => handlePageChange(currentPage + 1)}
        className={`px-3 py-1 ${
          currentPage < totalPages
            ? 'bg-white hover:bg-gray-100 text-gray-800'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
        icon={ChevronRight}
        disabled={currentPage >= totalPages}
      />
    </div>
  )
}

export default Pagination
