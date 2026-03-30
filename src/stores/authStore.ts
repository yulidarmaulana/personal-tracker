import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/api/supabase'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(true)

  async function fetchUser() {
    try {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser()
      user.value = supabaseUser
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      loading.value = false
    }
  }

  // Monitor auth changes
  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user ?? null
    loading.value = false
  })

  async function signInAnonymously() {
    try {
      loading.value = true
      const { data, error } = await supabase.auth.signInAnonymously()
      if (error) throw error
      user.value = data.user
    } catch (error) {
      console.error('Anonymous sign-in failed:', error)
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    fetchUser,
    signInAnonymously
  }
})
