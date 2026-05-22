<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref()
const submitting = ref(false)

const form = reactive({
  username: '',
  businessName: '',
  password: '',
  confirmPassword: '',
  phone:'',
  email:'',
})

const validateConfirmPassword = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  businessName: [{ required: true, message: '请输入企业名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],

}

async function handleRegister() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await authStore.register({
      username: form.username,
      businessName: form.businessName,
      password: form.password,
      confirmPassword: form.confirmPassword,
      phone: form.phone,
      email: form.email,
    })
    ElMessage.success('注册成功，请登录')
    await router.push('/login')
  } catch {
    // 错误已在拦截器中处理
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="register-page">
    <!-- ===== 左侧：品牌插画面板（与登录页一致） ===== -->
    <div class="left-panel">
      <div class="left-grid" />
      <div class="left-orb left-orb--1" />
      <div class="left-orb left-orb--2" />
      <div class="left-orb left-orb--3" />

      <div class="illustration">
        <svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cardGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#fff" stop-opacity="0.18" />
              <stop offset="100%" stop-color="#fff" stop-opacity="0.04" />
            </linearGradient>
            <linearGradient id="cardGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#fff" stop-opacity="0.12" />
              <stop offset="100%" stop-color="#fff" stop-opacity="0.02" />
            </linearGradient>
            <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#a78bfa" stop-opacity="0.35" />
              <stop offset="100%" stop-color="#818cf8" stop-opacity="0.12" />
            </linearGradient>
          </defs>

          <circle cx="160" cy="150" r="90" fill="url(#cardGrad1)" class="illus-glow" />

          <rect x="70" y="85" width="105" height="75" rx="12" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" stroke-width="1" class="illus-card-1" />
          <rect x="85" y="98" width="45" height="5" rx="2.5" fill="rgba(255,255,255,0.18)" />
          <rect x="85" y="110" width="65" height="3" rx="1.5" fill="rgba(255,255,255,0.09)" />
          <rect x="85" y="118" width="50" height="3" rx="1.5" fill="rgba(255,255,255,0.06)" />

          <g class="illus-bars">
            <rect x="87" y="132" width="7" height="16" rx="3" fill="rgba(167,139,250,0.22)" />
            <rect x="98" y="137" width="7" height="11" rx="3" fill="rgba(167,139,250,0.16)" />
            <rect x="109" y="128" width="7" height="20" rx="3" fill="rgba(167,139,250,0.28)" />
            <rect x="120" y="134" width="7" height="14" rx="3" fill="rgba(167,139,250,0.18)" />
            <rect x="131" y="140" width="7" height="8" rx="3" fill="rgba(167,139,250,0.12)" />
            <rect x="142" y="136" width="7" height="12" rx="3" fill="rgba(167,139,250,0.14)" />
          </g>

          <rect x="165" y="120" width="75" height="55" rx="10" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.07)" stroke-width="1" class="illus-card-2" />
          <circle cx="188" cy="142" r="15" fill="none" stroke="rgba(167,139,250,0.18)" stroke-width="4" />
          <circle cx="188" cy="142" r="15" fill="none" stroke="rgba(129,140,248,0.22)" stroke-width="4" stroke-dasharray="40 54" stroke-linecap="round" transform="rotate(-90, 188, 142)" />
          <circle cx="188" cy="142" r="8" fill="rgba(167,139,250,0.08)" />
          <rect x="212" y="128" width="18" height="5" rx="2" fill="rgba(255,255,255,0.07)" />
          <rect x="212" y="138" width="14" height="4" rx="1.5" fill="rgba(255,255,255,0.04)" />

          <circle cx="255" cy="220" r="18" fill="rgba(167,139,250,0.06)" />
          <circle cx="255" cy="220" r="10" fill="rgba(129,140,248,0.08)" />

          <g class="illus-dots">
            <circle cx="50" cy="70" r="4" fill="rgba(255,255,255,0.08)" />
            <circle cx="275" cy="55" r="3" fill="rgba(255,255,255,0.06)" />
            <circle cx="285" cy="195" r="5" fill="rgba(255,255,255,0.05)" />
            <circle cx="35" cy="235" r="3.5" fill="rgba(255,255,255,0.06)" />
            <circle cx="270" cy="265" r="4" fill="rgba(255,255,255,0.04)" />
            <circle cx="95" cy="265" r="3" fill="rgba(255,255,255,0.05)" />
            <circle cx="45" cy="150" r="2.5" fill="rgba(255,255,255,0.04)" />
            <circle cx="290" cy="120" r="3" fill="rgba(255,255,255,0.04)" />
          </g>
        </svg>
      </div>

      <div class="left-content">
        <h1 class="brand-name">AI Token</h1>
        <p class="brand-desc">智能 Token 管理平台</p>
      </div>
    </div>

    <!-- ===== 右侧：注册表单面板 ===== -->
    <div class="right-panel">
      <div class="form-wrapper">
        <div class="form-header">
          <h2 class="form-title">创建账号</h2>
          <p class="form-subtitle">注册以开始使用 AI Token</p>
        </div>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          size="large"
          class="register-form"
          @submit.prevent="handleRegister"
        >
          <el-form-item label="用户名" prop="username" class="form-item-anim" style="--delay: 1">
            <el-input v-model="form.username" placeholder="请输入用户名" :prefix-icon="'User'" />
          </el-form-item>

          <el-form-item label="企业名称" prop="businessName" class="form-item-anim" style="--delay: 1">
            <el-input v-model="form.businessName" placeholder="请输入企业名" :prefix-icon="'OfficeBuilding'" />
          </el-form-item>

          <el-form-item label="手机号" prop="phone" class="form-item-anim" style="--delay: 2">
            <el-input v-model="form.phone" placeholder="请输入手机号" :prefix-icon="'Phone'" />
          </el-form-item>

          <el-form-item label="邮箱" prop="email" class="form-item-anim" style="--delay: 3">
            <el-input v-model="form.email" placeholder="请输入邮箱地址" :prefix-icon="'Message'" />
          </el-form-item>

          <el-form-item label="密码" prop="password" class="form-item-anim" style="--delay: 4">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              show-password
              :prefix-icon="'Lock'"
            />
          </el-form-item>

          <el-form-item label="确认密码" prop="confirmPassword" class="form-item-anim" style="--delay: 5">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              show-password
              :prefix-icon="'Lock'"
            />
          </el-form-item>

          <el-form-item class="form-item-anim" style="--delay: 6">
            <el-button
              type="primary"
              native-type="submit"
              :loading="submitting"
              class="register-btn"
            >
              <span v-if="!submitting">注 册</span>
            </el-button>
          </el-form-item>
        </el-form>

        <p class="login-link form-item-anim" style="--delay: 7">
          已有账号？<router-link to="/login">立即登录</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ==========================================
   页面整体：左右分栏
   ========================================== */
