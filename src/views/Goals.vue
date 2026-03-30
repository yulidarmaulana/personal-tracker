<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useGoalStore } from '@/stores/goalStore'
import { useAuthStore } from '@/stores/authStore'
import { 
  TrophyIcon, 
  PlusIcon, 
  Trash2Icon, 
  CalendarIcon,
  TargetIcon
} from 'lucide-vue-next'
import ConfirmModal from '@/components/ConfirmModal.vue'

const goalStore = useGoalStore()
const authStore = useAuthStore()

const isAdding = ref(false)
const isDeleteModalOpen = ref(false)
const goalToDelete = ref<string | null>(null)
const newGoal = ref({
  name: '',
  target_amount: 0,
  deadline: ''
})

onMounted(() => {
  if (authStore.user) {
    goalStore.fetchGoals()
  }
})

watch(() => authStore.user, (user) => {
  if (user) goalStore.fetchGoals()
})

const handleAddGoal = async () => {
  if (!newGoal.value.name.trim() || newGoal.value.target_amount <= 0) return
  
  await goalStore.addGoal({
    name: newGoal.value.name,
    target_amount: newGoal.value.target_amount,
    current_amount: 0,
    deadline: newGoal.value.deadline || null
  })
  
  newGoal.value = { name: '', target_amount: 0, deadline: '' }
  isAdding.value = false
}

const updateProgress = async (goal: any, amount: number) => {
  const newAmount = Math.max(0, Math.min(goal.target_amount, goal.current_amount + amount))
  await goalStore.updateGoalProgress(goal.id, newAmount)
}

const getProgress = (goal: any) => {
  const progress = (goal.current_amount / goal.target_amount) * 100
  return Math.min(progress, 100)
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

const formatDate = (date: string | null) => {
  if (!date) return 'No Deadline'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const confirmDelete = async () => {
  if (goalToDelete.value) {
    await goalStore.deleteGoal(goalToDelete.value)
    cancelDelete()
  }
}

const cancelDelete = () => {
  isDeleteModalOpen.value = false
  goalToDelete.value = null
}
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto space-y-8">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Savings Goals</h1>
        <p class="text-sm text-gray-500 mt-1">Plan and track your future dreams</p>
      </div>
      <button 
        @click="isAdding = !isAdding"
        class="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
      >
        <PlusIcon :size="20" />
        <span>{{ isAdding ? 'Cancel' : 'Add New Goal' }}</span>
      </button>
    </div>

    <!-- Add Goal Form -->
    <div v-if="isAdding" class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Goal Name</label>
          <input 
            v-model="newGoal.name"
            type="text" 
            placeholder="e.g. New Laptop, Vacation"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Target Amount</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
            <input 
              v-model.number="newGoal.target_amount"
              type="number" 
              placeholder="0.00"
              class="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Deadline (Optional)</label>
          <input 
            v-model="newGoal.deadline"
            type="date" 
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
      </div>
      <div class="mt-6 flex justify-end">
        <button 
          @click="handleAddGoal"
          class="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all"
        >
          Create Goal
        </button>
      </div>
    </div>

    <!-- Goals List -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div 
        v-for="goal in goalStore.goals" 
        :key="goal.id"
        class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col space-y-6 group hover:border-indigo-200 transition-all"
      >
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-4">
            <div 
              class="p-3 rounded-xl"
              :class="getProgress(goal) === 100 ? 'bg-amber-100 text-amber-600' : 'bg-indigo-50 text-indigo-600'"
            >
              <TrophyIcon v-if="getProgress(goal) === 100" :size="24" />
              <TargetIcon v-else :size="24" />
            </div>
            <div>
              <h4 class="text-lg font-bold text-gray-800">{{ goal.name }}</h4>
              <div class="flex items-center gap-2 text-xs text-gray-400 font-medium">
                <CalendarIcon :size="12" />
                <span>{{ formatDate(goal.deadline) }}</span>
              </div>
            </div>
          </div>
          <button 
            @click="() => { goalToDelete = goal.id; isDeleteModalOpen = true }"
            class="text-gray-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2Icon :size="18" />
          </button>
        </div>

        <div class="space-y-3">
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Progress: <span class="font-bold text-gray-800">{{ formatCurrency(goal.current_amount) }}</span></span>
            <span class="font-medium text-gray-400">{{ formatCurrency(goal.target_amount) }}</span>
          </div>
          <div class="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              class="h-full bg-indigo-600 transition-all duration-700 ease-out"
              :style="{ width: getProgress(goal) + '%' }"
            ></div>
          </div>
          <p class="text-[10px] text-right font-bold text-indigo-500 uppercase tracking-widest">
            {{ getProgress(goal).toFixed(0) }}% Completed
          </p>
        </div>

        <div class="pt-4 border-t border-gray-100 flex items-center justify-between">
          <p class="text-xs text-gray-500 font-medium italic">Update your progress:</p>
          <div class="flex gap-2">
            <button 
              @click="updateProgress(goal, -50)"
              class="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200 transition-all"
            >
              -$50
            </button>
            <button 
              @click="updateProgress(goal, 50)"
              class="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-100 transition-all"
            >
              +$50
            </button>
            <button 
              @click="updateProgress(goal, 100)"
              class="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
            >
              +$100
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="goalStore.goals.length === 0" class="md:col-span-2 p-16 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <div class="flex flex-col items-center gap-4">
          <TrophyIcon :size="64" class="text-gray-200" />
          <h3 class="text-lg font-bold text-gray-400">Dream Big!</h3>
          <p class="text-gray-400 max-w-sm mx-auto">You haven't added any savings goals yet. What are you saving for? A house? A car? A new laptop?</p>
        </div>
      </div>
    </div>

    <!-- Confirm Delete Modal -->
    <ConfirmModal 
      :is-open="isDeleteModalOpen"
      title="Hapus Target Tabungan?"
      message="Apakah kamu yakin ingin menghapus target tabungan ini?"
      confirm-text="Hapus"
      cancel-text="Batal"
      type="danger"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>
