import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/api/supabase'
import { useTransactionStore } from './transactionStore'

export interface Budget {
  id: string
  category_id: string
  amount: number
  period: string
  user_id: string
}

export const useBudgetStore = defineStore('budgets', () => {
  const budgets = ref<Budget[]>([])
  const loading = ref(false)
  const transactionStore = useTransactionStore()

  async function fetchBudgets() {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')

      if (error) throw error
      budgets.value = data || []
    } catch (error) {
      console.error('Error fetching budgets:', error)
    } finally {
      loading.value = false
    }
  }

  async function addBudget(budget: Omit<Budget, 'id' | 'user_id'>) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('budgets')
        .insert([{ ...budget, user_id: user.id }])
        .select()

      if (error) throw error
      if (data) {
        budgets.value.push(data[0])
      }
    } catch (error) {
      console.error('Error adding budget:', error)
    }
  }

  async function deleteBudget(id: string) {
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)

      if (error) throw error
      budgets.value = budgets.value.filter(b => b.id !== id)
    } catch (error) {
      console.error('Error deleting budget:', error)
    }
  }

  // Helper to get spending for a category in the current month
  function getSpendingForCategory(categoryName: string) {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    return transactionStore.transactions
      .filter(t => {
        const txDate = new Date(t.date)
        return t.category === categoryName && 
               t.type === 'expense' &&
               txDate.getMonth() === currentMonth &&
               txDate.getFullYear() === currentYear
      })
      .reduce((sum, t) => sum + t.amount, 0)
  }

  return {
    budgets,
    loading,
    fetchBudgets,
    addBudget,
    deleteBudget,
    getSpendingForCategory
  }
})
