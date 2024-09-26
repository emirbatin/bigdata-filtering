import React, { useCallback, useRef, useState, useMemo, useEffect } from 'react'
import { X, Download, RefreshCw, Menu, UserCheck, LogOut, ChartColumnStacked } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import CustomButton from '../components/CustomButton'
import CustomIconButton from '../components/CustomIconButton'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import Loading from '../components/Loading.jsx'
import { useData } from '../hooks/useData'
import { useDownload } from '../hooks/useDownload.js'
import Pagination from '../components/Pagination.jsx'
import { getCurrentUser, logout } from '../services/authServices'

const DataTableView = () => {
  const gridRef = useRef(null);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const navigate = useNavigate()

  const itemsPerPage = 50
  const [selectedRows, setSelectedRows] = useState([])
  const [lastSelectedRow, setLastSelectedRow] = useState(null)

  const userData = getCurrentUser()
  const isAdmin = userData?.permission === 'admin'

  const {
    data = [],
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
  } = useData('import') // default type 'import'

  const { handleDownload, isDownloading, downloadProgress } = useDownload(selectedDataType, filters)

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (!userData) {
      navigate('/')
    }
  }, [userData, navigate])

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  const handleRowClick = (event) => {
    const index = event.node.rowIndex
    setSelectedRows([index])
    setLastSelectedRow(index)
  }

  const handleLogout = async () => {
    logout()
    navigate('/login')
  }

  const handleAdminClick = () => {
    navigate('/admin')
  }
  const columnDefs = useMemo(
    () =>
      Object.keys(data[0] || {})
        .filter((key) => !['id', '_id', '__v', 'createdAt', 'updatedAt'].includes(key))
        .map((key) => ({
          headerName: key,
          field: key,
          resizable: true,
          sortable: true,
          filter: true
        })),
    [data]
  )

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  useEffect(() => {
    if (gridApi && gridColumnApi) {
      gridApi.sizeColumnsToFit();
      gridApi.ensureIndexVisible(0, 'middle');
    }
  }, [gridApi, gridColumnApi, data]);

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
      className="flex h-screen bg-gray-100 overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div
        className={`flex flex-col p-6 flex-grow transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'mr-80' : 'mr-0'
        } relative z-0`}
      >
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <ChartColumnStacked className="h-8 w-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-800">İthalat ve İhracat Verileri</h1>
          </div>
        </header>

        <motion.div
          className="mb-4 flex space-x-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <CustomButton
            label="İthalat Verileri"
            onClick={() => setSelectedDataType('import')}
            className={`py-2 px-4 ${
              selectedDataType === 'import'
                ? 'bg-orange-500 text-white'
                : 'bg-white hover:bg-gray-100 text-gray-800'
            }`}
          />
          <CustomButton
            label="İhracat Verileri"
            onClick={() => setSelectedDataType('export')}
            className={`py-2 px-4 ${
              selectedDataType === 'export'
                ? 'bg-orange-500 text-white'
                : 'bg-white hover:bg-gray-100 text-gray-800'
            }`}
          />

          <CustomButton
            label="Yenile"
            onClick={refreshData}
            className="bg-indigo-500 text-white hover:bg-indigo-600 py-2 px-4"
            icon={RefreshCw}
          />
          <CustomButton
            label={
              isDownloading ? `${Math.round(downloadProgress)}% İndiriliyor...` : 'Verileri İndir'
            }
            onClick={() => handleDownload(`${selectedDataType}_verileri.zip`)}
            className={`bg-green-500 text-white py-2 px-4 ${isDownloading ? 'cursor-not-allowed' : 'hover:bg-green-600'}`}
            icon={isDownloading ? null : Download}
            disabled={isDownloading}
          />
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-lg p-4 flex-grow flex flex-col relative w-full overflow-auto"
          style={{ userSelect: 'none' }}
          variants={tableVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-2xl mb-4 font-semibold text-gray-700">
            {selectedDataType === 'import' ? 'İthalat Verileri' : 'İhracat Verileri'}
          </h2>

          <AnimatePresence>
            {tableLoading ? (
              <motion.div className="flex justify-center items-center min-h-[400px]">
                <Loading />
              </motion.div>
            ) : (
              <motion.div className="ag-theme-alpine w-auto h-full ">
                <AgGridReact
                  ref={gridRef}
                  columnDefs={columnDefs}
                  rowData={data}
                  defaultColDef={{
                    flex: 1,
                    minWidth: 100,
                    resizable: true,
                    sortable: true,
                    filter: true
                  }}
                  onGridReady={onGridReady}
                  suppressHorizontalScroll={false}
                  alwaysShowHorizontalScroll={true}
                  alwaysShowVerticalScroll={true}
                  enableCellTextSelection={true}
                  suppressCellSelection={true}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
        />
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        filters={filters}
        setFilters={setFilters}
        applyFilters={refreshData}
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
          <CustomIconButton
            onClick={toggleSidebar}
            className="w-12 h-12 p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center"
            icon={isSidebarOpen ? X : Menu}
            iconSize={24}
          />
          {isAdmin && (
            <CustomIconButton
              onClick={handleAdminClick}
              className="w-12 h-12 p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full shadow-lg flex items-center justify-center"
              icon={UserCheck}
            />
          )}
          <CustomIconButton
            onClick={handleLogout}
            className="w-12 h-12 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center"
            icon={LogOut}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}

export default React.memo(DataTableView)
