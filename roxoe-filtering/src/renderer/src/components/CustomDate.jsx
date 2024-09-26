import React, { useState } from 'react';

const CustomDate = ({ className }) => {
  const [selectedDate, setSelectedDate] = useState('');

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  return (
    <div className="flex flex-col items-start">
      <input
        type="date"
        value={selectedDate}
        onChange={handleDateChange}
        className={`p-2 border border-gray-700 bg-gray-800 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-700 transition-colors duration-200 ${className}`}
      />
      {selectedDate && (
        <p className="mt-2 text-sm text-gray-400">
          Selected Date: <span className="font-semibold">{new Date(selectedDate).toLocaleDateString()}</span>
        </p>
      )}
    </div>
  );
};

export default CustomDate;
