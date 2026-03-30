import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/api/supabase'
import type { Category } from '@/types/transaction'
import { useNotificationStore } from './notificationStore'

export const useCategoryStore = defineStore('categories', () => {
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const notificationStore = useNotificationStore()

  async function fetchCategories() {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      categories.value = data || []
    } catch (error) {
      console.error('Error fetching categories:', error)
      notificationStore.error('Gagal mengambil daftar kategori.')
    } finally {
      loading.value = false
    }
  }

  async function addCategory(category: Omit<Category, 'id' | 'user_id'>) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        notificationStore.warning('Kamu harus login untuk menambah kategori.')
        return
      }

      const { data, error } = await supabase
        .from('categories')
        .insert([{ ...category, user_id: user.id }])
        .select()

      if (error) throw error
      if (data) {
        categories.value.push(data[0])
        notificationStore.success('Kategori berhasil ditambahkan!')
      }
    } catch (error: any) {
      console.error('Error adding category:', error)
      notificationStore.error('Gagal menambah kategori: ' + error.message)
    }
  }

  async function deleteCategory(id: string) {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error
      categories.value = categories.value.filter(c => c.id !== id)
      notificationStore.success('Kategori berhasil dihapus.')
    } catch (error: any) {
      console.error('Error deleting category:', error)
      notificationStore.error('Gagal menghapus kategori. Pastikan tidak ada transaksi yang menggunakan kategori ini.')
    }
  }

  return {
    categories,
    loading,
    fetchCategories,
    addCategory,
    deleteCategory
  }
})
