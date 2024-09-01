import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import CustomTextBox from './CustomTextBox';
import CustomDate from './CustomDate';
import CustomSelectBox from './CustomSelectBox';
import menseiUlkeData from '../assets/menseulke.json';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    tcgbTescilNo: '',
    vergiNo: '',
    aliciAdi: '',
    gonderenAdi: '',
    cikisUlkeKodu: '',
    cikisUlkeAdi: '',
    menseUlkeKodu: '',
    menseUlkeAdi: '',
    tescilTarihi: '',
    kapanisTarihi: '',
    selectOption: '',
  });

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let updatedFilters = {
      ...filters,
      [name]: value,
    };

    // Menşe Ülke Kodu girildiğinde, ülke adını tahmin et
    if (name === 'menseUlkeKodu') {
      const matchedCountry = menseiUlkeData.find(item =>
        item.code.toLowerCase().startsWith(value.toLowerCase())
      );
      if (matchedCountry) {
        updatedFilters.menseUlkeAdi = matchedCountry.name;
      } else {
        updatedFilters.menseUlkeAdi = '';
      }
    } else if (name === 'menseUlkeAdi') {
      // Menşe Ülke Adı seçildiğinde, ülke kodunu otomatik olarak güncelle
      const matchedCountry = menseiUlkeData.find(item =>
        item.name.toLowerCase() === value.toLowerCase()
      );
      if (matchedCountry) {
        updatedFilters.menseUlkeKodu = matchedCountry.code;
      } else {
        updatedFilters.menseUlkeKodu = '';
      }
    }

    setFilters(updatedFilters);
  };

  return (
    <div>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-4 left-4 z-30 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
          isOpen ? 'translate-x-64' : ''
        } transition-transform duration-300 ease-in-out`}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ padding: '1.5rem' }}
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-200">Filtre Ayarı</h2>
        <div className="flex flex-col space-y-4 overflow-y-auto h-[calc(100%-4rem)] pr-2 pb-4">
          {/* Input fields */}
          {[
            { label: 'TCGB Tescil No', name: 'tcgbTescilNo', type: 'text', value: filters.tcgbTescilNo },
            { label: 'Gönderici / Alıcı Vergi No', name: 'vergiNo', type: 'text', value: filters.vergiNo },
            { label: 'Gönderici/Alıcı Adı', name: 'aliciAdi', type: 'text', value: filters.aliciAdi },
            { label: 'Gönderen Adı', name: 'gonderenAdi', type: 'text', value: filters.gonderenAdi },
            { label: 'Çıkış Ülkesi Kodu', name: 'cikisUlkeKodu', type: 'text', value: filters.cikisUlkeKodu },
            { label: 'Çıkış Ülkesi Adı', name: 'cikisUlkeAdi', type: 'text', value: filters.cikisUlkeAdi },
            { label: 'Menşe Ülke Kodu', name: 'menseUlkeKodu', type: 'text', value: filters.menseUlkeKodu },
          ].map((item, index) => (
            <div key={index} className="flex flex-col">
              <label htmlFor={item.name} className="text-sm font-semibold text-gray-400 mb-1">{item.label}</label>
              <CustomTextBox
                id={item.name}
                name={item.name}
                placeholder="Ara"
                value={item.value}
                onChange={handleInputChange}
                className="shadow-sm bg-gray-800 text-white placeholder-gray-400 px-3 py-2 rounded w-full"
              />
            </div>
          ))}
          {/* Select field for Menşe Ülke Adı */}
          <div className="flex flex-col">
            <label htmlFor="menseUlkeAdi" className="text-sm font-semibold text-gray-400 mb-1">Menşe Ülke Adı</label>
            <CustomSelectBox
              id="menseUlkeAdi"
              name="menseUlkeAdi"
              value={filters.menseUlkeAdi}
              onChange={handleInputChange}
              options={menseiUlkeData.map(item => item.name)}
              className="shadow-sm bg-gray-800 text-white px-3 py-2 rounded w-full"
            />
          </div>
          {/* Date fields */}
          {[
            { label: 'TCGB Tescil Tarihi', name: 'tescilTarihi', type: 'date', value: filters.tescilTarihi },
            { label: 'TCGB Kapanış Tarihi', name: 'kapanisTarihi', type: 'date', value: filters.kapanisTarihi },
          ].map((item, index) => (
            <div key={index} className="flex flex-col">
              <label htmlFor={item.name} className="text-sm font-semibold text-gray-400 mb-1">{item.label}</label>
              <CustomDate
                id={item.name}
                name={item.name}
                value={item.value}
                onChange={handleInputChange}
                className="shadow-sm bg-gray-800 text-white px-3 py-2 rounded w-full"
              />
            </div>
          ))}
          {/* Future Select fields */}
          {[
            { label: 'Seçiniz', name: 'selectOption', type: 'select', value: filters.selectOption, options: ['Option 1', 'Option 2', 'Option 3'] },
          ].map((item, index) => (
            <div key={index} className="flex flex-col">
              <label htmlFor={item.name} className="text-sm font-semibold text-gray-400 mb-1">{item.label}</label>
              <CustomSelectBox
                id={item.name}
                name={item.name}
                value={item.value}
                onChange={handleInputChange}
                options={item.options}
                className="shadow-sm bg-gray-800 text-white px-3 py-2 rounded w-full"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
