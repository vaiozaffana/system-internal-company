<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const remember = ref(false)
const loading = ref(false)
const showPassword = ref(false)

const handleLogin = async () => {
  loading.value = true
  await new Promise(r => setTimeout(r, 800))
  loading.value = false
  router.push('/')
}
</script>

<template>
  <div class="auth-page">
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
    <div class="top-accent"></div>

    <div class="auth-container">
      <div class="auth-logo">
        <div class="logo-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="9" height="9" rx="2" fill="white" fill-opacity="0.9"/>
            <rect x="13" y="2" width="9" height="9" rx="2" fill="white" fill-opacity="0.6"/>
            <rect x="2" y="13" width="9" height="9" rx="2" fill="white" fill-opacity="0.6"/>
            <rect x="13" y="13" width="9" height="9" rx="2" fill="white" fill-opacity="0.9"/>
          </svg>
        </div>
        <div class="logo-text">System Internal</div>
        <div class="logo-sub">EMS Core Portal</div>
      </div>

      <div class="auth-card">
        <div class="field-group">
          <label class="field-label">Email Address</label>
          <div class="input-wrapper">
            <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
            <input
              v-model="email"
              type="email"
              placeholder="name@company.com"
              class="field-input"
            />
          </div>
        </div>

        <div class="field-group">
          <div class="label-row">
            <label class="field-label">Password</label>
            <a href="#" class="forgot-link">Forgot Password?</a>
          </div>
          <div class="input-wrapper">
            <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="field-input"
            />
            <button class="eye-btn" @click="showPassword = !showPassword">
              <svg v-if="!showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
        </div>

        <label class="remember-check">
          <input type="checkbox" v-model="remember" />
          <span class="check-box"></span>
          <span class="check-label">Remember this device</span>
        </label>

        <button class="login-btn" @click="handleLogin" :disabled="loading">
          <span v-if="!loading">Login</span>
          <span v-else class="btn-loading">
            <span class="spinner"></span>
            Signing in...
          </span>
          <svg v-if="!loading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
          </svg>
        </button>

        <div class="divider">
          <span>Or sign in with</span>
        </div>

        <button class="sso-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="8" height="8" rx="1.5" fill="#2563EB"/>
            <rect x="13" y="3" width="8" height="8" rx="1.5" fill="#2563EB" fill-opacity="0.5"/>
            <rect x="3" y="13" width="8" height="8" rx="1.5" fill="#2563EB" fill-opacity="0.5"/>
            <rect x="13" y="13" width="8" height="8" rx="1.5" fill="#2563EB"/>
          </svg>
          Continue with Company SSO
        </button>
      </div>

      <div class="auth-footer">
        <a href="#">Security Policy</a>
        <span class="dot">•</span>
        <a href="#">System Status</a>
        <span class="dot">•</span>
        <a href="#">Help Desk</a>
      </div>
      <div class="auth-copy">2024 EMS Core</div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: #F0F4FF;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.top-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(to right, #2563EB, #10B981);
  z-index: 10;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}
.blob-1 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%);
  top: -100px; left: -100px;
}
.blob-2 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%);
  bottom: -150px; right: -100px;
}

.auth-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  z-index: 1;
  width: 100%;
  max-width: 380px;
  padding: 24px;
}

.auth-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin-bottom: 24px;
}

.logo-icon {
  width: 52px;
  height: 52px;
  background: var(--primary);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(37,99,235,0.3);
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: var(--gray-800);
}

.logo-sub {
  font-size: 13px;
  color: var(--gray-500);
}

.auth-card {
  width: 100%;
  background: white;
  border-radius: var(--radius-xl);
  padding: 28px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);
  border: 1px solid var(--gray-200);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.field-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--gray-700);
}

.forgot-link {
  font-size: 12.5px;
  color: var(--primary);
  font-weight: 600;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: var(--gray-400);
  pointer-events: none;
}

.field-input {
  width: 100%;
  padding: 10px 12px 10px 38px;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius);
  font-size: 13.5px;
  color: var(--gray-800);
  outline: none;
  transition: border-color 0.2s;
  background: white;
}

.field-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
}

.field-input::placeholder { color: var(--gray-400); }

.eye-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: var(--gray-400);
  cursor: pointer;
  padding: 0;
  display: flex;
}

.remember-check {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.remember-check input[type="checkbox"] {
  display: none;
}

.check-box {
  width: 16px;
  height: 16px;
  border: 1.5px solid var(--gray-300);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
}

.remember-check input:checked + .check-box {
  background: var(--primary);
  border-color: var(--primary);
}

.check-label {
  font-size: 13px;
  color: var(--gray-600);
}

.login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: var(--primary);
  color: white;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  border: none;
}

.login-btn:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37,99,235,0.3);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-loading {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.divider {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--gray-400);
  font-size: 12px;
}

.divider::before, .divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--gray-200);
}

.sso-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 11px;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius);
  background: white;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--gray-700);
  transition: all 0.15s;
}

.sso-btn:hover {
  border-color: var(--gray-300);
  background: var(--gray-50);
}

.auth-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  font-size: 12px;
  color: var(--gray-400);
}

.auth-footer a {
  color: var(--gray-400);
  text-decoration: none;
}

.auth-footer a:hover { color: var(--gray-600); }

.dot { color: var(--gray-300); }

.auth-copy {
  margin-top: 6px;
  font-size: 11.5px;
  color: var(--gray-400);
}
</style>
