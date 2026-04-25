<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTransactionStore } from '@/stores/transactionStore'
import { useAuthStore } from '@/stores/authStore'
import { BarChart3Icon } from 'lucide-vue-next'

const transactionStore = useTransactionStore()
const authStore = useAuthStore()

onMounted(() => {
  if (authStore.user) {
    transactionStore.fetchTransactions()
  }
})

// Konfigurasi Bar Chart (Pemasukan vs Pengeluaran)
const chartOptions = computed(() => ({
  chart: {
    id: 'monthly-overview',
    toolbar: { show: false },
    fontFamily: 'Google Sans Flex, sans-serif',
  },
  colors: ['#10b981', '#ef4444'], // Green for Income, Red for Expense
  plotOptions: {
    bar: {
      borderRadius: 8,
      columnWidth: '20%',
      dataLabels: { position: 'top' },
    }
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
      }).format(val)
    },
    offsetY: -20,
    style: {
      fontSize: '10px',
      colors: ['#304758']
    }
  },
  xaxis: {
    categories: ['Financial Overview'],
    position: 'bottom',
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    show: false,
  },

  tooltip: {
    y: {
      formatter: (val: number) => {
        return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          maximumFractionDigits: 0
        }).format(val)
      }
    }
  },
  title: {
    text: 'Income vs Expense',
    align: 'left',
    style: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#374151'
    }
  }
}))

const chartSeries = computed(() => [
  {
    name: 'Income',
    data: [transactionStore.totalIncome]
  },
  {
    name: 'Expense',
    data: [transactionStore.totalExpense]
  }
])
</script>

<template>
  <div class="p-6">
    <div class="mb-8">
      <h6 class="text-2xl font-bold text-gray-800 dark:text-gray-300">Financial Reports</h6>
      <p class="text-gray-500 mt-1">Visualize your money flow and spending habits</p>
    </div>

    <!-- Summary Bar Chart -->
    <div class="bg-white dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <div v-if="transactionStore.transactions.length > 0">
        <apexchart
          type="bar"
          height="350"
          :options="chartOptions"
          :series="chartSeries"
        />
      </div>
      
      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center py-20 text-gray-400">
        <BarChart3Icon :size="48" class="mb-4 opacity-20" />
        <p>No transaction data to visualize yet.</p>
      </div>
    </div>

    <!-- Quick Stats below the Chart -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div class="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
        <p class="text-xs font-bold uppercase tracking-wider mb-1">Ratio Income</p>
        <p class="text-xl font-black text-emerald-700">
          {{ ((transactionStore.totalIncome / (transactionStore.totalIncome + transactionStore.totalExpense || 1)) * 100).toFixed(1) }}%
        </p>
      </div>
      <div class="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-800/50">
        <p class="text-xs font-bold uppercase tracking-wider mb-1">Ratio Expense</p>
        <p class="text-xl font-black text-red-700">
          {{ ((transactionStore.totalExpense / (transactionStore.totalIncome + transactionStore.totalExpense || 1)) * 100).toFixed(1) }}%
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Transisi halus saat ganti data */
.apexcharts-canvas {
  transition: all 0.3s ease;
}
</style>