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
      className={`
        w-full
        px-3 py-2
        bg-gray-100
        text-gray-600
        border border-gray-700
        rounded
        focus:outline-none focus:border-gray-500
        transition-colors duration-200
        placeholder-gray-500
        ${className}
      `}
    />
  );
};

export default CustomTextBox;
