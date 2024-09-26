import React, { useMemo, useState } from 'react';
import CustomButton from './CustomButton';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, handlePageChange }) => {
  const [pageGroup, setPageGroup] = useState(0); // 0 -> 1-10, 1 -> 11-20, ...

  const pagesPerGroup = 10; // Her grupta gösterilecek sayfa sayısı
  const totalGroups = Math.ceil(totalPages / pagesPerGroup); // Toplam grup sayısı

  // Sayfa numaralarını gruplar halinde göstermek için hesaplama
  const renderPageNumbers = useMemo(() => {
    const startPage = pageGroup * pagesPerGroup + 1; // Gruptaki ilk sayfa
    const endPage = Math.min(startPage + pagesPerGroup - 1, totalPages); // Gruptaki son sayfa

    const pages = [];
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
      );
    }
    return pages;
  }, [currentPage, pageGroup, totalPages, handlePageChange]);

  return (
    <div className="flex justify-start mt-4 space-x-2">
      {/* Önceki grup */}
      <CustomButton
        label="Önceki"
        onClick={() => setPageGroup(pageGroup - 1)}
        className={`px-3 py-1 ${
          pageGroup > 0
            ? 'bg-white hover:bg-gray-100 text-gray-800'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
        icon={ChevronLeft}
        disabled={pageGroup === 0} // İlk grupta ise disabled
      />

      {/* Sayfa numaraları */}
      {renderPageNumbers}

      {/* Sonraki grup */}
      <CustomButton
        label="Sonraki"
        onClick={() => setPageGroup(pageGroup + 1)}
        className={`px-3 py-1 ${
          pageGroup < totalGroups - 1
            ? 'bg-white hover:bg-gray-100 text-gray-800'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
        icon={ChevronRight}
        disabled={pageGroup >= totalGroups - 1} // Son grupta ise disabled
      />
    </div>
  );
};

export default Pagination;
