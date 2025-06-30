import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'

const Sidebar = () => {
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
    { name: 'Transactions', href: '/transactions', icon: 'Receipt' },
    { name: 'Budgets', href: '/budgets', icon: 'Target' },
    { name: 'Charts', href: '/charts', icon: 'BarChart3' },
  ]

  return (
    <div className="bg-white shadow-premium-lg h-full w-64 fixed left-0 top-0 z-30">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
            <ApperIcon name="Wallet" size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">SmartBudget</h1>
            <p className="text-xs text-gray-500">Personal Finance</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <ApperIcon 
                      name={item.icon} 
                      size={20} 
                      className={isActive ? 'text-white' : 'text-current'} 
                    />
                    <span className="font-medium">{item.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="ml-auto w-2 h-2 bg-white rounded-full"
                      />
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 text-center">
          <ApperIcon name="TrendingUp" size={32} className="text-primary mx-auto mb-2" />
          <p className="text-sm font-medium text-secondary mb-1">Track Better</p>
          <p className="text-xs text-gray-500">Monitor your financial health</p>
        </div>
      </div>
    </div>
  )
}

export default Sidebar