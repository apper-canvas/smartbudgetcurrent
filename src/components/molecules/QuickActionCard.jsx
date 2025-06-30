import React from 'react'
import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'
import Card from '@/components/atoms/Card'

const QuickActionCard = ({ title, description, icon, color = 'primary', onClick }) => {
  const colorClasses = {
    primary: 'text-primary bg-primary/10 hover:bg-primary/20',
    success: 'text-success bg-success/10 hover:bg-success/20',
    warning: 'text-warning bg-warning/10 hover:bg-warning/20',
    error: 'text-error bg-error/10 hover:bg-error/20',
    info: 'text-info bg-info/10 hover:bg-info/20'
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="text-center hover:shadow-premium-lg transition-all duration-300">
        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 transition-colors duration-200 ${colorClasses[color]}`}>
          <ApperIcon name={icon} size={32} />
        </div>
        
        <h3 className="font-semibold text-secondary mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </Card>
    </motion.div>
  )
}

export default QuickActionCard