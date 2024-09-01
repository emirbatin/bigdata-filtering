import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB

const AdminView = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [excelHeaders, setExcelHeaders] = useState([]);
  const [csvRows, setCsvRows] = useState([]);
  const [uploadType, setUploadType] = useState('');
  const [mapping, setMapping] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const dbHeaders = [
    'tcgbGumrukIdaresiKodu',
    'tcgbGumrukIdaresiAdi',
    'tcgbTescilNo',
    'tcgbTescilTarihi',
    'tcgbKapanisTarihi',
    'gondericiAliciVergiNo',
    'gondericiAliciAdi',
    'gonderenAdi',
    'cikisUlkesiKodu',
    'cikisUlkesiAdi',
    'menseUlkeKodu',
    'menseUlkeAdi',
    'teslimSekliKodu',
    'kalemSiraNo',
    'kalemRejimKodu',
    'kalemRejimAciklamasi',
    'gtipKodu',
    'gtipAciklamasi',
    'ticariTanimi31',
    'faturaTutari',
    'faturaTutariDovizTuruKodu',
    'faturaTutariDovizTuru',
    'olcuEsyaMiktari',
    'olcuBirimiAciklamasi',
    'netAgirlikKg',
    'hesaplanmisKalemKiymetiUsdDegeri',
    'istatistikiKiymetUsdDegeri'
  ];

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setMessage('');

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const csvData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (csvData.length > 0) {
          const headers = csvData[0];
          const rows = csvData.slice(1).map((row) =>
            headers.reduce((acc, header, index) => {
              acc[header] = row[index];
              return acc;
            }, {})
          );
          setExcelHeaders(headers);
          setCsvRows(rows);
        } else {
          setMessage('Dosya boş veya okunamıyor.');
          setExcelHeaders([]);
          setCsvRows([]);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleMappingChange = (excelHeader, dbField) => {
    setMapping((prevMapping) => ({
      ...prevMapping,
      [dbField]: excelHeader,
    }));
  };

  const handleUploadCSV = async () => {
    if (!selectedFile) {
      setMessage('Lütfen bir dosya seçin.');
      return;
    }

    if (!uploadType) {
      setMessage('Lütfen bir yükleme türü seçin.');
      return;
    }

    const totalChunks = Math.ceil(selectedFile.size / CHUNK_SIZE);
    setIsLoading(true);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = start + CHUNK_SIZE;
      const chunk = selectedFile.slice(start, end);

      const formData = new FormData();
      formData.append('chunk', chunk);
      formData.append('index', i);
      formData.append('totalChunks', totalChunks);

      try {
        const response = await fetch('http://localhost:3000/api/v1/data/upload-chunk', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Parça yükleme hatası');
        }
      } catch (error) {
        console.error(error);
        setMessage('Veri yükleme hatası');
        setIsLoading(false);
        return;
      }
    }

    setMessage('Dosya başarıyla yüklendi');
    setIsLoading(false);

    // Dosya yüklendikten sonra işleme işlemini başlatın
    try {
      const response = await fetch('http://localhost:3000/api/v1/data/process-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: uploadType, mapping }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage(result.message);
      } else {
        setMessage('Veri işleme hatası');
      }
    } catch (error) {
      console.error(error);
      setMessage('Veri işleme hatası');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Admin Panel</h1>
      <p className="text-lg text-gray-600 mb-8">
        Veri seti eklemek için lütfen bir Excel dosyası seçin ve dönüştürün.
      </p>

      <input
        type="file"
        onChange={handleFileChange}
        accept=".xlsx, .xls"
        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
      />

      <div className="mt-6">
        <label className="text-gray-700 mb-2">Yükleme Türü Seçin:</label>
        <div className="flex space-x-4">
          <button
            onClick={() => setUploadType('ihracat')}
            className={`py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 ${
              uploadType === 'ihracat' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
            }`}
            disabled={isLoading}
          >
            İhracat
          </button>
          <button
            onClick={() => setUploadType('ithalat')}
            className={`py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 ${
              uploadType === 'ithalat' ? 'bg-green-600 text-white' : 'bg-green-500 text-white'
            }`}
            disabled={isLoading}
          >
            İthalat
          </button>
        </div>
      </div>

      {excelHeaders.length > 0 && dbHeaders.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-700">Başlık Eşleştirme</h2>
          <div className="grid grid-cols-2 gap-4">
            {dbHeaders.map((dbHeader, index) => (
              <div key={index} className="flex flex-col">
                <label className="text-gray-700">{dbHeader}</label>
                <select
                  className="border border-gray-300 rounded p-2 mt-1"
                  value={mapping[dbHeader] || ''}
                  onChange={(e) => handleMappingChange(e.target.value, dbHeader)}
                >
                  <option value="">--Eşleştirin--</option>
                  {excelHeaders.map((excelHeader, idx) => (
                    <option key={idx} value={excelHeader}>
                      {excelHeader}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleUploadCSV}
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 mt-6"
        disabled={isLoading || Object.keys(mapping).length === 0}
      >
        {isLoading ? 'Yükleniyor...' : 'Veritabanına Aktar'}
      </button>

      {message && (
        <div className="mt-4 text-center text-gray-600">
          <p className="text-lg">{message}</p>
        </div>
      )}
    </div>
  );
};

export default AdminView;
