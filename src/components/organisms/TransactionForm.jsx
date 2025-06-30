import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import Input from '@/components/atoms/Input'
import Select from '@/components/atoms/Select'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import ApperIcon from '@/components/ApperIcon'
import { transactionService } from '@/services/api/transactionService'
import { categoryService } from '@/services/api/categoryService'

const TransactionForm = ({ transaction, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadCategories()
    if (transaction) {
      setFormData({
        type: transaction.type,
        amount: transaction.amount.toString(),
        category: transaction.category,
        description: transaction.description,
        date: new Date(transaction.date).toISOString().split('T')[0]
      })
    }
  }, [transaction])

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll()
      setCategories(data)
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
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }
    if (!formData.category) {
      newErrors.category = 'Category is required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (!formData.date) {
      newErrors.date = 'Date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString(),
        createdAt: new Date().toISOString()
      }

      if (transaction) {
        await transactionService.update(transaction.Id, transactionData)
        toast.success('Transaction updated successfully!')
      } else {
        await transactionService.create(transactionData)
        toast.success('Transaction added successfully!')
      }

      onSuccess()
    } catch (error) {
      toast.error('Failed to save transaction')
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories
    .filter(cat => cat.type === formData.type)
    .map(cat => ({ value: cat.name, label: cat.name }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-secondary">
            {transaction ? 'Update Transaction' : 'Add Transaction'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ApperIcon name="X" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleInputChange('type', 'income')}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                formData.type === 'income'
                  ? 'border-success bg-success/10 text-success'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <ApperIcon name="ArrowUpRight" size={20} className="mx-auto mb-1" />
              <span className="text-sm font-medium">Income</span>
            </button>
            
            <button
              type="button"
              onClick={() => handleInputChange('type', 'expense')}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                formData.type === 'expense'
                  ? 'border-error bg-error/10 text-error'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <ApperIcon name="ArrowDownLeft" size={20} className="mx-auto mb-1" />
              <span className="text-sm font-medium">Expense</span>
            </button>
          </div>

          <Input
            label="Amount"
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

          <Select
            label="Category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            options={filteredCategories}
            placeholder="Select category"
            error={errors.category}
            required
          />

          <Input
            label="Description"
            placeholder="Enter description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            error={errors.description}
            required
          />

          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            error={errors.date}
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
              {transaction ? 'Update' : 'Add'} Transaction
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  )
}

export default TransactionForm