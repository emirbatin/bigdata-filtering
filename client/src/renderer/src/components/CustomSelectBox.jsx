import React, { useState } from 'react';

const CustomSelectBox = ({ options, className, id, name, value, onChange }) => {
  const [selectedOption, setSelectedOption] = useState(value || '');

  const handleSelectChange = (event) => {
    setSelectedOption(event.target.value);
    if (onChange) {
      onChange(event); // Call the onChange function passed as a prop
    }
  };

  return (
    <div className="flex flex-col items-start">
      <select
        id={id}
        name={name}
        value={selectedOption}
        onChange={handleSelectChange}
        className={`p-2 border border-gray-700 bg-gray-800 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-700 transition-colors duration-200 ${className}`}
      >
        <option value="" disabled>Seçiniz</option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CustomSelectBox;
