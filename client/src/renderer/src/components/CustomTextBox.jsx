import React from 'react';

const CustomTextBox = ({ id, name, placeholder, value, onChange, className }) => {
  return (
    <input
      type="text"
      id={id}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`px-4 py-2 border border-gray-700 bg-gray-800 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-700 transition-colors duration-200 ${className}`}
    />
  );
};

export default CustomTextBox;
