import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { format } from 'date-fns'
import { transactionService } from './transactionService'

class ExportService {
  async exportToCsv(transactions) {
    try {
      // Create CSV content
      const headers = ['Date', 'Description', 'Category', 'Type', 'Amount']
      const csvContent = [
        headers.join(','),
        ...transactions.map(transaction => [
          format(new Date(transaction.date), 'yyyy-MM-dd'),
          `"${transaction.description}"`,
          `"${transaction.category}"`,
          transaction.type,
          transaction.amount.toFixed(2)
        ].join(','))
      ].join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      return true
    } catch (error) {
      console.error('CSV export failed:', error)
      throw new Error('Failed to export CSV file')
    }
  }

  async exportToPdf(transactions) {
    try {
      const doc = new jsPDF()
      
      // Add title
      doc.setFontSize(20)
      doc.text('Transaction Report', 14, 22)
      
      // Add date range
      doc.setFontSize(12)
      doc.text(`Generated on: ${format(new Date(), 'MMMM dd, yyyy')}`, 14, 32)
      
      // Prepare table data
      const tableData = transactions.map(transaction => [
        format(new Date(transaction.date), 'MM/dd/yyyy'),
        transaction.description,
        transaction.category,
        transaction.type === 'income' ? 'Income' : 'Expense',
        `$${transaction.amount.toFixed(2)}`
      ])
      
      // Add table
      doc.autoTable({
        head: [['Date', 'Description', 'Category', 'Type', 'Amount']],
        body: tableData,
        startY: 40,
        theme: 'grid',
        headStyles: {
          fillColor: [79, 70, 229], // Primary color
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 60 },
          2: { cellWidth: 30 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25, halign: 'right' }
        }
      })
      
      // Add summary
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const finalY = doc.lastAutoTable.finalY + 10
      
      doc.setFontSize(12)
      doc.text(`Total Income: $${totalIncome.toFixed(2)}`, 14, finalY)
      doc.text(`Total Expenses: $${totalExpenses.toFixed(2)}`, 14, finalY + 8)
      doc.text(`Net Amount: $${(totalIncome - totalExpenses).toFixed(2)}`, 14, finalY + 16)
      
      // Save the PDF
      doc.save(`transactions_${format(new Date(), 'yyyy-MM-dd')}.pdf`)
      
      return true
    } catch (error) {
      console.error('PDF export failed:', error)
      throw new Error('Failed to export PDF file')
    }
  }

  async exportTransactions(format, filters = {}) {
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Get all transactions
    const transactions = await transactionService.getAll()
    
    // Apply filters if provided
    let filteredTransactions = transactions
    
    if (filters.type) {
      filteredTransactions = filteredTransactions.filter(t => t.type === filters.type)
    }
    
    if (filters.category) {
      filteredTransactions = filteredTransactions.filter(t => t.category === filters.category)
    }
    
    if (filters.startDate) {
      filteredTransactions = filteredTransactions.filter(t => 
        new Date(t.date) >= new Date(filters.startDate)
      )
    }
    
    if (filters.endDate) {
      filteredTransactions = filteredTransactions.filter(t => 
        new Date(t.date) <= new Date(filters.endDate)
      )
    }
    
    // Sort by date (newest first)
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))
    
    if (format === 'csv') {
      return this.exportToCsv(filteredTransactions)
    } else if (format === 'pdf') {
      return this.exportToPdf(filteredTransactions)
    } else {
      throw new Error('Unsupported export format')
    }
  }
}

export const exportService = new ExportService()