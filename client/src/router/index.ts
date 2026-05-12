import { createRouter, createWebHistory } from 'vue-router'
<<<<<<< HEAD
import LoginView from '@/views/auth/LoginView.vue'
import DashboardView from '@/views/dashboard/DashboardView.vue'
import AttendanceView from '@/views/attendance/AttendanceView.vue'
import SalaryView from '@/views/payroll/PayrollView.vue'
import ScheduleView from '@/views/schedule/ScheduleView.vue'
=======
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import AttendanceView from '@/views/AttendanceView.vue'
import SalaryView from '@/views/SalaryView.vue'
import ScheduleView from '@/views/ScheduleView.vue'
import { useAuthStore } from '@/stores/auth.store'
>>>>>>> afeaef366600e0b1c9f35e6848131a6cb1ada3ac

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
    { path: '/', name: 'dashboard', component: DashboardView, meta: { requiresAuth: true } },
    {
      path: '/attendance',
      name: 'attendance',
      component: AttendanceView,
      meta: { requiresAuth: true },
    },
    { path: '/salary', name: 'salary', component: SalaryView, meta: { requiresAuth: true } },
    { path: '/schedule', name: 'schedule', component: ScheduleView, meta: { requiresAuth: true } },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login' }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }
})

export default router