.register-page {
  display: flex;
  min-height: 100vh;
  background: #faf7f2;
  overflow: hidden;
}

/* ==========================================
   左侧面板 — 茶白暖杏渐变品牌区
   ========================================== */
.left-panel {
  position: relative;
  flex: 0 0 clamp(360px, 50vw, 52%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(160deg, #8b6914 0%, #b8860b 35%, #d4a574 100%);
  overflow: hidden;
  padding: clamp(24px, 6vw, 60px);
}

.left-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
}

.left-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
}

.left-orb--1 {
  width: 420px; height: 420px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%);
  top: -100px; left: -60px;
  animation: orb-float 18s ease-in-out infinite;
}

.left-orb--2 {
  width: 320px; height: 320px;
  background: radial-gradient(circle, rgba(167, 139, 250, 0.12) 0%, transparent 70%);
  bottom: -80px; right: -40px;
  animation: orb-float 22s ease-in-out infinite reverse;
}

.left-orb--3 {
  width: 260px; height: 260px;
  background: radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%);
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  animation: orb-pulse 10s ease-in-out infinite;
}

@keyframes orb-float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(25px, -18px) scale(1.05); }
  66% { transform: translate(-12px, 12px) scale(0.96); }
}

@keyframes orb-pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.7; }
}

/* ======= 插画 ======= */
.illustration {
  position: relative;
  width: clamp(140px, 28vw, 320px);
  height: clamp(140px, 28vw, 320px);
  z-index: 1;
  margin-bottom: clamp(20px, 4vw, 40px);
}

.illustration svg {
  width: 100%;
  height: 100%;
}

.illus-glow {
  animation: glow-pulse 4s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.06); }
}

.illus-card-1 {
  animation: card-float 6s ease-in-out infinite;
}

.illus-card-2 {
  animation: card-float 6s ease-in-out 1s infinite;
}

@keyframes card-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.illus-bars rect {
  animation: bar-breathe 3s ease-in-out infinite;
}
.illus-bars rect:nth-child(2) { animation-delay: 0.2s; }
.illus-bars rect:nth-child(3) { animation-delay: 0.4s; }
.illus-bars rect:nth-child(4) { animation-delay: 0.6s; }
.illus-bars rect:nth-child(5) { animation-delay: 0.8s; }
.illus-bars rect:nth-child(6) { animation-delay: 1.0s; }

@keyframes bar-breathe {
  0%, 100% { opacity: 0.18; }
  50% { opacity: 0.35; }
}

.illus-dots circle {
  animation: dot-float 5s ease-in-out infinite;
}
.illus-dots circle:nth-child(2) { animation-delay: 0.7s; }
.illus-dots circle:nth-child(3) { animation-delay: 1.4s; }
.illus-dots circle:nth-child(4) { animation-delay: 2.1s; }
.illus-dots circle:nth-child(5) { animation-delay: 0.3s; }
.illus-dots circle:nth-child(6) { animation-delay: 1.8s; }
.illus-dots circle:nth-child(7) { animation-delay: 2.5s; }
.illus-dots circle:nth-child(8) { animation-delay: 1.1s; }

