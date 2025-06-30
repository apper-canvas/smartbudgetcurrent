import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import StatCard from '@/components/molecules/StatCard'
import QuickActionCard from '@/components/molecules/QuickActionCard'
import TransactionItem from '@/components/molecules/TransactionItem'
import TransactionForm from '@/components/organisms/TransactionForm'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'
import { transactionService } from '@/services/api/transactionService'
import { budgetService } from '@/services/api/budgetService'

const Dashboard = () => {
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [currentDate] = useState(new Date())

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError('')
    
    try {
      const [transactionsData, budgetsData] = await Promise.all([
        transactionService.getAll(),
        budgetService.getAll()
      ])
      
      setTransactions(transactionsData)
      setBudgets(budgetsData)
    } catch (err) {
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTransaction = async (id) => {
    try {
      await transactionService.delete(id)
      setTransactions(prev => prev.filter(t => t.Id !== id))
    } catch (error) {
      setError('Failed to delete transaction')
    }
  }

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction)
    setShowTransactionForm(true)
  }

  const handleFormSuccess = () => {
    setShowTransactionForm(false)
    setEditingTransaction(null)
    loadData()
  }

  const handleFormCancel = () => {
    setShowTransactionForm(false)
    setEditingTransaction(null)
  }

  // Calculate current month statistics
  const currentMonthStart = startOfMonth(currentDate)
  const currentMonthEnd = endOfMonth(currentDate)
  
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date)
    return transactionDate >= currentMonthStart && transactionDate <= currentMonthEnd
  })

  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const netIncome = totalIncome - totalExpenses
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0)

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  if (loading) return <Loading type="dashboard" />
  if (error) return <Error message={error} onRetry={loadData} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's your financial overview for {format(currentDate, 'MMMM yyyy')}
          </p>
        </div>
        
        <Button
          icon="Plus"
          onClick={() => setShowTransactionForm(true)}
          className="shadow-lg"
        >
          Add Transaction
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Income"
          value={`$${totalIncome.toFixed(2)}`}
          icon="ArrowUpRight"
          color="success"
          gradient
          trend="up"
          trendValue="12.5%"
        />
        
        <StatCard
          title="Total Expenses"
          value={`$${totalExpenses.toFixed(2)}`}
          icon="ArrowDownLeft"
          color="error"
          gradient
          trend="down"
          trendValue="8.2%"
        />
        
        <StatCard
          title="Net Income"
          value={`$${netIncome.toFixed(2)}`}
          icon="TrendingUp"
          color={netIncome >= 0 ? 'success' : 'error'}
          gradient
          trend={netIncome >= 0 ? 'up' : 'down'}
          trendValue={`${Math.abs((netIncome / totalIncome) * 100).toFixed(1)}%`}
        />
        
        <StatCard
          title="Monthly Budget"
          value={`$${totalBudget.toFixed(2)}`}
          icon="Target"
          color="primary"
          gradient
          trend="neutral"
          trendValue="Budget Set"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-semibold text-secondary mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <QuickActionCard
            title="Add Income"
            description="Record your income"
            icon="ArrowUpRight"
            color="success"
            onClick={() => setShowTransactionForm(true)}
          />
          
          <QuickActionCard
            title="Add Expense"
            description="Track your spending"
            icon="ArrowDownLeft"
            color="error"
            onClick={() => setShowTransactionForm(true)}
          />
          
          <QuickActionCard
            title="Set Budget"
            description="Plan your spending"
            icon="Target"
            color="primary"
            onClick={() => {/* Navigate to budgets */}}
          />
          
          <QuickActionCard
            title="View Reports"
            description="Analyze your data"
            icon="BarChart3"
            color="info"
            onClick={() => {/* Navigate to charts */}}
          />
        </div>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-secondary">Recent Transactions</h2>
          <Button variant="ghost" size="sm">
            View All
            <ApperIcon name="ArrowRight" size={16} className="ml-2" />
          </Button>
        </div>

        {recentTransactions.length === 0 ? (
          <Empty
            title="No transactions yet"
            description="Start by adding your first transaction to track your finances"
            actionText="Add Transaction"
            onAction={() => setShowTransactionForm(true)}
            icon="Receipt"
          />
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TransactionItem
                  transaction={transaction}
                  onEdit={handleEditTransaction}
                  onDelete={handleDeleteTransaction}
                />
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <TransactionForm
          transaction={editingTransaction}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  )
}

export default Dashboard