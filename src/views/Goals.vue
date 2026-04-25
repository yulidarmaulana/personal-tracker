<script setup lang="ts">
import { ref, onMounted, watch, reactive } from 'vue'
import { useGoalStore } from '@/stores/goalStore'
import { useAuthStore } from '@/stores/authStore'
import { 
  TrophyIcon, 
  Trash2Icon, 
  PencilIcon,
  CalendarIcon,
  TargetIcon,
  PlusCircleIcon,
  MinusCircleIcon
} from 'lucide-vue-next'
import ConfirmModal from '@/components/ConfirmModal.vue'
import { formatCurrency } from '@/utils/format'
import type { Goal } from '@/types/goal'

const goalStore = useGoalStore()
const authStore = useAuthStore()

const isAdding = ref(false)
const editingId = ref<string | null>(null)
const isDeleteModalOpen = ref(false)
const goalToDelete = ref<string | null>(null)
const newGoal = reactive({
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

const handleSubmit = async () => {
  if (!newGoal.name.trim() || newGoal.target_amount <= 0) return
  
  if (editingId.value) {
    // Update Mode
    await goalStore.updateGoal(editingId.value, {
      name: newGoal.name,
      target_amount: newGoal.target_amount,
      deadline: newGoal.deadline || null
    })
  } else {
    // Create Mode
    await goalStore.addGoal({
      name: newGoal.name,
      target_amount: newGoal.target_amount,
      current_amount: 0,
      deadline: newGoal.deadline || null
    })
  }
  
  resetForm()
}

const startEdit = (goal: Goal) => {
  editingId.value = goal.id
  newGoal.name = goal.name
  newGoal.target_amount = goal.target_amount
  newGoal.deadline = goal.deadline || ''
  isAdding.value = true
  
  // Quick scroll to form
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const resetForm = () => {
  newGoal.name = ''
  newGoal.target_amount = 0
  newGoal.deadline = ''
  editingId.value = null
  isAdding.value = false
}

const updateProgress = async (goal: Goal, amount: number) => {
  const newAmount = Math.max(0, Math.min(goal.target_amount, goal.current_amount + amount))
  await goalStore.updateGoalProgress(goal.id, newAmount)
}

const getProgress = (goal: Goal) => {
  const progress = (goal.current_amount / goal.target_amount) * 100
  return Math.min(progress, 100)
}

const formatDate = (date: string | null) => {
  if (!date) return 'No Deadline'
  return new Date(date).toLocaleDateString('id-ID', {
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
  <div class="p-6 mx-auto space-y-8">
    <div class="flex justify-between items-center">
      <div>
        <h6 class="text-2xl font-bold text-gray-800 dark:text-gray-300">Goals</h6>
        <p class="text-sm text-gray-500 mt-1">Plan and track your future dreams</p>
      </div>
      <button 
        @click="isAdding ? resetForm() : (isAdding = true)"
        class="flex items-center gap-2 px-4 py-2 bg-emerald-400 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-100 dark:shadow-emerald-900/20"
      >
        <component :is="isAdding ? MinusCircleIcon : PlusCircleIcon" :size="20" />
        <span>{{ isAdding ? 'Cancel' : 'Add New Goal' }}</span>
      </button>
    </div>

    <!-- Edit/Add Goal Form -->
    <div v-if="isAdding" class="bg-white dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm animate-in fade-in slide-in-from-top-4">
      <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200 mb-6">
        {{ editingId ? 'Edit Savings Goal' : 'New Savings Goal' }}
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Goal Name</label>
          <input 
            v-model="newGoal.name"
            type="text" 
            placeholder="e.g. New Laptop, Vacation"
            class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-gray-200"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Target Amount</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">Rp</span>
            <input 
              v-model.number="newGoal.target_amount"
              type="number" 
              placeholder="0.00"
              class="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-gray-200"
            />
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Deadline (Optional)</label>
          <input 
            v-model="newGoal.deadline"
            type="date" 
            class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer dark:text-gray-200"
            onclick="this.showPicker()"
          />
        </div>
      </div>
      <div class="mt-6 flex justify-end gap-3">
        <button 
          v-if="editingId"
          @click="resetForm"
          class="px-6 py-3 text-gray-500 font-medium hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button 
          @click="handleSubmit"
          class="px-8 py-3 bg-emerald-400 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-100 dark:shadow-emerald-900/20"
        >
          {{ editingId ? 'Update Goal' : 'Create Goal' }}
        </button>
      </div>
    </div>

    <!-- Goals List -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div 
        v-for="goal in goalStore.goals" 
        :key="goal.id"
        class="bg-white dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col space-y-6 group hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all"
      >
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-4">
            <div 
              class="p-3 rounded-xl"
              :class="getProgress(goal) === 100 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'"
            >
              <TrophyIcon v-if="getProgress(goal) === 100" :size="24" />
              <TargetIcon v-else :size="24" />
            </div>
            <div>
              <h4 class="text-lg font-bold text-gray-800 dark:text-gray-100">{{ goal.name }}</h4>
              <div class="flex items-center gap-2 text-xs text-gray-400 font-medium">
                <CalendarIcon :size="12" />
                <span>{{ formatDate(goal.deadline) }}</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button 
              @click="startEdit(goal)"
              class="p-2 text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              title="Edit Goal"
            >
              <PencilIcon :size="18" />
            </button>
            <button 
              @click="() => { goalToDelete = goal.id; isDeleteModalOpen = true }"
              class="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              title="Delete Goal"
            >
              <Trash2Icon :size="18" />
            </button>
          </div>
        </div>

        <div class="space-y-3">
          <div class="flex justify-between text-sm">
            <span class="text-gray-500 dark:text-gray-400">Progress: <span class="font-bold text-gray-800 dark:text-gray-200">{{ formatCurrency(goal.current_amount) }}</span></span>
            <span class="font-medium text-gray-400 dark:text-gray-500">{{ formatCurrency(goal.target_amount) }}</span>
          </div>
          <div class="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              class="h-full bg-emerald-400 transition-all duration-700 ease-out"
              :style="{ width: getProgress(goal) + '%' }"
            ></div>
          </div>
          <p class="text-[10px] text-right font-bold text-emerald-500 uppercase tracking-widest">
            {{ getProgress(goal).toFixed(0) }}% Completed
          </p>
        </div>

        <div class="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <p class="text-xs text-gray-500 dark:text-gray-400 font-medium italic">Update your progress:</p>
          <div class="flex gap-2">
            <button 
              @click="updateProgress(goal, -50000)"
              class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              -50rb
            </button>
            <button 
              @click="updateProgress(goal, 50000)"
              class="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all"
            >
              +50rb
            </button>
            <button 
              @click="updateProgress(goal, 100000)"
              class="px-3 py-1 bg-emerald-400 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-500 transition-all shadow-md shadow-emerald-100 dark:shadow-emerald-900/20"
            >
              +100rb
            </button>
            <button 
              @click="updateProgress(goal, 500000)"
              class="px-3 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-lg hover:bg-amber-600 transition-all shadow-md shadow-amber-100 dark:shadow-amber-900/20"
            >
              +500rb
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="goalStore.goals.length === 0" class="md:col-span-2 p-16 text-center bg-gray-50 dark:bg-gray-800/20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
        <div class="flex flex-col items-center gap-4">
          <TrophyIcon :size="64" class="text-gray-200 dark:text-gray-700" />
          <h3 class="text-lg font-bold text-gray-400 dark:text-gray-500">Dream Big!</h3>
          <p class="text-gray-400 dark:text-gray-500 max-w-sm mx-auto">You haven't added any savings goals yet. What are you saving for? A house? A car? A new laptop?</p>
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
