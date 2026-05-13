import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import AttendanceView from '@/views/AttendanceView.vue'
import SalaryView from '@/views/SalaryView.vue'
import ScheduleView from '@/views/ScheduleView.vue'
import SupportView from '@/views/SupportView.vue'
import ProfileView from '@/views/ProfileView.vue'
import LeaveView from '@/views/LeaveView.vue'
import AdminDashboardView from '@/views/admin/AdminDashboardView.vue'
import AdminSettingsView from '@/views/admin/AdminSettingsView.vue'
import AdminUsersView from '@/views/admin/AdminUsersView.vue'
import AdminAttendanceView from '@/views/admin/AdminAttendanceView.vue'
import AdminLeaveView from '@/views/admin/AdminLeaveView.vue'
import AdminReportView from '@/views/admin/AdminReportView.vue'
import AdminAuditView from '@/views/admin/AdminAuditView.vue'
import AdminPayrollView from '@/views/admin/AdminPayrollView.vue'
import { useAuthStore } from '@/stores/auth.store'

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
    { path: '/support', name: 'support', component: SupportView, meta: { requiresAuth: true } },
    { path: '/profile', name: 'profile', component: ProfileView, meta: { requiresAuth: true } },
    { path: '/leave', name: 'leave', component: LeaveView, meta: { requiresAuth: true } },
    {
      path: '/admin',
      name: 'admin-dashboard',
      component: AdminDashboardView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/settings',
      name: 'admin-settings',
      component: AdminSettingsView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: AdminUsersView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/attendance',
      name: 'admin-attendance',
      component: AdminAttendanceView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/leave',
      name: 'admin-leave',
      component: AdminLeaveView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/report',
      name: 'admin-report',
      component: AdminReportView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/audit',
      name: 'admin-audit',
      component: AdminAuditView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/payroll',
      name: 'admin-payroll',
      component: AdminPayrollView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (auth.isAuthenticated && !auth.user) {
    await auth.fetchCurrentUser()
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login' }
  }

  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'dashboard' }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return auth.isAdmin ? { name: 'admin-dashboard' } : { name: 'dashboard' }
  }
})

export default router
