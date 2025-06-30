import React, { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import ApperIcon from '@/components/ApperIcon'

const BudgetComparisonChart = ({ budgets, categories, transactions, startDate, endDate }) => {
  const chartData = useMemo(() => {
    if (!budgets || !categories || !transactions) return []

    // Get spending data for the date range
    const spending = {}
    
    // Initialize spending for all expense categories
    categories
      .filter(c => c.type === 'expense')
      .forEach(category => {
        spending[category.Id] = 0
      })

    // Calculate actual spending
    transactions
      .filter(t => {
        const transactionDate = new Date(t.date)
        return (
          t.type === 'expense' &&
          transactionDate >= startDate &&
          transactionDate <= endDate
        )
      })
      .forEach(transaction => {
        const category = categories.find(c => c.name === transaction.category)
        if (category) {
          spending[category.Id] = (spending[category.Id] || 0) + transaction.amount
        }
      })

    // Get budget data for the comparison period
    const monthsInRange = []
    let currentMonth = startOfMonth(startDate)
    const endMonth = startOfMonth(endDate)
    
    while (currentMonth <= endMonth) {
      monthsInRange.push(format(currentMonth, 'yyyy-MM'))
      currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    }

    // Aggregate budgets for the period
    const budgetTotals = {}
    budgets.forEach(budget => {
      if (monthsInRange.includes(budget.month)) {
        const categoryId = parseInt(budget.categoryId)
        budgetTotals[categoryId] = (budgetTotals[categoryId] || 0) + budget.amount
      }
    })

    // Create chart data
    const data = categories
      .filter(c => c.type === 'expense')
      .filter(c => budgetTotals[c.Id] > 0) // Only show categories with budgets
      .map(category => ({
        category: category.name.length > 12 ? category.name.substring(0, 12) + '...' : category.name,
        fullName: category.name,
        budgeted: budgetTotals[category.Id] || 0,
        actual: spending[category.Id] || 0,
        icon: category.icon
      }))
      .sort((a, b) => b.budgeted - a.budgeted) // Sort by budget amount descending

    return data
  }, [budgets, categories, transactions, startDate, endDate])

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const budgeted = data.budgeted
      const actual = data.actual
      const difference = budgeted - actual
      const percentageUsed = budgeted > 0 ? (actual / budgeted) * 100 : 0

      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-secondary mb-2">{data.fullName}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-primary">Budgeted:</span>
              <span className="font-medium">${budgeted.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-error">Actual:</span>
              <span className="font-medium">${actual.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t">
              <span className="text-gray-600">Difference:</span>
              <span className={`font-medium ${difference >= 0 ? 'text-success' : 'text-error'}`}>
                ${Math.abs(difference).toFixed(2)} {difference >= 0 ? 'under' : 'over'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Used:</span>
              <span className={`font-medium ${percentageUsed > 100 ? 'text-error' : percentageUsed > 80 ? 'text-warning' : 'text-success'}`}>
                {percentageUsed.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <div className="p-4 bg-gray-100 rounded-full mb-4">
          <ApperIcon name="BarChart3" size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">No Budget Data Available</h3>
        <p className="text-sm text-center max-w-md">
          No budgets found for the selected date range. Create budgets for your expense categories to see the comparison chart.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-4 text-sm text-gray-600">
        Comparing {format(startDate, 'MMM yyyy')} to {format(endDate, 'MMM yyyy')}
      </div>
      
      <div style={{ width: '100%', height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60
            }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="category" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="budgeted" 
              fill="#3B82F6" 
              name="Budgeted"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="actual" 
              fill="#EF4444" 
              name="Actual"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-primary/5 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Budgeted</p>
              <p className="text-xl font-bold text-primary">
                ${chartData.reduce((sum, item) => sum + item.budgeted, 0).toFixed(2)}
              </p>
            </div>
            <ApperIcon name="Target" size={20} className="text-primary" />
          </div>
        </div>
        
        <div className="bg-error/5 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-xl font-bold text-error">
                ${chartData.reduce((sum, item) => sum + item.actual, 0).toFixed(2)}
              </p>
            </div>
            <ApperIcon name="ShoppingCart" size={20} className="text-error" />
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-xl font-bold text-secondary">{chartData.length}</p>
            </div>
            <ApperIcon name="Folder" size={20} className="text-secondary" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default BudgetComparisonChart