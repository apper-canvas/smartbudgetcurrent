import React from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import ApperIcon from '@/components/ApperIcon'

const TransactionItem = ({ transaction, onEdit, onDelete }) => {
  const isIncome = transaction.type === 'income'
  const amountColor = isIncome ? 'text-success' : 'text-error'
  const amountPrefix = isIncome ? '+' : '-'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${isIncome ? 'bg-success/10' : 'bg-error/10'}`}>
            <ApperIcon 
              name={isIncome ? 'ArrowUpRight' : 'ArrowDownLeft'} 
              size={20} 
              className={isIncome ? 'text-success' : 'text-error'}
            />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-secondary">{transaction.description}</h4>
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                {transaction.category}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {format(new Date(transaction.date), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`font-bold text-lg ${amountColor}`}>
            {amountPrefix}${Math.abs(transaction.amount).toFixed(2)}
          </span>
          
          <div className="flex items-center space-x-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onEdit(transaction)}
              className="p-1.5 text-gray-400 hover:text-primary transition-colors"
            >
              <ApperIcon name="Edit2" size={16} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDelete(transaction.Id)}
              className="p-1.5 text-gray-400 hover:text-error transition-colors"
            >
              <ApperIcon name="Trash2" size={16} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default TransactionItem