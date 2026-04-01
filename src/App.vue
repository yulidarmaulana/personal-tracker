<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
  import { 
    LayoutGridIcon, 
    WalletIcon, 
    ChartLineIcon, 
    PlusIcon, 
    ChevronLeftIcon, 
    ChevronRightIcon,
    ListIcon,
    LogOutIcon,
    TagIcon,
    TargetIcon,
    TrophyIcon
  } from 'lucide-vue-next'
  import TransactionModal from '@/components/TransactionModal.vue'
  import NotificationToast from '@/components/NotificationToast.vue'
  import { supabase } from '@/api/supabase'
  import { useRouter, useRoute } from 'vue-router'
  import { useAuthStore } from '@/stores/authStore'
  import { useWalletStore } from '@/stores/walletStore'

  const isModalOpen = ref(false)
  const isCollapsed = ref(false)
  const router = useRouter()
  const route = useRoute()
  const authStore = useAuthStore()
  const walletStore = useWalletStore()

  const showNavigation = computed(() => !route.meta.public)

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutGridIcon },
    { to: '/wallet', label: 'Wallet', icon: WalletIcon },
    { to: '/transactions', label: 'Transactions', icon: ListIcon },
    { to: '/categories', label: 'Categories', icon: TagIcon },
    { to: '/budgets', label: 'Budgets', icon: TargetIcon },
    { to: '/goals', label: 'Goals', icon: TrophyIcon },
    { to: '/report', label: 'Report', icon: ChartLineIcon },
  ]

  onMounted(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      await authStore.signInAnonymously()
    }
    // Fetch wallets for global availability
    walletStore.fetchWallets()
  })

  const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }
</script>

<template>
  <div class="flex flex-col md:flex-row h-screen bg-gray-100 overflow-hidden">
    <!-- Sidebar for Desktop -->
    <aside 
      v-if="showNavigation"
      :class="[
        'bg-white border-r border-gray-200 flex-col transition-all duration-300 ease-in-out relative hidden md:flex',
        isCollapsed ? 'w-20' : 'w-64'
      ]"
    >
      <!-- Collapse Toggle Button -->
      <button 
        @click="toggleSidebar"
        class="absolute -right-3 top-8 bg-white border border-gray-200 rounded-full p-1 text-gray-400 hover:text-indigo-600 shadow-sm z-10"
      >
        <ChevronLeftIcon v-if="!isCollapsed" :size="14" />
        <ChevronRightIcon v-else :size="14" />
      </button>

      <!-- Sidebar Header / Logo -->
      <div class="p-6">
        <div :class="['flex items-center gap-3', isCollapsed ? 'justify-center' : '']">
          <div class="p-2 bg-emerald-500 rounded-lg text-white">
            <WalletIcon :size="20" />
          </div>
          <h5 v-if="!isCollapsed" class="text-xl font-bold text-gray-800">Finc</h5>
        </div>
      </div>

      
      <!-- Navigation Menu -->
      <nav class="flex-1 px-4 space-y-2 mt-4">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :title="item.label"
          active-class="bg-indigo-50 text-indigo-700 font-bold"
          :class="[
            'flex items-center text-sm rounded-xl transition-all duration-200 text-gray-500 hover:bg-indigo-100 hover:text-indigo-700',
            isCollapsed ? 'justify-center p-3' : 'px-4 py-3'
          ]"
        >
          <component
            :is="item.icon"
            :size="20"
            :class="!isCollapsed ? 'mr-3' : ''"
            class="text-slate-900"
          />
          <span v-if="!isCollapsed" class="text-slate-900 font-semibold">{{ item.label }}</span>
        </router-link>
      </nav>
     

      <!-- Sidebar Footer (Add Button & Profile) -->
      <div class="p-4 border-t border-gray-100">
        <button 
          @click="isModalOpen = true"
          :class="[
            'w-full flex items-center justify-center bg-emerald-400 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all shadow-lg shadow-indigo-100 mb-6',
            isCollapsed ? 'p-3' : 'py-3 gap-2'
          ]"
          title="Add Transaction"
        >
          <PlusIcon :size="20" />
          <span v-if="!isCollapsed" class="text-sm">Add</span>
        </button>

        <div :class="['flex items-center p-2', isCollapsed ? 'justify-center flex-col gap-4' : 'justify-between']">
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
              Y
            </div>
            <div v-if="!isCollapsed" class="ml-3 text-sm">
              <p class="font-bold text-gray-700 truncate w-24">{{ authStore.user?.email }}</p>
              <p class="text-[10px] text-gray-400 font-medium uppercase font-bold tracking-tighter">Budget Pro</p>
            </div>
          </div>
          <button 
            @click="handleLogout"
            class="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <LogOutIcon :size="18" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto pb-20 md:pb-0 relative">
      <div v-if="authStore.loading" class="absolute inset-0 flex items-center justify-center bg-gray-50/50 backdrop-blur-sm z-50">
        <div class="flex flex-col items-center gap-4">
          <div class="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p class="text-sm font-bold text-gray-500 animate-pulse uppercase tracking-widest">Initialing Session...</p>
        </div>
      </div>
      <router-view v-else></router-view>
    </main>

    <!-- Bottom Navigation for Mobile -->
    <div v-if="showNavigation" class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 flex items-center justify-between z-40">
      <router-link to="/" active-class="text-indigo-600" class="flex flex-col items-center gap-1 text-gray-400">
        <HomeIcon :size="24" />
        <span class="text-[10px] font-medium">Home</span>
      </router-link>
      <router-link to="/wallet" active-class="text-indigo-600" class="flex flex-col items-center gap-1 text-gray-400">
        <WalletIcon :size="24" />
        <span class="text-[10px] font-medium">Wallet</span>
      </router-link>

      <!-- Floating Action Button -->
      <button 
        @click="isModalOpen = true"
        class="bg-emerald-400 text-white p-4 rounded-full shadow-lg shadow-emerald-200 -mt-10 border-4 border-gray-100 active:scale-95 transition-transform"
      >
        <PlusIcon :size="24" />
      </button>

      <router-link to="/transactions" active-class="text-indigo-600" class="flex flex-col items-center gap-1 text-gray-400">
        <ListIcon :size="24" />
        <span class="text-[10px] font-medium">History</span>
      </router-link>
      <router-link to="/categories" active-class="text-indigo-600" class="flex flex-col items-center gap-1 text-gray-400">
        <TagIcon :size="24" />
        <span class="text-[10px] font-medium">Tags</span>
      </router-link>
      <router-link to="/budgets" active-class="text-indigo-600" class="flex flex-col items-center gap-1 text-gray-400">
        <TargetIcon :size="24" />
        <span class="text-[10px] font-medium">Budgets</span>
      </router-link>
      <router-link to="/goals" active-class="text-indigo-600" class="flex flex-col items-center gap-1 text-gray-400">
        <TrophyIcon :size="24" />
        <span class="text-[10px] font-medium">Goals</span>
      </router-link>
      <router-link to="/report" active-class="text-indigo-600" class="flex flex-col items-center gap-1 text-gray-400">
        <ChartLineIcon :size="24" />
        <span class="text-[10px] font-medium">Report</span>
      </router-link>
    </div>

    <!-- Modal -->
    <TransactionModal :is-open="isModalOpen" @close="isModalOpen = false" />
    
    <!-- Notifications -->
    <NotificationToast />
  </div>
</template>
