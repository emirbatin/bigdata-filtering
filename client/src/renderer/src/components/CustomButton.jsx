import React from 'react'

import { motion } from 'framer-motion'

const CustomButton = React.memo(({ label, onClick, className, icon: Icon, disabled }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none shadow-md ${className}`}
  >
    {Icon && <Icon className="mr-2 h-4 w-4" />}
    {label}
  </motion.button>
))

export default CustomButton
