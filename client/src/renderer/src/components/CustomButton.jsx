import React from 'react';

const CustomButton = ({ label, onClick, className }) => {
  return (
    <button
      className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition ${className}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default CustomButton;
