import React, { useState } from 'react';

const CustomSelectBox = ({ options, className, id, name, value, onChange }) => {
  const [selectedOption, setSelectedOption] = useState(value || '');

  const handleSelectChange = (event) => {
    setSelectedOption(event.target.value);
    if (onChange) {
      onChange(event);
    }
  };

  return (
    <select
      id={id}
      name={name}
      value={selectedOption}
      onChange={handleSelectChange}
      className={`
        w-full
        px-3 py-2
        bg-gray-100
        text-gray-600
        border border-gray-700
        rounded
        focus:outline-none focus:border-gray-500
        transition-colors duration-200
        appearance-none
        ${className}
      `}
    >
      <option value="" disabled>Seçiniz</option>
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

export default CustomSelectBox;
