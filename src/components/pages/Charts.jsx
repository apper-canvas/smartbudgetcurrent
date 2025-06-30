import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ReactApexChart from 'react-apexcharts'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import Select from '@/components/atoms/Select'
import ApperIcon from '@/components/ApperIcon'
import { transactionService } from '@/services/api/transactionService'
import { categoryService } from '@/services/api/categoryService'

const Charts = () => {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [chartType, setChartType] = useState('category')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError('')
    
    try {
      const [transactionsData, categoriesData] = await Promise.all([
        transactionService.getAll(),
        categoryService.getAll()
      ])
      
      setTransactions(transactionsData)
      setCategories(categoriesData)
    } catch (err) {
      setError('Failed to load chart data')
    } finally {
      setLoading(false)
    }
  }

  const getMonthlyData = () => {
    const monthStart = startOfMonth(new Date(selectedMonth))
    const monthEnd = endOfMonth(new Date(selectedMonth))
    
    return transactions.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate >= monthStart && transactionDate <= monthEnd
    })
  }

  const getCategoryChartData = () => {
    const monthlyTransactions = getMonthlyData()
    const expenseTransactions = monthlyTransactions.filter(t => t.type === 'expense')
    
    if (expenseTransactions.length === 0) return null

    const categoryTotals = {}
    expenseTransactions.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount
    })

    const sortedCategories = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8) // Top 8 categories

    return {
      series: sortedCategories.map(([,amount]) => amount),
      labels: sortedCategories.map(([category]) => category),
      colors: [
        '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6',
        '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6B7280'
      ]
    }
  }

  const getTrendChartData = () => {
    const months = []
    const incomeData = []
    const expenseData = []

    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i)
      const monthStart = startOfMonth(date)
      const monthEnd = endOfMonth(date)
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date)
        return transactionDate >= monthStart && transactionDate <= monthEnd
      })

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)

      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

      months.push(format(date, 'MMM yyyy'))
      incomeData.push(income)
      expenseData.push(expenses)
    }

    return {
      series: [
        {
          name: 'Income',
          data: incomeData,
          color: '#10B981'
        },
        {
          name: 'Expenses',
          data: expenseData,
          color: '#EF4444'
        }
      ],
      categories: months
    }
  }

  const pieChartOptions = {
    chart: {
      type: 'donut',
      toolbar: { show: false }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              label: 'Total Expenses',
              fontSize: '14px',
              fontWeight: 600,
              color: '#1F2937',
              formatter: function (w) {
                return '$' + w.globals.seriesTotals.reduce((a, b) => a + b, 0).toFixed(2)
              }
            }
          }
        }
      }
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '14px',
      fontWeight: 500,
      markers: {
        width: 12,
        height: 12,
        radius: 6
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val) {
        return val.toFixed(1) + '%'
      },
      style: {
        fontSize: '12px',
        fontWeight: 'bold',
        colors: ['#fff']
      }
    },
    tooltip: {
      y: {
        formatter: function(val) {
          return '$' + val.toFixed(2)
        }
      }
    },
    responsive: [{
      breakpoint: 768,
      options: {
        chart: {
          height: 300
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  }

  const lineChartOptions = {
    chart: {
      type: 'line',
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    markers: {
      size: 6,
      hover: {
        size: 8
      }
    },
    xaxis: {
      categories: getTrendChartData().categories,
      labels: {
        style: {
          fontSize: '12px',
          fontWeight: 500,
          colors: '#6B7280'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: function(val) {
          return '$' + val.toFixed(0)
        },
        style: {
          fontSize: '12px',
          fontWeight: 500,
          colors: '#6B7280'
        }
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '14px',
      fontWeight: 500,
      markers: {
        width: 12,
        height: 12,
        radius: 6
      }
    },
    grid: {
      borderColor: '#F3F4F6',
      strokeDashArray: 4
    },
    tooltip: {
      y: {
        formatter: function(val) {
          return '$' + val.toFixed(2)
        }
      }
    }
  }

  const monthlyData = getMonthlyData()
  const totalIncome = monthlyData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = monthlyData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i)
    const value = date.toISOString().slice(0, 7)
    const label = format(date, 'MMMM yyyy')
    return { value, label }
  }).reverse()

  const chartTypeOptions = [
    { value: 'category', label: 'Expense Categories' },
    { value: 'trend', label: 'Income vs Expenses' }
  ]

  if (loading) return <Loading type="charts" />
  if (error) return <Error message={error} onRetry={loadData} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Charts & Analytics</h1>
          <p className="text-gray-600 mt-1">
            Visualize your financial data and spending patterns
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            options={chartTypeOptions}
            className="w-48"
          />
          
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            options={monthOptions}
            className="w-48"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card gradient>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Income</p>
              <p className="text-2xl font-bold text-success">${totalIncome.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-success/10 rounded-xl">
              <ApperIcon name="ArrowUpRight" size={24} className="text-success" />
            </div>
          </div>
        </Card>

        <Card gradient>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Expenses</p>
              <p className="text-2xl font-bold text-error">${totalExpenses.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-error/10 rounded-xl">
              <ApperIcon name="ArrowDownLeft" size={24} className="text-error" />
            </div>
          </div>
        </Card>

        <Card gradient>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Income</p>
              <p className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-success' : 'text-error'}`}>
                ${(totalIncome - totalExpenses).toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl">
              <ApperIcon name="TrendingUp" size={24} className="text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      {transactions.length === 0 ? (
        <Card>
          <Empty
            title="No data available"
            description="Add some transactions to see your financial charts and analytics"
            actionText="Add Transaction"
            onAction={() => {/* Navigate to transactions */}}
            icon="BarChart3"
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category/Trend Chart */}
          <Card>
            <h2 className="text-xl font-semibold text-secondary mb-6">
              {chartType === 'category' ? 'Expense Categories' : 'Income vs Expenses Trend'}
            </h2>
            
            {chartType === 'category' ? (
              getCategoryChartData() ? (
                <ReactApexChart
                  options={{
                    ...pieChartOptions,
                    labels: getCategoryChartData().labels,
                    colors: getCategoryChartData().colors
                  }}
                  series={getCategoryChartData().series}
                  type="donut"
                  height={400}
                />
              ) : (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <ApperIcon name="PieChart" size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No expense data for selected month</p>
                  </div>
                </div>
              )
            ) : (
              <ReactApexChart
                options={lineChartOptions}
                series={getTrendChartData().series}
                type="line"
                height={400}
              />
            )}
          </Card>

          {/* Additional Chart */}
          <Card>
            <h2 className="text-xl font-semibold text-secondary mb-6">
              {chartType === 'category' ? 'Monthly Trend' : 'Top Categories'}
            </h2>
            
            {chartType === 'category' ? (
              <ReactApexChart
                options={lineChartOptions}
                series={getTrendChartData().series}
                type="line"
                height={400}
              />
            ) : (
              getCategoryChartData() ? (
                <ReactApexChart
                  options={{
                    ...pieChartOptions,
                    labels: getCategoryChartData().labels,
                    colors: getCategoryChartData().colors
                  }}
                  series={getCategoryChartData().series}
                  type="donut"
                  height={400}
                />
              ) : (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <ApperIcon name="PieChart" size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No expense data available</p>
                  </div>
                </div>
              )
            )}
          </Card>
        </div>
      )}
    </div>
  )
}

export default Charts