import React from 'react'
import { motion } from 'framer-motion'

const Loading = ({ type = 'default' }) => {
  if (type === 'dashboard') {
    return (
      <div className="p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="skeleton h-8 w-48 rounded-lg"></div>
          <div className="skeleton h-10 w-32 rounded-lg"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-premium"
            >
              <div className="skeleton h-4 w-20 rounded mb-2"></div>
              <div className="skeleton h-8 w-24 rounded mb-1"></div>
              <div className="skeleton h-3 w-16 rounded"></div>
            </motion.div>
          ))}
        </div>

        {/* Chart and Recent Transactions Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-premium">
            <div className="skeleton h-6 w-32 rounded mb-4"></div>
            <div className="skeleton h-64 w-full rounded-lg"></div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-premium">
            <div className="skeleton h-6 w-40 rounded mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="skeleton h-10 w-10 rounded-full"></div>
                    <div>
                      <div className="skeleton h-4 w-24 rounded mb-1"></div>
                      <div className="skeleton h-3 w-16 rounded"></div>
                    </div>
                  </div>
                  <div className="skeleton h-4 w-16 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'transactions') {
    return (
      <div className="p-6 space-y-4">
        <div className="skeleton h-12 w-full rounded-lg"></div>
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-lg p-4 shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="skeleton h-10 w-10 rounded-full"></div>
              <div>
                <div className="skeleton h-4 w-32 rounded mb-1"></div>
                <div className="skeleton h-3 w-20 rounded"></div>
              </div>
            </div>
            <div className="skeleton h-4 w-20 rounded"></div>
          </motion.div>
        ))}
      </div>
    )
  }

  if (type === 'charts') {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-premium">
            <div className="skeleton h-6 w-40 rounded mb-4"></div>
            <div className="skeleton h-80 w-full rounded-lg"></div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-premium">
            <div className="skeleton h-6 w-36 rounded mb-4"></div>
            <div className="skeleton h-80 w-full rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full"
      />
    </div>
  )
}

export default Loading