import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/api/supabase'
import type { Transaction } from '../types/transaction'
import { useNotificationStore } from './notificationStore'
import { useWalletStore } from './walletStore'

export const useTransactionStore = defineStore('transactions', () => {
  const transactions = ref<Transaction[]>([])
  const loading = ref(false)
  const notificationStore = useNotificationStore()
  const walletStore = useWalletStore()

  // Getters
  const totalIncome = computed(() =>
    transactions.value
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
  )

  const totalExpense = computed(() =>
    transactions.value
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
  )

  const balance = computed(() => totalIncome.value - totalExpense.value)

  // Actions
  async function fetchTransactions() {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error
      transactions.value = data || []
    } catch (error) {
      console.error('Error fetching transactions:', error)
      notificationStore.error('Gagal mengambil data transaksi.')
    } finally {
      loading.value = false
    }
  }

  async function addTransaction(tx: Omit<Transaction, 'id'>) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        notificationStore.warning('Kamu harus Login untuk menyimpan transaksi.')
        return
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert([{ ...tx, user_id: user.id }])
        .select()

      if (error) throw error
      if (data) {
        const newTx = data[0]
        transactions.value.unshift(newTx)
        
        // Update Wallet Balance
        if (newTx.wallet_id) {
          const delta = newTx.type === 'income' ? Number(newTx.amount) : -Number(newTx.amount)
          await walletStore.adjustBalance(newTx.wallet_id, delta)
        }
        
        notificationStore.success('Transaksi berhasil disimpan!')
      }
    } catch (error: any) {
      console.error('Error adding transaction:', error)
      notificationStore.error('Gagal menyimpan transaksi: ' + error.message)
    }
  }

  async function deleteTransaction(id: string) {
    try {
      const txToDelete = transactions.value.find(t => t.id === id)
      
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      if (txToDelete && txToDelete.wallet_id) {
        const delta = txToDelete.type === 'income' ? -Number(txToDelete.amount) : Number(txToDelete.amount)
        await walletStore.adjustBalance(txToDelete.wallet_id, delta)
      }

      transactions.value = transactions.value.filter(t => t.id !== id)
      notificationStore.success('Transaksi berhasil dihapus.')
    } catch (error: any) {
      console.error('Error deleting transaction:', error)
      notificationStore.error('Gagal menghapus transaksi: ' + error.message)
    }
  }

  async function editTransaction(id: string, updatedData: Partial<Transaction>) {
    try {
      const oldTx = transactions.value.find(t => t.id === id)
      if (!oldTx) return

      const { data, error } = await supabase
        .from('transactions')
        .update(updatedData)
        .eq('id', id)
        .select()

      if (error) throw error
      if (data) {
        const newTx = data[0]
        
        // Update Wallet Balance if amount, type, or wallet changed
        if (oldTx.wallet_id) {
          // Revert old transaction
          const revertDelta = oldTx.type === 'income' ? -Number(oldTx.amount) : Number(oldTx.amount)
          await walletStore.adjustBalance(oldTx.wallet_id, revertDelta)
        }
        
        if (newTx.wallet_id) {
          // Apply new transaction
          const applyDelta = newTx.type === 'income' ? Number(newTx.amount) : -Number(newTx.amount)
          await walletStore.adjustBalance(newTx.wallet_id, applyDelta)
        }

        const index = transactions.value.findIndex(t => t.id === id)
        if (index !== -1) {
          transactions.value[index] = newTx
          notificationStore.success('Transaksi berhasil diperbarui!')
        }
      }
    } catch (error: any) {
      console.error('Error editing transaction:', error)
      notificationStore.error('Gagal memperbarui transaksi: ' + error.message)
    }
  }

  return {
    transactions,
    loading,
    totalIncome,
    totalExpense,
    balance,
    fetchTransactions,
    addTransaction,
    deleteTransaction,
    editTransaction
  }
})
