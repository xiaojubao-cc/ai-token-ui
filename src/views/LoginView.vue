<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { forgotPassword } from '@/api/auth'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref()
const forgotFormRef = ref()
const submitting = ref(false)
const forgotSubmitting = ref(false)
const forgotDialogVisible = ref(false)

const form = reactive({
  username: '',
  password: '',
})

const rememberMe = ref(false)

const forgotForm = reactive({
  email: '',
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const forgotRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
}

onMounted(() => {
  const saved = localStorage.getItem('remembered_username')
  if (saved) {
    form.username = saved
    rememberMe.value = true
  }
})

async function handleLogin() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const user = await authStore.login({
      username: form.username,
      password: form.password,
      rememberMe: rememberMe.value,
    })
    if (rememberMe.value) {
      localStorage.setItem('remembered_username', form.username)
    } else {
      localStorage.removeItem('remembered_username')
    }
    ElMessage.success('登录成功')
    if (user.role === 'ADMIN') {
      await router.push('/admin/dashboard')
    } else {
      await router.push('/user/dashboard')
    }
  } catch {
    // 错误已在拦截器中处理
  } finally {
    submitting.value = false
  }
}

function openForgotDialog() {
  forgotForm.email = ''
  forgotDialogVisible.value = true
}

async function handleForgotPassword() {
  const valid = await forgotFormRef.value?.validate().catch(() => false)
  if (!valid) return

  forgotSubmitting.value = true
  try {
    await forgotPassword({ email: forgotForm.email, username: form.username })
    ElMessage.success('重置密码链接已发送至您的邮箱，请查收')
    forgotDialogVisible.value = false
  } catch {
    // 错误已在拦截器中处理
  } finally {
    forgotSubmitting.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <!-- ===== 左侧：品牌插画面板 ===== -->
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

          <!-- 中央柔光 -->
          <circle cx="160" cy="150" r="90" fill="url(#cardGrad1)" class="illus-glow" />

          <!-- 大卡片 -->
          <rect x="70" y="85" width="105" height="75" rx="12" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" stroke-width="1" class="illus-card-1" />
          <rect x="85" y="98" width="45" height="5" rx="2.5" fill="rgba(255,255,255,0.18)" />
          <rect x="85" y="110" width="65" height="3" rx="1.5" fill="rgba(255,255,255,0.09)" />
          <rect x="85" y="118" width="50" height="3" rx="1.5" fill="rgba(255,255,255,0.06)" />
          <!-- 卡片内柱状图 -->
          <g class="illus-bars">
            <rect x="87" y="132" width="7" height="16" rx="3" fill="rgba(167,139,250,0.22)" />
            <rect x="98" y="137" width="7" height="11" rx="3" fill="rgba(167,139,250,0.16)" />
            <rect x="109" y="128" width="7" height="20" rx="3" fill="rgba(167,139,250,0.28)" />
            <rect x="120" y="134" width="7" height="14" rx="3" fill="rgba(167,139,250,0.18)" />
            <rect x="131" y="140" width="7" height="8" rx="3" fill="rgba(167,139,250,0.12)" />
            <rect x="142" y="136" width="7" height="12" rx="3" fill="rgba(167,139,250,0.14)" />
          </g>

          <!-- 小卡片（重叠） -->
          <rect x="165" y="120" width="75" height="55" rx="10" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.07)" stroke-width="1" class="illus-card-2" />
          <!-- 环形图 -->
          <circle cx="188" cy="142" r="15" fill="none" stroke="rgba(167,139,250,0.18)" stroke-width="4" />
          <circle cx="188" cy="142" r="15" fill="none" stroke="rgba(129,140,248,0.22)" stroke-width="4" stroke-dasharray="40 54" stroke-linecap="round" transform="rotate(-90, 188, 142)" />
          <circle cx="188" cy="142" r="8" fill="rgba(167,139,250,0.08)" />
          <rect x="212" y="128" width="18" height="5" rx="2" fill="rgba(255,255,255,0.07)" />
          <rect x="212" y="138" width="14" height="4" rx="1.5" fill="rgba(255,255,255,0.04)" />

          <!-- 右下角装饰圆 -->
          <circle cx="255" cy="220" r="18" fill="rgba(167,139,250,0.06)" />
          <circle cx="255" cy="220" r="10" fill="rgba(129,140,248,0.08)" />

          <!-- 浮动装饰点 -->
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

    <!-- ===== 右侧：登录表单面板 ===== -->
    <div class="right-panel">
      <div class="form-wrapper">
        <div class="form-header">
          <h2 class="form-title">欢迎回来</h2>
          <p class="form-subtitle">登录您的账号以继续</p>
        </div>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          size="large"
          class="login-form"
          @submit.prevent="handleLogin"
        >
          <el-form-item label="用户名" prop="username" class="form-item-anim" style="--delay: 1">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              :prefix-icon="'User'"
            />
          </el-form-item>

          <el-form-item label="密码" prop="password" class="form-item-anim" style="--delay: 2">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              show-password
              :prefix-icon="'Lock'"
            />
          </el-form-item>

          <div class="form-options form-item-anim" style="--delay: 3">
            <el-checkbox v-model="rememberMe" class="remember-checkbox">
              记住我
            </el-checkbox>
            <a class="forgot-link" @click="openForgotDialog">忘记密码？</a>
          </div>

          <el-form-item class="form-item-anim" style="--delay: 4">
            <el-button
              type="primary"
              native-type="submit"
              :loading="submitting"
              class="login-btn"
            >
              <span v-if="!submitting">登 录</span>
            </el-button>
          </el-form-item>
        </el-form>

        <p class="register-link form-item-anim" style="--delay: 5">
          还没有账号？<router-link to="/register">立即注册</router-link>
        </p>
      </div>
    </div>

    <!-- ===== 忘记密码弹窗 ===== -->
    <el-dialog
      v-model="forgotDialogVisible"
      title="找回密码"
      width="420px"
      :close-on-click-modal="false"
      class="forgot-dialog"
    >
      <el-form
        ref="forgotFormRef"
        :model="forgotForm"
        :rules="forgotRules"
        label-position="top"
        @submit.prevent="handleForgotPassword"
      >
        <el-form-item label="邮箱地址" prop="email">
          <el-input
            v-model="forgotForm.email"
            placeholder="请输入注册时使用的邮箱"
            :prefix-icon="'Message'"
          />
        </el-form-item>
        <p class="forgot-tip">输入您的注册邮箱，我们将发送重置密码到该指定邮箱</p>
      </el-form>
      <template #footer>
        <el-button @click="forgotDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="forgotSubmitting" @click="handleForgotPassword">
          发送重置邮件
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* ==========================================
   页面整体：左右分栏
   ========================================== */
.login-page {
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
  max-width: clamp(320px, 38vw, 420px);
  animation: form-enter 0.7s ease-out;
}

@keyframes form-enter {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}

.form-header {
  margin-bottom: 36px;
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
.login-form {
  --el-color-primary: #c68b5e;
  --el-color-primary-light-3: rgba(198, 139, 94, 0.4);
  --el-border-radius-base: 10px;
}

.login-form :deep(.el-form-item__label) {
  color: #4a3b34;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.02em;
  padding-bottom: 6px;
}

.login-form :deep(.el-input__wrapper) {
  background: #faf7f2;
  border: 1px solid #e0d3c0;
  border-radius: 10px;
  box-shadow: none;
  transition: all 0.25s ease;
}

.login-form :deep(.el-input__wrapper:hover) {
  border-color: #d4a574;
  background: #fff;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  border-color: #c68b5e;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(198, 139, 94, 0.08);
}

.login-form :deep(.el-input__inner) {
  color: #3d3028;
  font-size: 14px;
}

.login-form :deep(.el-input__inner::placeholder) {
  color: #b8a690;
}

.login-form :deep(.el-input__prefix-inner) {
  color: #b8a690;
}

/* ======= 登录按钮 ======= */
.login-btn {
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
}

.login-btn:hover {
  background: linear-gradient(135deg, #d4a574, #c9a458);
  box-shadow: 0 4px 20px rgba(198, 139, 94, 0.35), 0 0 40px rgba(198, 139, 94, 0.1);
  transform: translateY(-1px);
}

.login-btn:active {
  transform: translateY(0) scale(0.99);
}

.login-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.login-btn:hover::before {
  transform: translateX(100%);
}

.login-btn.is-loading {
  background: linear-gradient(135deg, #a0724a, #9a7a20);
}

/* ======= 记住我 & 忘记密码 ======= */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -4px;
  margin-bottom: 8px;
}

.remember-checkbox {
  --el-checkbox-text-color: #4a3b34;
  --el-checkbox-font-size: 13px;
  --el-checkbox-checked-text-color: #4a3b34;
}

.remember-checkbox :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #c68b5e;
  border-color: #c68b5e;
}

.remember-checkbox :deep(.el-checkbox__input.is-checked:hover .el-checkbox__inner) {
  background-color: #d4a574;
  border-color: #d4a574;
}

.remember-checkbox :deep(.el-checkbox__inner) {
  border-color: #d4c5a8;
}

.remember-checkbox :deep(.el-checkbox__inner:hover) {
  border-color: #c68b5e;
}

.forgot-link {
  font-size: 13px;
  color: #b8a690;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.forgot-link:hover {
  color: #c68b5e;
}

/* ======= 注册链接 ======= */
.register-link {
  text-align: center;
  margin-top: 28px;
  font-size: 14px;
  color: #b8a690;
}

.register-link a {
  color: #c68b5e;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.register-link a:hover {
  color: #a0724a;
}

/* ======= 忘记密码弹窗 ======= */
.forgot-tip {
  font-size: 13px;
  color: #b8a690;
  margin: -8px 0 0;
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
  .login-page { flex-direction: column; }
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
  .login-btn { height: 44px; font-size: 14px; letter-spacing: 0.2em; }
}
</style>