@keyframes dot-float {
  0%, 100% { transform: translateY(0); opacity: 0.5; }
  50% { transform: translateY(-5px); opacity: 1; }
}

/* ======= 品牌文案 ======= */
.left-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 380px;
}

.brand-name {
  font-size: clamp(24px, 4.5vw, 40px);
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #fff;
  margin: 0 0 clamp(8px, 1.5vw, 16px);
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
}

.brand-desc {
  font-size: clamp(12px, 1.5vw, 14px);
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  letter-spacing: 0.02em;
}

/* ==========================================
   右侧面板 — 白色表单区
   ========================================== */
.right-panel {
  flex: 1 1 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: clamp(20px, 4vw, 40px);
  background: #fff;
}

.form-wrapper {
  width: 100%;
  max-width: clamp(340px, 40vw, 440px);
  animation: form-enter 0.7s ease-out;
}

@keyframes form-enter {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}

.form-header {
  margin-bottom: 28px;
}

.form-title {
  font-size: clamp(22px, 2.8vw, 26px);
  font-weight: 700;
  color: #3d3028;
  margin: 0 0 8px;
  letter-spacing: 0.03em;
}

.form-subtitle {
  font-size: clamp(13px, 1.4vw, 14px);
  color: #8b7a6b;
  margin: 0;
}

/* ======= 表单 ======= */
.register-form {
  --el-color-primary: #c68b5e;
  --el-color-primary-light-3: rgba(198, 139, 94, 0.4);
  --el-border-radius-base: 10px;
}

.register-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.register-form :deep(.el-form-item__label) {
  color: #4a3b34;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.02em;
  padding-bottom: 4px;
}

.register-form :deep(.el-input__wrapper) {
  background: #faf7f2;
  border: 1px solid #e0d3c0;
  border-radius: 10px;
  box-shadow: none;
  transition: all 0.25s ease;
}

.register-form :deep(.el-input__wrapper:hover) {
  border-color: #d4a574;
  background: #fff;
}

.register-form :deep(.el-input__wrapper.is-focus) {
  border-color: #c68b5e;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(198, 139, 94, 0.08);
}

.register-form :deep(.el-input__inner) {
  color: #3d3028;
  font-size: 14px;
}

.register-form :deep(.el-input__inner::placeholder) {
  color: #b8a690;
}

.register-form :deep(.el-input__prefix-inner) {
  color: #b8a690;
}

/* ======= 注册按钮 ======= */
.register-btn {
  width: 100%;
  height: 46px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.3em;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #c68b5e, #b8860b);
  color: #fff;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  margin-top: 4px;
}

.register-btn:hover {
  background: linear-gradient(135deg, #d4a574, #c9a458);
  box-shadow: 0 4px 20px rgba(198, 139, 94, 0.35), 0 0 40px rgba(198, 139, 94, 0.1);
  transform: translateY(-1px);
}

.register-btn:active {
  transform: translateY(0) scale(0.99);
}

.register-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.register-btn:hover::before {
  transform: translateX(100%);
}

.register-btn.is-loading {
  background: linear-gradient(135deg, #a0724a, #9a7a20);
}

/* ======= 登录链接 ======= */
.login-link {
  text-align: center;
  margin-top: 28px;
  font-size: 14px;
  color: #b8a690;
}

.login-link a {
  color: #c68b5e;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.login-link a:hover {
  color: #a0724a;
}

/* ======= 入场动画 ======= */
.form-item-anim {
  animation: item-up 0.5s ease-out both;
  animation-delay: calc(var(--delay) * 0.1s);
}

@keyframes item-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ==========================================
   响应式断点
   ========================================== */
@media (max-width: 1280px) {
  .left-panel { flex: 0 0 44%; }
  .left-content { max-width: 320px; }
}

@media (max-width: 1024px) {
  .left-panel { flex: 0 0 40%; }
  .left-content { max-width: 280px; }
  .brand-desc { display: none; }
}

@media (max-width: 768px) {
  .register-page { flex-direction: column; }
  .left-panel { flex: 0 0 auto; padding: 40px 24px 32px; }
  .illustration { width: 160px; height: 160px; margin-bottom: 20px; }
  .left-content { max-width: 100%; }
  .brand-desc { display: block; font-size: 13px; }
  .right-panel {
    flex: 1; padding: 24px;
    border-radius: 24px 24px 0 0; margin-top: -16px;
    position: relative; z-index: 2;
    box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.06);
  }
  .form-wrapper { max-width: 100%; }
}

@media (max-width: 480px) {
  .left-panel { padding: 32px 20px 24px; }
  .illustration { width: 120px; height: 120px; margin-bottom: 16px; }
  .right-panel { padding: 20px 16px; }
  .form-header { margin-bottom: 24px; }
  .register-btn { height: 44px; font-size: 14px; letter-spacing: 0.2em; }
}
</style>
