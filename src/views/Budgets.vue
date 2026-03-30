<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useBudgetStore } from '@/stores/budgetStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { useAuthStore } from '@/stores/authStore'
import { 
  TargetIcon, 
  Trash2Icon, 
  MinusIcon,
  AlertCircleIcon,
  CheckCircle2Icon,
  WalletIcon,
  PlusCircleIcon
} from 'lucide-vue-next'
import ConfirmModal from '@/components/ConfirmModal.vue'

const budgetStore = useBudgetStore()
const categoryStore = useCategoryStore()
const transactionStore = useTransactionStore()
const authStore = useAuthStore()

const isAdding = ref(false)
const isDeleteModalOpen = ref(false)
const budgetToDelete = ref<string | null>(null)
const newBudgetAmount = ref(0)
const newBudgetCategory = ref('')

onMounted(() => {
  if (authStore.user) {
    loadData()
  }
})

watch(() => authStore.user, (user) => {
  if (user) loadData()
})

const loadData = async () => {
  await Promise.all([
    budgetStore.fetchBudgets(),
    categoryStore.fetchCategories(),
    transactionStore.fetchTransactions()
  ])
}

const expenseCategories = computed(() => {
  return categoryStore.categories.filter(c => c.type === 'expense')
})

const handleAddBudget = async () => {
  if (!newBudgetCategory.value || newBudgetAmount.value <= 0) return
  
  await budgetStore.addBudget({
    category_id: newBudgetCategory.value,
    amount: newBudgetAmount.value,
    period: 'monthly'
  })
  
  newBudgetAmount.value = 0
  newBudgetCategory.value = ''
  isAdding.value = false
}

// Helper to get category name by ID
const getCategoryName = (id: string) => {
  return categoryStore.categories.find(c => c.id === id)?.name || 'Unknown'
}

// Helper to calculate progress percentage
const getProgress = (budget: any) => {
  const categoryName = getCategoryName(budget.category_id)
  const spent = budgetStore.getSpendingForCategory(categoryName)
  const progress = (spent / budget.amount) * 100
  return Math.min(progress, 100)
}

// Helper to check if over budget
const isOverBudget = (budget: any) => {
  const categoryName = getCategoryName(budget.category_id)
  const spent = budgetStore.getSpendingForCategory(categoryName)
  return spent > budget.amount
}

const confirmDelete = async () => {
  if (budgetToDelete.value) {
    await budgetStore.deleteBudget(budgetToDelete.value)
    cancelDelete()
  }
}

const cancelDelete = () => {
  isDeleteModalOpen.value = false
  budgetToDelete.value = null
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto space-y-8">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Budgets & Limits</h1>
        <p class="text-sm text-gray-500 mt-1">Set monthly spending targets for your categories</p>
      </div>
      <button 
        @click="isAdding = !isAdding"
        class="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
      >
        <component :is="isAdding ? MinusIcon : PlusCircleIcon" :size="20" />
        <span>{{ isAdding ? 'Cancel' : 'Set New Budget' }}</span>
      </button>
    </div>

    <!-- Add Budget Form -->
    <div v-if="isAdding" class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Select Category</label>
          <select 
            v-model="newBudgetCategory"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
          >
            <option value="" disabled>Choose a category</option>
            <option v-for="cat in expenseCategories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Monthly Limit</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
            <input 
              v-model.number="newBudgetAmount"
              type="number" 
              placeholder="0.00"
              class="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>
      <div class="mt-6 flex justify-end">
        <button 
          @click="handleAddBudget"
          class="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          Activate Budget
        </button>
      </div>
    </div>

    <!-- Budgets List -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="budget in budgetStore.budgets" 
        :key="budget.id"
        class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 group hover:border-indigo-200 transition-all"
      >
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <TargetIcon :size="20" />
            </div>
            <div>
              <h4 class="font-bold text-gray-800">{{ getCategoryName(budget.category_id) }}</h4>
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Monthly Limit</p>
            </div>
          </div>
          <button 
            @click="() => { budgetToDelete = budget.id; isDeleteModalOpen = true }"
            class="text-gray-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2Icon :size="16" />
          </button>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between text-sm mb-1">
            <span class="text-gray-500">Spent: <span class="font-bold text-gray-800">{{ formatCurrency(budgetStore.getSpendingForCategory(getCategoryName(budget.category_id))) }}</span></span>
            <span class="text-gray-400">Limit: {{ formatCurrency(budget.amount) }}</span>
          </div>
          <div class="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              class="h-full transition-all duration-500"
              :class="isOverBudget(budget) ? 'bg-red-500' : 'bg-emerald-500'"
              :style="{ width: getProgress(budget) + '%' }"
            ></div>
          </div>
        </div>

        <div class="flex items-center gap-2 text-xs font-bold pt-2">
          <template v-if="isOverBudget(budget)">
            <AlertCircleIcon :size="14" class="text-red-500" />
            <span class="text-red-500 uppercase tracking-tighter">Budget Exceeded!</span>
          </template>
          <template v-else>
            <CheckCircle2Icon :size="14" class="text-emerald-500" />
            <span class="text-emerald-500 uppercase tracking-tighter">On Track</span>
          </template>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="budgetStore.budgets.length === 0" class="md:col-span-2 lg:col-span-3 p-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <div class="flex flex-col items-center gap-3">
          <WalletIcon :size="48" class="text-gray-300" />
          <p class="text-gray-400 font-medium">No budgets set. Control your spending by setting targets above.</p>
        </div>
      </div>
    </div>

    <!-- Confirm Delete Modal -->
    <ConfirmModal 
      :is-open="isDeleteModalOpen"
      title="Hapus Budget?"
      message="Apakah kamu yakin ingin menghapus budget untuk kategori ini?"
      confirm-text="Hapus"
      cancel-text="Batal"
      type="danger"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>
