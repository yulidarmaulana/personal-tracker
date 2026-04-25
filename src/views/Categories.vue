```vue
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useCategoryStore } from '@/stores/categoryStore'
import { useAuthStore } from '@/stores/authStore'
import { 
  TagIcon, 
  Trash2Icon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  PlusCircleIcon,
  MinusCircleIcon,
} from 'lucide-vue-next'
import ConfirmModal from '@/components/ConfirmModal.vue' // Added import

const categoryStore = useCategoryStore()
const authStore = useAuthStore()

const isAdding = ref(false)
const isDeleteModalOpen = ref(false) // Added
const categoryToDelete = ref<string | null>(null) // Added
const newCategoryName = ref('') // Renamed from newCatName
const newCatType = ref<'income' | 'expense'>('expense')

onMounted(() => {
  if (authStore.user) {
    categoryStore.fetchCategories()
  }
})

watch(() => authStore.user, (user) => {
  if (user) {
    categoryStore.fetchCategories()
  }
})

const handleAddCategory = async () => {
  if (!newCategoryName.value.trim()) return // Using newCategoryName
  
  await categoryStore.addCategory({
    name: newCategoryName.value.trim(), // Using newCategoryName
    type: newCatType.value,
  })
  
  newCategoryName.value = '' // Using newCategoryName
  isAdding.value = false
}

const confirmDelete = async () => {
  if (categoryToDelete.value) {
    await categoryStore.deleteCategory(categoryToDelete.value)
    cancelDelete()
  }
}

const cancelDelete = () => {
  isDeleteModalOpen.value = false
  categoryToDelete.value = null
}

// Note: Add delete logic to store first, then here
</script>

<template>
  <div class="p-6 mx-auto space-y-8">
    <div class="flex justify-between items-center">
      <div>
        <h6 class="text-2xl font-bold text-gray-800">Category</h6>
        <p class="text-sm text-gray-500 mt-1">Customize your income and expense categories</p>
      </div>
      <button 
        @click="isAdding = !isAdding"
        class="flex items-center gap-2 px-4 py-2 bg-emerald-400 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-100"
      >
        <component :is="isAdding ? MinusCircleIcon : PlusCircleIcon" :size="20" />
        <span class="hidden md:block">{{ isAdding ? 'Cancel' : 'New Category' }}</span>
      </button>
    </div>

    <!-- Add Category Form -->
    <div v-if="isAdding" class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Category Name</label>
          <input 
            v-model="newCategoryName"
            type="text" 
            placeholder="e.g. Groceries, Bonus"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            @keyup.enter="handleAddCategory"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Type</label>
          <div class="flex p-1 bg-gray-100 rounded-lg h-[50px]">
            <button 
              @click="newCatType = 'expense'"
              class="flex-1 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2"
              :class="newCatType === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'"
            >
              <ChevronDownIcon :size="16" />
              Expense
            </button>
            <button 
              @click="newCatType = 'income'"
              class="flex-1 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2"
              :class="newCatType === 'income' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'"
            >
              <ChevronUpIcon :size="16" />
              Income
            </button>
          </div>
        </div>
      </div>
      <div class="mt-4 flex justify-end">
        <button 
          @click="handleAddCategory"
          class="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all"
        >
          Add Category
        </button>
      </div>
    </div>

    <!-- Categories List -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div 
        v-for="cat in categoryStore.categories" 
        :key="cat.id"
        class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all"
      >
        <div class="flex items-center gap-4">
          <div 
            class="p-3 rounded-xl"
            :class="cat.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'"
          >
            <TagIcon :size="20" />
          </div>
          <div>
            <h4 class="font-bold text-gray-800">{{ cat.name }}</h4>
            <p class="text-[10px] font-bold uppercase tracking-widest" :class="cat.type === 'income' ? 'text-green-500' : 'text-red-500'">
              {{ cat.type }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button 
            @click="() => { categoryToDelete = cat.id; isDeleteModalOpen = true }"
            class="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            title="Delete Category"
          >
            <Trash2Icon :size="18" />
          </button>
        </div>
      </div>

      <div v-if="categoryStore.categories.length === 0" class="md:col-span-2 p-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <p class="text-gray-400 font-medium">No categories found. Add your first one above!</p>
      </div>
    </div>

    <!-- Confirm Delete Modal -->
    <ConfirmModal 
      :is-open="isDeleteModalOpen"
      title="Hapus Kategori?"
      message="Apakah kamu yakin ingin menghapus kategori ini? Kategori yang dihapus tidak bisa dikembalikan."
      confirm-text="Hapus"
      cancel-text="Batal"
      type="danger"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>
