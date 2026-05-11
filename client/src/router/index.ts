import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import AttendanceView from '@/views/AttendanceView.vue'
import SalaryView from '@/views/SalaryView.vue'
import ScheduleView from '@/views/ScheduleView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: LoginView },
    { path: '/', name: 'dashboard', component: DashboardView },
    { path: '/attendance', name: 'attendance', component: AttendanceView },
    { path: '/salary', name: 'salary', component: SalaryView },
    { path: '/schedule', name: 'schedule', component: ScheduleView },
  ],
})

export default router
