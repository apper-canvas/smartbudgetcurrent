import React from 'react'
import ApperIcon from '@/components/ApperIcon'

const Input = ({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  error, 
  icon,
  required = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-secondary">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <ApperIcon name={icon} size={18} className="text-gray-400" />
          </div>
        )}
        
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-secondary placeholder-gray-500 shadow-sm transition-all duration-200
            focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary
            disabled:bg-gray-50 disabled:text-gray-400
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-error focus:border-error focus:ring-error' : ''}
          `}
          {...props}
        />
      </div>
      
      {error && (
        <p className="text-sm text-error flex items-center space-x-1">
          <ApperIcon name="AlertCircle" size={14} />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}

export default Input