import React from 'react'
import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'
import Card from '@/components/atoms/Card'

const BudgetCard = ({ budget, spent, category, onEdit }) => {
  const percentage = budget > 0 ? (spent / budget) * 100 : 0
  const remaining = budget - spent
  const isOverBudget = spent > budget

  const getProgressColor = () => {
    if (percentage <= 60) return 'bg-success'
    if (percentage <= 80) return 'bg-warning'
    return 'bg-error'
  }

  const getBackgroundColor = () => {
    if (percentage <= 60) return 'bg-success/10'
    if (percentage <= 80) return 'bg-warning/10'
    return 'bg-error/10'
  }

  return (
    <Card hover className="relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getBackgroundColor()}`}>
            <ApperIcon name={category.icon} size={20} className={category.color} />
          </div>
          <div>
            <h3 className="font-semibold text-secondary">{category.name}</h3>
            <p className="text-sm text-gray-500">Monthly Budget</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onEdit(budget)}
          className="p-2 text-gray-400 hover:text-primary transition-colors"
        >
          <ApperIcon name="Edit2" size={16} />
        </motion.button>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Spent</span>
          <span className={`font-bold ${isOverBudget ? 'text-error' : 'text-secondary'}`}>
            ${spent.toFixed(2)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Budget</span>
          <span className="font-bold text-secondary">${budget.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Remaining</span>
          <span className={`font-bold ${isOverBudget ? 'text-error' : 'text-success'}`}>
            ${remaining.toFixed(2)}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Progress</span>
            <span className={`text-xs font-medium ${isOverBudget ? 'text-error' : 'text-gray-600'}`}>
              {percentage.toFixed(1)}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentage, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-2 rounded-full ${getProgressColor()}`}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}

export default BudgetCard