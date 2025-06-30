import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns'
import BudgetCard from '@/components/molecules/BudgetCard'
import BudgetComparisonChart from '@/components/molecules/BudgetComparisonChart'
import BudgetForm from '@/components/organisms/BudgetForm'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'
import { budgetService } from '@/services/api/budgetService'
import { categoryService } from '@/services/api/categoryService'
import { transactionService } from '@/services/api/transactionService'

const Budgets = () => {
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
const [showForm, setShowForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [currentDate] = useState(new Date())
  const [comparisonStartDate, setComparisonStartDate] = useState(startOfMonth(subMonths(new Date(), 2)))
  const [comparisonEndDate, setComparisonEndDate] = useState(endOfMonth(new Date()))

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError('')
    
    try {
      const [budgetsData, categoriesData, transactionsData] = await Promise.all([
        budgetService.getAll(),
        categoryService.getAll(),
        transactionService.getAll()
      ])
      
      setBudgets(budgetsData)
      setCategories(categoriesData)
      setTransactions(transactionsData)
    } catch (err) {
      setError('Failed to load budget data')
    } finally {
      setLoading(false)
    }
  }

  const handleEditBudget = (budget) => {
    setEditingBudget(budget)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingBudget(null)
    loadData()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingBudget(null)
  }

  const getCurrentMonthSpending = (categoryId) => {
    const currentMonthStart = startOfMonth(currentDate)
    const currentMonthEnd = endOfMonth(currentDate)
    
    const category = categories.find(c => c.Id === parseInt(categoryId))
    if (!category) return 0

    return transactions
      .filter(t => {
        const transactionDate = new Date(t.date)
        return (
          t.type === 'expense' &&
          t.category === category.name &&
          transactionDate >= currentMonthStart &&
          transactionDate <= currentMonthEnd
        )
      })
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const currentMonth = format(currentDate, 'yyyy-MM')
  const currentMonthBudgets = budgets.filter(b => b.month === currentMonth)

  const totalBudget = currentMonthBudgets.reduce((sum, b) => sum + b.amount, 0)
  const totalSpent = currentMonthBudgets.reduce((sum, b) => sum + getCurrentMonthSpending(b.categoryId), 0)
  const totalRemaining = totalBudget - totalSpent

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadData} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Budgets</h1>
          <p className="text-gray-600 mt-1">
            Manage your monthly budgets for {format(currentDate, 'MMMM yyyy')}
          </p>
        </div>
        
        <Button
          icon="Plus"
          onClick={() => setShowForm(true)}
          className="shadow-lg"
        >
          Create Budget
        </Button>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card gradient>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-primary">${totalBudget.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl">
              <ApperIcon name="Target" size={24} className="text-primary" />
            </div>
          </div>
        </Card>

        <Card gradient>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-error">${totalSpent.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-error/10 rounded-xl">
              <ApperIcon name="ShoppingCart" size={24} className="text-error" />
            </div>
          </div>
        </Card>

        <Card gradient>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Remaining</p>
              <p className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-success' : 'text-error'}`}>
                ${totalRemaining.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-success/10 rounded-xl">
              <ApperIcon name="PiggyBank" size={24} className="text-success" />
            </div>
          </div>
        </Card>
</div>

      {/* Budget Comparison Chart */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-secondary">
            Budget vs Actual Spending
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-600">From:</label>
              <input
                type="month"
                value={format(comparisonStartDate, 'yyyy-MM')}
                onChange={(e) => setComparisonStartDate(startOfMonth(new Date(e.target.value)))}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-600">To:</label>
              <input
                type="month"
                value={format(comparisonEndDate, 'yyyy-MM')}
                onChange={(e) => setComparisonEndDate(endOfMonth(new Date(e.target.value)))}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>

        <BudgetComparisonChart
          budgets={budgets}
          categories={categories}
          transactions={transactions}
          startDate={comparisonStartDate}
          endDate={comparisonEndDate}
        />
      </Card>

      {/* Budget Progress */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-secondary">
            Budget Progress - {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="text-sm text-gray-500">
            {currentMonthBudgets.length} of {categories.filter(c => c.type === 'expense').length} categories budgeted
          </div>
        </div>

        {currentMonthBudgets.length === 0 ? (
          <Empty
            title="No budgets set for this month"
            description="Start by creating budgets for your expense categories to better track your spending"
            actionText="Create Budget"
            onAction={() => setShowForm(true)}
            icon="Target"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentMonthBudgets.map((budget, index) => {
              const category = categories.find(c => c.Id === parseInt(budget.categoryId))
              const spent = getCurrentMonthSpending(budget.categoryId)
              
              if (!category) return null

              return (
                <motion.div
                  key={budget.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <BudgetCard
                    budget={budget.amount}
                    spent={spent}
                    category={category}
                    onEdit={() => handleEditBudget(budget)}
                  />
                </motion.div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Unbudgeted Categories */}
      {categories.filter(c => c.type === 'expense').length > currentMonthBudgets.length && (
        <Card>
          <h2 className="text-xl font-semibold text-secondary mb-4">
            Categories Without Budgets
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories
              .filter(c => c.type === 'expense')
              .filter(c => !currentMonthBudgets.some(b => parseInt(b.categoryId) === c.Id))
              .map((category, index) => (
                <motion.div
                  key={category.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200 cursor-pointer"
                  onClick={() => setShowForm(true)}
                >
                  <div className="text-center">
                    <div className="p-3 bg-gray-100 rounded-lg inline-block mb-2">
                      <ApperIcon name={category.icon} size={20} className="text-gray-500" />
                    </div>
                    <p className="font-medium text-secondary">{category.name}</p>
                    <p className="text-sm text-gray-500">No budget set</p>
                  </div>
                </motion.div>
              ))}
          </div>
        </Card>
      )}

      {/* Budget Form Modal */}
      {showForm && (
        <BudgetForm
          budget={editingBudget}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  )
}

export default Budgets