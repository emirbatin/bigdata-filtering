import React, { useState, useEffect } from 'react';
import { Trash, Plus, XCircle } from 'lucide-react';
import { matchHeader, suggestHeaders } from '../services/mappingServices';

const HeaderMapping = ({ dbHeaders, setDbHeaders, fileHeaders, mapping, setMapping }) => {
  useEffect(() => {
    // Initial auto-mapping
    const initialMapping = {};
    dbHeaders.forEach(dbHeader => {
      const match = matchHeader(dbHeader, fileHeaders);
      if (match) {
        initialMapping[dbHeader] = match;
      }
    });
    setMapping(initialMapping);
  }, [dbHeaders, fileHeaders, setMapping]);

  const handleMappingChange = (dbHeader, fileHeader) => {
    setMapping(prevMapping => ({
      ...prevMapping,
      [dbHeader]: fileHeader
    }));
  };

  const handleRemoveDbHeader = (index) => {
    const newDbHeaders = dbHeaders.filter((_, i) => i !== index);
    setDbHeaders(newDbHeaders);
    setMapping(prevMapping => {
      const { [dbHeaders[index]]: removed, ...rest } = prevMapping;
      return rest;
    });
  };

  const handleAddDbHeader = () => {
    const newHeader = `Yeni Başlık ${dbHeaders.length + 1}`;
    setDbHeaders([...dbHeaders, newHeader]);
  };

  const handleDbHeaderChange = (index, newValue) => {
    const oldHeader = dbHeaders[index];
    const newDbHeaders = [...dbHeaders];
    newDbHeaders[index] = newValue;
    setDbHeaders(newDbHeaders);
    setMapping(prevMapping => {
      const { [oldHeader]: oldValue, ...rest } = prevMapping;
      return {
        ...rest,
        [newValue]: oldValue
      };
    });
  };

  const handleClearUnmapped = () => {
    const newDbHeaders = dbHeaders.filter(header => mapping[header] && mapping[header] !== '');
    setDbHeaders(newDbHeaders);
    const newMapping = Object.fromEntries(
      Object.entries(mapping).filter(([key, value]) => value && value !== '')
    );
    setMapping(newMapping);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Başlık Eşleştirme</h2>
      <div className="space-y-4">
        {dbHeaders.map((dbHeader, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="text"
              className="flex-1 border rounded-md p-2"
              value={dbHeader}
              onChange={(e) => handleDbHeaderChange(index, e.target.value)}
              placeholder="DB Başlık Adı"
            />
            <select
              className="flex-1 border rounded-md p-2 bg-white"
              value={mapping[dbHeader] || ''}
              onChange={(e) => handleMappingChange(dbHeader, e.target.value)}
            >
              <option value="">--Eşleştirme--</option>
              {fileHeaders.map((fileHeader, idx) => (
                <option key={idx} value={fileHeader}>
                  {fileHeader}
                </option>
              ))}
            </select>
            <button
              onClick={() => handleRemoveDbHeader(index)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={handleAddDbHeader}
          className="flex items-center space-x-2 text-green-500 hover:text-green-700"
        >
          <Plus className="h-5 w-5" />
          <span>Yeni Başlık Ekle</span>
        </button>
        <button
          onClick={handleClearUnmapped}
          className="flex items-center space-x-2 text-orange-500 hover:text-orange-700"
        >
          <XCircle className="h-5 w-5" />
          <span>Eşleştirilmemiş Başlıkları Temizle</span>
        </button>
      </div>
    </div>
  );
};

export default HeaderMapping;