<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const navItems = [
  { name: 'Dashboard', path: '/', icon: 'dashboard' },
  { name: 'Attendance', path: '/attendance', icon: 'attendance' },
  { name: 'Salary', path: '/salary', icon: 'salary' },
  { name: 'Schedule', path: '/schedule', icon: 'schedule' },
]

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const pageTitle = computed(() => {
  const item = navItems.find(n => isActive(n.path))
  return item?.name ?? 'EMS Core'
})

const handleSignOut = () => {
  router.push('/login')
}
</script>

<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="8" height="8" rx="2" fill="white" fill-opacity="0.9"/>
            <rect x="13" y="3" width="8" height="8" rx="2" fill="white" fill-opacity="0.6"/>
            <rect x="3" y="13" width="8" height="8" rx="2" fill="white" fill-opacity="0.6"/>
            <rect x="13" y="13" width="8" height="8" rx="2" fill="white" fill-opacity="0.9"/>
          </svg>
        </div>
        <div class="brand-text">
          <div class="brand-name">Internal Ops</div>
          <div class="brand-sub">Employee Portal</div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
        >
          <svg v-if="item.icon === 'dashboard'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          <svg v-if="item.icon === 'attendance'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M9 16l2 2 4-4"/>
          </svg>
          <svg v-if="item.icon === 'salary'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
          </svg>
          <svg v-if="item.icon === 'schedule'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>{{ item.name }}</span>
        </router-link>
      </nav>

      <div class="sidebar-bottom">
        <button class="nav-item support-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span>Support</span>
        </button>
        <button class="nav-item signout-btn" @click="handleSignOut">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>

    <div class="main-wrapper">
      <!-- Topbar -->
      <header class="topbar">
        <div class="topbar-title">EMS Core</div>
        <div class="topbar-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Search..." />
        </div>
        <div class="topbar-actions">
          <button class="icon-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span class="notif-dot"></span>
          </button>
          <button class="icon-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </button>
          <button class="icon-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14M12 2v2M12 20v2M2 12h2M20 12h2"/>
            </svg>
          </button>
          <div class="topbar-user">
            <div class="user-info">
              <div class="user-name">Rasya Raihan</div>
              <div class="user-role">Senior Developer</div>
            </div>
            <div class="user-avatar">R</div>
          </div>
        </div>
      </header>

      <main class="page-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  background: var(--white);
  border-right: 1px solid var(--gray-200);
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 16px 16px;
  border-bottom: 1px solid var(--gray-100);
}

.brand-icon {
  width: 36px;
  height: 36px;
  background: var(--primary);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--gray-800);
  line-height: 1.2;
}

.brand-sub {
  font-size: 11px;
  color: var(--gray-400);
}

.sidebar-nav {
  flex: 1;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: var(--radius-sm);
  color: var(--gray-500);
  font-size: 13.5px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.15s;
  background: transparent;
  width: 100%;
  text-align: left;
  border: none;
  cursor: pointer;
}

.nav-item:hover {
  background: var(--gray-100);
  color: var(--gray-700);
}

.nav-item.active {
  background: var(--primary-light);
  color: var(--primary);
  font-weight: 600;
}

.sidebar-bottom {
  border-top: 1px solid var(--gray-100);
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.support-btn { color: var(--gray-500); }
.signout-btn { color: var(--gray-500); }
.signout-btn:hover { color: var(--red); background: var(--red-light); }

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.topbar {
  height: 56px;
  min-height: 56px;
  background: var(--white);
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 24px;
}

.topbar-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--gray-800);
  min-width: 100px;
}

.topbar-search {
  flex: 1;
  max-width: 340px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--gray-100);
  border-radius: var(--radius-full);
  padding: 8px 14px;
  color: var(--gray-400);
}

.topbar-search input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  color: var(--gray-700);
  width: 100%;
}

.topbar-search input::placeholder { color: var(--gray-400); }

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-500);
  background: transparent;
  border: none;
  position: relative;
  transition: all 0.15s;
}

.icon-btn:hover {
  background: var(--gray-100);
  color: var(--gray-700);
}

.notif-dot {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 7px;
  height: 7px;
  background: var(--red);
  border-radius: 50%;
  border: 1.5px solid white;
}

.topbar-user {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 8px;
  padding-left: 12px;
  border-left: 1px solid var(--gray-200);
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--gray-800);
  line-height: 1.2;
}

.user-role {
  font-size: 11px;
  color: var(--gray-400);
}

.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: var(--gray-50);
}
</style>
