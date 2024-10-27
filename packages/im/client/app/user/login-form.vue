<template>
  <k-layout main="darker flex flex-col items-center justify-center">
    <div class="card w-80">
      <template v-if="showLogin">
        <div class="p-2 px-6">
          <span class="font-bold">登录</span>
        </div>
        <im-divider spacing="0"></im-divider>
        <div class="p-4">
          <el-form ref="loginFormRef" :model="login" :rules="loginRules">
            <el-form-item prop="name">
              <el-input v-model="login.name" placeholder="输入用户名..."></el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                type="password"
                show-password
                v-model="login.password"
                placeholder="输入密码..."
              ></el-input>
            </el-form-item>
          </el-form>

          <div class="error h-4 py-2 text-center">{{ err }}</div>
          <div class="flex flex-col items-center">
            <k-button class="w-40" @click="handleLogin">登录</k-button>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="p-2 px-6">
          <span class="font-bold">新用户注册</span>
        </div>
        <im-divider spacing="0"></im-divider>
        <div class="p-4">
          <el-form ref="regFormRef" :model="reg" :rules="regRules">
            <el-form-item label="账户名" prop="name">
              <el-input v-model="reg.name" placeholder="输入用户名..."></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input
                type="password"
                show-password
                v-model="reg.password"
                placeholder="输入密码..."
              ></el-input>
            </el-form-item>
            <el-form-item label="确认密码" prop="confirm">
              <el-input
                type="password"
                show-password
                v-model="reg.confirm"
                placeholder="确认密码..."
              ></el-input>
            </el-form-item>
          </el-form>

          <div class="error py-2 h-4 text-center">{{ err }}</div>
          <div class="flex flex-col items-center">
            <k-button class="w-40" @click="handleRegister">注册</k-button>
          </div>
        </div>
      </template>
    </div>
    <div class="flex items-center justify-center p-4">
      <div v-if="showLogin" class="link">
        没有账户？可以在此<span @click="showLogin = false">注册</span>
      </div>
      <div v-else class="link">已有账户？可以点击<span @click="showLogin = true">登录</span></div>
    </div>
  </k-layout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { send, message, useContext, useRpc } from '@cordisjs/client'

const ctx = useContext()
const chat = ctx['im.client']

const err = ref<string>('')

const showLogin = ref<boolean>(true)

interface UserForm {
  name: string
  password: string
}

const login = ref<UserForm>({
  name: '',
  password: '',
})

const reg = ref<UserForm & { confirm: string }>({
  name: '',
  password: '',
  confirm: '',
})

const loginFormRef = ref()
const regFormRef = ref()

const loginRules = reactive({
  name: [
    {
      validator: (rule, value, callback) => {
        if (value === '') {
          callback(new Error('用户名不能为空'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  password: [
    {
      validator: (rule, value, callback) => {
        if (value === '') {
          callback(new Error('密码不能为空'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
})

const regRules = reactive({
  name: [
    {
      validator: (rule, value, callback) => {
        if (value === '') {
          callback(new Error('用户名不能为空'))
        } else if (value.length > 16) {
          callback(new Error('用户名长度应不大于 16'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  password: [
    {
      message: '密码不能为空',
      trigger: 'blur',
    },
    {
      validator: (rule, value, callback) => {
        if (value.length < 8 || value.length > 16) {
          callback(new Error('密码长度应为 8 ~ 16'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  confirm: [
    {
      message: '确认密码不能为空',
      trigger: 'blur',
    },
    {
      validator: (rule, value, callback) => {
        if (value !== reg.value.password) {
          callback(new Error('两次密码输入不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
})

function handleLogin() {
  loginFormRef.value?.validate((valid) => {
    if (valid) {
      err.value = ''
      chat.status.value = 'verifying'
      send('im/v1/login', login.value).then(
        (res) => {
          message.success('登录成功')
          chat.setLogin(res)
        },
        (error) => {
          err.value = error.message
          chat.status.value = 'logging-in'
        }
      )
    }
  })
}

function handleRegister() {
  regFormRef.value?.validate((valid) => {
    if (valid) {
      send('im/v1/register', { name: reg.value.name, password: reg.value.password }).then(
        () => {
          message.success('注册成功')
          showLogin.value = true
          login.value = reg.value
        },
        (error) => {
          err.value = error.message
        }
      )
    }
  })
}
</script>

<style lang="scss" scoped>
.card {
  border: 1px solid var(--k-color-border);
  border-radius: 4px;
  background-color: var(--bg2);
}

.link {
  color: var(--fg2);
  font-size: 0.875rem;
  span {
    color: var(--k-color-active);
    cursor: pointer;
  }
}

.error {
  color: var(--k-color-danger);
}
</style>
