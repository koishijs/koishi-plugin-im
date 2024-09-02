<template>
  <k-layout main="darker flex flex-col items-center justify-center">
    <div class="card h-100 w-150 flex flex-row bg-[var(--bg2)]">
      <div class="p-8 flex flex-col items-center justify-between select-none">
        <im-avatar size="extreme"></im-avatar>
        <div v-if="showLogin" class="link">
          没有账户？可以在此<span @click="showLogin = false">注册</span>
        </div>
        <div v-else class="link">已有账户？可以点击<span @click="showLogin = true">登录</span></div>
      </div>
      <div class="login-form grow-1 p-10 flex flex-col">
        <p class="error">{{ err }}</p>
        <div class="grow-1 flex flex-col gap-4">
          <template v-if="showLogin">
            <h1><span>登录</span></h1>
            <el-input v-model="login.name" placeholder="输入用户名..."></el-input>
            <el-input
              type="password"
              show-password
              v-model="login.password"
              placeholder="输入密码..."
            ></el-input>
            <k-button @click="handleLogin">登录</k-button>
          </template>
          <template v-else>
            <h1><span>新用户注册</span></h1>
            <el-form ref="regFormRef" :model="reg" :rules="rules">
              <el-form-item label="账户名" prop="name">
                <el-input v-model="reg.name" placeholder="输入用户名..."> </el-input>
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
            <div class="self-end my-2.5 mx-0">
              <k-button @click="handleRegister">注册</k-button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </k-layout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { send, message, useContext, useRpc } from '@cordisjs/client'
import { validate } from '@satorijs/plugin-im-utils'

const ctx = useContext()
const chat = useContext()['im.client']

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
const regFormRef = ref()

const rules = reactive({
  name: [
    {
      validator: (rule, value, callback) => {
        if (value === '') {
          callback(new Error('用户名不能为空'))
        } else if (value.length > 16) {
          callback(new Error('用户名长度应不大于 16'))
        } else if (!validate('name', value)) {
          callback(new Error('用户名仅能以 a-zA-Z0-9_ 组成'))
        } else {
          send('im/v1/validate-name', { name: value })
            .then((data) => {
              if (data === false) {
                callback(new Error('用户名重复'))
              }
            })
            .catch((error) => {
              callback(new Error('验证失败，请稍后重试'))
            })
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
        } else if (value.length < 8 || value.length > 16) {
          callback(new Error('密码长度应为 8 ~ 16'))
        } else if (!validate('password', value)) {
          callback(new Error('密码需要包含字母，数字和特殊字符'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  confirm: [
    {
      validator: (rule, value, callback) => {
        if (value === '') {
          callback(new Error('密码不能为空'))
        } else if (value !== reg.value.password) {
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
  err.value = ''
  chat.status.value = 'syncing'
  send('im/v1/login', login.value).then(
    (res) => {
      message.success('登录成功')
      chat.setLogin(res)
    },
    (error) => {
      message.error(error.message)
      chat.status.value = 'logging-in'
    }
  )
}

function handleRegister() {
  send('im/v1/register', { name: reg.value.name, password: reg.value.password }).then(
    (data) => {
      message.success('注册成功')
      ;(showLogin.value = true), (login.value = reg.value)
    },
    (error) => {
      message.error(error.message)
    }
  )
  err.value = ''
}
</script>

<style lang="scss" scoped>
.card {
  border: 1px solid var(--k-color-border);
  border-radius: 8px;

  .link {
    color: var(--fg2);
    font-size: 0.875rem;
    span {
      color: var(--k-color-active);
      cursor: pointer;
    }
  }

  .login-form {
    border-left: 3px solid var(--k-color-divider);
  }
}
</style>
