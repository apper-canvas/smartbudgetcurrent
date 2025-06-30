import React from 'react'
import { motion } from 'framer-motion'

const Card = ({ 
  children, 
  className = '', 
  gradient = false, 
  hover = false,
  padding = 'p-6',
  ...props 
}) => {
  const baseClasses = `bg-white rounded-xl shadow-premium ${padding} ${className}`
  const gradientClasses = gradient ? 'bg-gradient-to-br from-white to-gray-50' : ''
  const hoverClasses = hover ? 'hover:shadow-premium-lg transition-all duration-300 cursor-pointer' : ''

  return (
    <motion.div
      whileHover={hover ? { y: -2 } : {}}
      className={`${baseClasses} ${gradientClasses} ${hoverClasses}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default Card