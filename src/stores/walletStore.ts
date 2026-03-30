import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/api/supabase'
import { useNotificationStore } from './notificationStore'

export interface Wallet {
  id: string
  name: string
  balance: number
  icon?: string
  color?: string
}

export const useWalletStore = defineStore('wallets', () => {
  const wallets = ref<Wallet[]>([])
  const loading = ref(false)
  const notificationStore = useNotificationStore()

  const totalBalance = computed(() => 
    wallets.value.reduce((sum, w) => sum + (Number(w.balance) || 0), 0)
  )

  async function fetchWallets() {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .order('name')

      if (error) throw error
      wallets.value = data || []
    } catch (error) {
      console.error('Error fetching wallets:', error)
      notificationStore.error('Gagal mengambil data wallet.')
    } finally {
      loading.value = false
    }
  }

  async function addWallet(wallet: Omit<Wallet, 'id'>) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        notificationStore.warning('Kamu harus Login untuk menyimpan data.')
        return
      }

      const { data, error } = await supabase
        .from('wallets')
        .insert([{ ...wallet, user_id: user.id }])
        .select()

      if (error) throw error
      if (data) {
        wallets.value.push(data[0])
        notificationStore.success('Wallet berhasil dibuat!')
      }
    } catch (error: any) {
      console.error('Error adding wallet:', error)
      notificationStore.error('Gagal membuat wallet: ' + error.message)
    }
  }

  async function updateWallet(id: string, updates: Partial<Wallet>) {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) throw error
      if (data) {
        const index = wallets.value.findIndex(w => w.id === id)
        if (index !== -1) {
          wallets.value[index] = data[0]
          notificationStore.success('Wallet berhasil diperbarui!')
        }
      }
    } catch (error: any) {
      console.error('Error updating wallet:', error)
      notificationStore.error('Gagal memperbarui wallet: ' + error.message)
    }
  }

  async function deleteWallet(id: string) {
    try {
      const { error } = await supabase
        .from('wallets')
        .delete()
        .eq('id', id)

      if (error) throw error
      wallets.value = wallets.value.filter(w => w.id !== id)
      notificationStore.success('Wallet berhasil dihapus.')
    } catch (error: any) {
      console.error('Error deleting wallet:', error)
      notificationStore.error('Gagal menghapus wallet: ' + error.message)
    }
  }

  async function adjustBalance(id: string, delta: number) {
    try {
      // Find wallet locally first
      let wallet = wallets.value.find(w => w.id === id)
      let currentBalance = 0

      if (wallet) {
        currentBalance = Number(wallet.balance)
      } else {
        // If not found locally, fetch from DB
        const { data, error } = await supabase
          .from('wallets')
          .select('balance')
          .eq('id', id)
          .single()
        
        if (error) throw error
        if (data) {
          currentBalance = Number(data.balance)
        } else {
          return // Wallet not found at all
        }
      }

      const newBalance = currentBalance + delta
      
      const { data, error: updateError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('id', id)
        .select()

      if (updateError) throw updateError
      if (data) {
        const updatedWallet = data[0]
        const index = wallets.value.findIndex(w => w.id === id)
        if (index !== -1) {
          wallets.value[index] = updatedWallet
        } else {
          // If was not in local list, maybe we should push it or refresh all
          wallets.value.push(updatedWallet)
        }
      }
    } catch (error) {
      console.error('Error adjusting wallet balance:', error)
    }
  }

  return {
    wallets,
    loading,
    totalBalance,
    fetchWallets,
    addWallet,
    updateWallet,
    deleteWallet,
    adjustBalance
  }
})
