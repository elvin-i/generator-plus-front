import axios from 'axios'
import notification from 'ant-design-vue/es/notification'
import { VueAxios } from './axios'

// 创建 axios 实例
const request = axios.create({
  // API 请求的默认前缀
  baseURL: process.env.VUE_APP_API_BASE_URL,
  timeout: 6000 // 请求超时时间
})

// 异常拦截处理器
const errorHandler = (error) => {
  if (error.response) {
    const data = error.response.data
    if (error.response.status === 403) {
      notification.error({
        message: 'Forbidden',
        description: data.message
      })
    }
    if (error.response.status === 401 && !(data.result && data.result.isLogin)) {
      console.log(error)
      notification.error({
        message: 'Unauthorized',
        description: 'Authorization verification failed'
      })
      const href = process.env.VUE_APP_LOGIN_CUBE_FRONT_URL + '?redirect_url=' + process.env.VUE_APP_REDIRECT_URL
      window.location.href = href
    }
  }
  return Promise.reject(error)
}
function getCookie (cname) {
  var name = cname + '='
  var ca = document.cookie.split(';')
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i]
    while (c.charAt(0) == ' ') c = c.substring(1)
    if (c.indexOf(name) != -1) {
      return c.substring(name.length, c.length)
    }
  }
  return ''
}
// request interceptor
request.interceptors.request.use(config => {
  config.headers[process.env.VUE_APP_BUUKLE_APP_ID_KEY] = process.env.VUE_APP_BUUKLE_APP_ID
  const authorization = getCookie(process.env.VUE_APP_AUTHORIZATION_COOKIE_KEY)
  if (authorization) {
    config.headers[process.env.VUE_APP_AUTHORIZATION_HEADER_KEY] = authorization
  }
  return config
}, errorHandler)

// response interceptor
request.interceptors.response.use((response) => {
  console.log(response)
  return response.data
}, errorHandler)

const installer = {
  vm: {},
  install (Vue) {
    Vue.use(VueAxios, request)
  }
}

export default request

export {
  installer as VueAxios,
  request as axios
}
