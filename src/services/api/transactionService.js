import mockTransactions from '@/services/mockData/transactions.json'

class TransactionService {
  constructor() {
    this.transactions = [...mockTransactions]
  }

  async getAll() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    return [...this.transactions]
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    const transaction = this.transactions.find(t => t.Id === parseInt(id))
    if (!transaction) {
      throw new Error('Transaction not found')
    }
    return { ...transaction }
  }

  async create(transactionData) {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const newTransaction = {
      Id: Math.max(...this.transactions.map(t => t.Id), 0) + 1,
      ...transactionData,
      createdAt: new Date().toISOString()
    }
    
    this.transactions.push(newTransaction)
    return { ...newTransaction }
  }

  async update(id, transactionData) {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const index = this.transactions.findIndex(t => t.Id === parseInt(id))
    if (index === -1) {
      throw new Error('Transaction not found')
    }
    
    this.transactions[index] = {
      ...this.transactions[index],
      ...transactionData
    }
    
    return { ...this.transactions[index] }
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const index = this.transactions.findIndex(t => t.Id === parseInt(id))
    if (index === -1) {
      throw new Error('Transaction not found')
    }
    
    this.transactions.splice(index, 1)
    return true
  }
}

export const transactionService = new TransactionService()