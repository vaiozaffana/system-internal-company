<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Mail, Lock, Eye, EyeOff, ArrowRight, LayoutGrid } from 'lucide-vue-next'

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

    <div class="auth-container">
      <div class="auth-logo">
        <div class="logo-icon">
          <LayoutGrid :size="22" color="#ffffff" :stroke-width="2" />
        </div>
        <div class="logo-text">System Internal</div>
        <div class="logo-sub">EMS Core Portal</div>
      </div>

      <div class="auth-card">
        <div class="field-group">
          <label class="field-label">Email Address</label>
          <div class="input-wrapper">
            <Mail :size="16" class="input-icon" :stroke-width="2" />
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
            <Lock :size="16" class="input-icon" :stroke-width="2" />
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="field-input"
            />
            <button class="eye-btn" @click="showPassword = !showPassword">
              <EyeOff v-if="showPassword" :size="16" :stroke-width="2" />
              <Eye v-else :size="16" :stroke-width="2" />
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
          <ArrowRight v-if="!loading" :size="16" :stroke-width="2.5" />
        </button>

        <div class="divider">
          <span>Or sign in with</span>
        </div>

        <button class="sso-btn">
          <LayoutGrid :size="18" color="#0058be" :stroke-width="2" />
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
/* Figma tokens */
.auth-page {
  --fg-primary: #0058be;
  --fg-primary-dark: #004999;
  --fg-text-strong: #191b23;
  --fg-text: #424754;
  --fg-text-muted: #727785;
  --fg-border: #c2c6d6;
  --fg-input-bg: #f9f9ff;

  min-height: 100vh;
  background: #F0F4FF;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
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
  background: radial-gradient(circle, rgba(0,88,190,0.08) 0%, transparent 70%);
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
  background: var(--fg-primary);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(0,88,190,0.3);
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: var(--fg-text-strong);
}

.logo-sub {
  font-size: 13px;
  color: var(--fg-text-muted);
}

.auth-card {
  width: 100%;
  background: white;
  border-radius: var(--radius-xl);
  padding: 28px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);
  border: 1px solid var(--fg-border);
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
  color: var(--fg-text);
}

.forgot-link {
  font-size: 12.5px;
  color: var(--fg-primary);
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
  color: var(--fg-text-muted);
  pointer-events: none;
}

.field-input {
  width: 100%;
  padding: 10px 12px 10px 38px;
  border: 1px solid var(--fg-border);
  border-radius: var(--radius);
  font-size: 13.5px;
  color: var(--fg-text-strong);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: var(--fg-input-bg);
}

.field-input:focus {
  border-color: var(--fg-primary);
  box-shadow: 0 0 0 3px rgba(0,88,190,0.12);
}

.field-input::placeholder { color: #6b7280; }

.eye-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: var(--fg-text-muted);
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
  border: 1.5px solid var(--fg-border);
  border-radius: 4px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
}

.remember-check input:checked + .check-box {
  background: var(--fg-primary);
  border-color: var(--fg-primary);
}

.remember-check input:checked + .check-box::after {
  content: '';
  width: 4px;
  height: 8px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) translateY(-1px);
}

.check-label {
  font-size: 13px;
  color: var(--fg-text);
}

.login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: var(--fg-primary);
  color: white;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  border: none;
}

.login-btn:hover:not(:disabled) {
  background: var(--fg-primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,88,190,0.3);
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
  color: var(--fg-text-muted);
  font-size: 12px;
}

.divider::before, .divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--fg-border);
}

.sso-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 11px;
  border: 1px solid var(--fg-border);
  border-radius: var(--radius);
  background: var(--fg-input-bg);
  font-size: 13.5px;
  font-weight: 500;
  color: var(--fg-text-strong);
  transition: all 0.15s;
}

.sso-btn:hover {
  border-color: #a8adbd;
  background: #f0f0ff;
}

.auth-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  font-size: 12px;
  color: var(--fg-text-muted);
}

.auth-footer a {
  color: var(--fg-text-muted);
  text-decoration: none;
}

.auth-footer a:hover { color: var(--fg-text); }

.dot { color: var(--fg-border); }

.auth-copy {
  margin-top: 6px;
  font-size: 11.5px;
  color: var(--fg-border);
}
</style>
