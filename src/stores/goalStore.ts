import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/api/supabase'

export interface Goal {
  id: string
  name: string
  target_amount: number
  current_amount: number
  deadline: string | null
  user_id: string
}

export const useGoalStore = defineStore('goals', () => {
  const goals = ref<Goal[]>([])
  const loading = ref(false)

  async function fetchGoals() {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      goals.value = data || []
    } catch (error) {
      console.error('Error fetching goals:', error)
    } finally {
      loading.value = false
    }
  }

  async function addGoal(goal: Omit<Goal, 'id' | 'user_id'>) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('goals')
        .insert([{ ...goal, user_id: user.id }])
        .select()

      if (error) throw error
      if (data) {
        goals.value.push(data[0])
      }
    } catch (error) {
      console.error('Error adding goal:', error)
    }
  }

  async function updateGoalProgress(id: string, current_amount: number) {
    try {
      const { data, error } = await supabase
        .from('goals')
        .update({ current_amount })
        .eq('id', id)
        .select()

      if (error) throw error
      if (data) {
        const index = goals.value.findIndex(g => g.id === id)
        if (index !== -1) {
          goals.value[index] = data[0]
        }
      }
    } catch (error) {
      console.error('Error updating goal:', error)
    }
  }

  async function updateGoal(id: string, updates: Partial<Goal>) {
    try {
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) throw error
      if (data) {
        const index = goals.value.findIndex(g => g.id === id)
        if (index !== -1) {
          goals.value[index] = data[0]
        }
      }
    } catch (error) {
      console.error('Error updating goal:', error)
    }
  }

  async function deleteGoal(id: string) {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)

      if (error) throw error
      goals.value = goals.value.filter(g => g.id !== id)
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
  }

  return {
    goals,
    loading,
    fetchGoals,
    addGoal,
    updateGoalProgress,
    updateGoal,
    deleteGoal
  }
})
