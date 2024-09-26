import React from 'react'

const CustomButton = React.memo(({ label, onClick, className, icon: Icon, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      inline-flex items-center justify-center
      px-4 py-2
      text-sm font-medium
      rounded
      transition-colors duration-200
      focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50
      disabled:opacity-50 disabled:cursor-not-allowed
      ${className}
    `}
  >
    {Icon && <Icon className="mr-2 h-4 w-4" />}
    {label}
  </button>
));

export default CustomButton
