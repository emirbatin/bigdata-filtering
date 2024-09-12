import React, { useCallback, useMemo } from 'react'
import { Menu, X, Search, Filter, ChevronDown } from 'lucide-react'
import menseiUlkeData from '../assets/menseulke.json'
import { motion } from 'framer-motion'

const Button = React.memo(({ children, className, ...props }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background ${className}`}
    {...props}
  >
    {children}
  </motion.button>
))

const Input = React.memo(
  React.forwardRef(({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ${className}`}
      ref={ref}
      {...props}
    />
  ))
)

const Label = React.memo(
  React.forwardRef(({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
      {...props}
    />
  ))
)

const Select = React.memo(({ children, className, ...props }) => (
  <div className="relative">
    <select
      className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none ${className}`}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
  </div>
))

const DatePicker = React.memo(({ className, ...props }) => (
  <Input type="date" className={`${className}`} {...props} />
))

const Sidebar = ({ isOpen, toggleSidebar, filters, setFilters, applyFilters }) => {
  const handleInputChange = useCallback(
    (name, value) => {
      setFilters((prevFilters) => {
        const updatedFilters = { ...prevFilters, [name]: value }

        if (name === 'menseUlkeKodu' || name === 'menseUlkeAdi') {
          const matchedCountry = menseiUlkeData.find((item) =>
            name === 'menseUlkeKodu'
              ? item.code.toLowerCase().startsWith(value.toLowerCase())
              : item.name.toLowerCase() === value.toLowerCase()
          )

          updatedFilters.menseUlkeKodu = matchedCountry ? matchedCountry.code : ''
          updatedFilters.menseUlkeAdi = matchedCountry ? matchedCountry.name : ''
        }

        return updatedFilters
      })
    },
    [setFilters]
  )

  const filterInputs = useMemo(
    () => [
      { label: 'TCGB Tescil No', name: 'tcgbTescilNo' },
      { label: 'Gönderici / Alıcı Vergi No', name: 'vergiNo' },
      { label: 'Gönderici Alıcı Adı', name: 'gondericiAliciAdi' },
      { label: 'Alıcı Adı', name: 'aliciAdi' },
      { label: 'Gönderen Adı', name: 'gonderenAdi' },
      { label: 'Çıkış Ülkesi Kodu', name: 'cikisUlkeKodu' },
      { label: 'Çıkış Ülkesi Adı', name: 'cikisUlkeAdi' },
      { label: 'Menşe Ülke Kodu', name: 'menseUlkeKodu' },
      { label: 'GTIP Kodu', name: 'gtipKodu' },
      { label: 'Min Fatura Tutarı', name: 'minFaturaTutari', type: 'number' },
      { label: 'Max Fatura Tutarı', name: 'maxFaturaTutari', type: 'number' }
    ],
    []
  )

  return (
    <div className="relative">
      <motion.div
        initial={false}
        animate={{ x: isOpen ? '0%' : '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-0 right-0 h-full w-80 bg-gradient-to-bl from-gray-900 to-gray-800 text-white overflow-hidden z-50 shadow-lg"
      >
        <div className="flex items-center justify-between p-6 bg-gradient-to-l from-blue-600 to-blue-800">
          <Filter className="text-white" />
          <h2 className="text-2xl font-bold text-white">Filtre Ayarı</h2>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto h-[calc(100%-80px)] custom-scrollbar">
          {filterInputs.map((item) => (
            <motion.div
              key={item.name}
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Label htmlFor={item.name} className="text-sm font-medium text-gray-300">
                {item.label}
              </Label>
              <div className="relative">
                <Input
                  id={item.name}
                  name={item.name}
                  type={item.type || 'text'}
                  placeholder="Ara"
                  value={filters[item.name]}
                  onChange={(e) => handleInputChange(item.name, e.target.value)}
                  className="bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                />
                <Search
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
              </div>
            </motion.div>
          ))}

          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Label htmlFor="menseUlkeAdi" className="text-sm font-medium text-gray-300">
              Menşe Ülke Adı
            </Label>
            <Select
              id="menseUlkeAdi"
              name="menseUlkeAdi"
              value={filters.menseUlkeAdi}
              onChange={(e) => handleInputChange('menseUlkeAdi', e.target.value)}
              className="bg-gray-700 text-white border-gray-600 focus:border-blue-500"
            >
              <option value="">Ülke seçin</option>
              {menseiUlkeData.map((country) => (
                <option key={country.code} value={country.name}>
                  {country.name}
                </option>
              ))}
            </Select>
          </motion.div>

          {['tescilTarihi', 'kapanisTarihi'].map((item, index) => (
            <motion.div
              key={item}
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
            >
              <Label htmlFor={item} className="text-sm font-medium text-gray-300">
                {item === 'tescilTarihi' ? 'TCGB Tescil Tarihi' : 'TCGB Kapanış Tarihi'}
              </Label>
              <DatePicker
                id={item}
                name={item}
                value={filters[item]}
                onChange={(e) => handleInputChange(item, e.target.value)}
                className="bg-gray-700 text-white border-gray-600 focus:border-blue-500"
              />
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Button
              onClick={applyFilters}
              className="bg-blue-500 text-white hover:bg-blue-600 w-full py-2 mt-4"
            >
              Filtreleri Uygula
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={false}
        animate={{ x: isOpen ? '320px' : '0' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-4 right-4 z-50" // left-4 yerine right-4
      ></motion.div>
    </div>
  )
}

export default React.memo(Sidebar)
