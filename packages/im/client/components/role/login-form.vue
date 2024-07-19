<template>
  <k-layout main="darker flex flex-col items-center justify-center">
    <k-card class="login-form flex flex-col items-center">
      <h3 class="self-end">
        <k-tab :data="['登录', '我是新用户！']" v-model="showLogin"></k-tab>
      </h3>

      <p class="error">{{ err }}</p>

      <template v-if="!showLogin">
        <h1><span>已有账户登录</span></h1>
        <el-input v-model="login.name" placeholder="输入用户名..."></el-input>
        <el-input type="password" v-model="login.password" placeholder="输入密码..."></el-input>
        <div class="self-end my-2.5 mx-0">
          <k-button @click="handleLogin">登录</k-button>
        </div>
      </template>
      <template v-else>
        <h1><span>新用户注册</span></h1>
        <el-input v-model="reg.name" placeholder="输入用户名..."> </el-input>
        <el-input type="password" v-model="reg.password" placeholder="输入密码..."></el-input>
        <el-input type="password" v-model="reg.confirm" placeholder="确认密码..."></el-input>
        <div class="self-end my-2.5 mx-0">
          <k-button @click="handleRegister">注册</k-button>
        </div>
      </template>
    </k-card>
  </k-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { send, message } from '@cordisjs/client'
import { CharValidator } from '@satorijs/plugin-im'
import shared from '@satorijs/plugin-im-webui/client/shared'

const err = ref<string>('')

const showLogin = ref<number>(0)

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

const validate = new CharValidator().validate

async function handleLogin() {
  err.value = ''
  send('im/v1/user/login-add', login.value).then(
    (res) => {
      shared.value.currentUser = res
      shared.value.shouldLogin = false
      message.success('登录成功')
    },
    (error) => {
      message.error(error.message)
    }
  )
}

async function handleRegister() {
  const name = reg.value.name
  const password = reg.value.password
  if (
    validate(reg.value.name, 0) ||
    validate(reg.value.password, 2) ||
    reg.value.confirm !== reg.value.password
  ) {
    err.value = '格式错误'
    return
  }
  err.value = ''
  send('im/v1/user/register', { name, password }).then(
    (data) => {
      message.success('注册成功')
    },
    (error) => {
      message.error('注册失败')
    }
  )
}
</script>

<style lang="scss">
.login-form {
  width: 30rem;
  height: 25rem;
  margin: 0;

  .el-input {
    display: block;
    margin: 1rem auto;
  }

  .el-input__wrapper {
    width: 20rem;
  }

  .k-button {
    width: 8rem;
    margin: 0 1rem;
  }
}
</style>
