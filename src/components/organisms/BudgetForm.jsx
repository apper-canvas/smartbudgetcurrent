import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import Input from '@/components/atoms/Input'
import Select from '@/components/atoms/Select'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import ApperIcon from '@/components/ApperIcon'
import { budgetService } from '@/services/api/budgetService'
import { categoryService } from '@/services/api/categoryService'

const BudgetForm = ({ budget, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    month: new Date().toISOString().slice(0, 7), // YYYY-MM format
    year: new Date().getFullYear()
  })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadCategories()
    if (budget) {
      setFormData({
        categoryId: budget.categoryId,
        amount: budget.amount.toString(),
        month: budget.month,
        year: budget.year
      })
    }
  }, [budget])

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll()
      const expenseCategories = data.filter(cat => cat.type === 'expense')
      setCategories(expenseCategories)
    } catch (error) {
      toast.error('Failed to load categories')
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required'
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }
    if (!formData.month) {
      newErrors.month = 'Month is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const budgetData = {
        ...formData,
        amount: parseFloat(formData.amount),
        year: parseInt(formData.month.split('-')[0])
      }

      if (budget) {
        await budgetService.update(budget.Id, budgetData)
        toast.success('Budget updated successfully!')
      } else {
        await budgetService.create(budgetData)
        toast.success('Budget created successfully!')
      }

      onSuccess()
    } catch (error) {
      toast.error('Failed to save budget')
    } finally {
      setLoading(false)
    }
  }

  const categoryOptions = categories.map(cat => ({
    value: cat.Id.toString(),
    label: cat.name
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-secondary">
            {budget ? 'Update Budget' : 'Create Budget'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ApperIcon name="X" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Category"
            value={formData.categoryId}
            onChange={(e) => handleInputChange('categoryId', e.target.value)}
            options={categoryOptions}
            placeholder="Select category"
            error={errors.categoryId}
            required
          />

          <Input
            label="Budget Amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            error={errors.amount}
            icon="DollarSign"
            required
          />

          <Input
            label="Month"
            type="month"
            value={formData.month}
            onChange={(e) => handleInputChange('month', e.target.value)}
            error={errors.month}
            required
          />

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="flex-1"
            >
              {budget ? 'Update' : 'Create'} Budget
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  )
}

export default BudgetForm