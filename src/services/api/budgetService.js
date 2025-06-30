import mockBudgets from '@/services/mockData/budgets.json'

class BudgetService {
  constructor() {
    this.budgets = [...mockBudgets]
  }

  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 250))
    return [...this.budgets]
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    const budget = this.budgets.find(b => b.Id === parseInt(id))
    if (!budget) {
      throw new Error('Budget not found')
    }
    return { ...budget }
  }

  async create(budgetData) {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const newBudget = {
      Id: Math.max(...this.budgets.map(b => b.Id), 0) + 1,
      ...budgetData
    }
    
    this.budgets.push(newBudget)
    return { ...newBudget }
  }

  async update(id, budgetData) {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const index = this.budgets.findIndex(b => b.Id === parseInt(id))
    if (index === -1) {
      throw new Error('Budget not found')
    }
    
    this.budgets[index] = {
      ...this.budgets[index],
      ...budgetData
    }
    
    return { ...this.budgets[index] }
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const index = this.budgets.findIndex(b => b.Id === parseInt(id))
    if (index === -1) {
      throw new Error('Budget not found')
    }
    
    this.budgets.splice(index, 1)
    return true
  }
}

export const budgetService = new BudgetService()