<template>
  <a-modal
    v-model="visible"
    :destroyOnClose="true"
    :width="900"
    :height="600"
    :visible="visible"
    :title="initvalue ? '编辑' : '新建'"
  >
    <div class="main">
      <a-form-model ref="form" :layout="formLayout" :model="form" :rules="rules">
        <a-form-model-item
          v-show="false"
          label="id"
          prop="id"
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol"
        >
          <a-input v-model="form.id" />
        </a-form-model-item>

        <a-form-model-item
          label="连接名称"
          prop="name"
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol"
        >
          <a-input v-model="form.name" placeholder="请输入连接名称" />
        </a-form-model-item>

        <a-form-model-item
          label="url"
          prop="url"
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol"
        >
          <a-input v-model="form.url" placeholder="请输入url" />
        </a-form-model-item>

        <a-form-model-item
          label="username"
          prop="username"
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol"
        >
          <a-input v-model="form.username" placeholder="请输入username" />
        </a-form-model-item>

        <a-form-model-item
          label="password"
          prop="password"
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol"
        >
          <a-input v-model="form.password" type="password" placeholder="请输入password" />
        </a-form-model-item>

        <a-form-model-item
          label="备注"
          prop="remark"
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol"
        >
          <a-input v-model="form.remark" placeholder="请输入备注" />
        </a-form-model-item>

      </a-form-model>
    </div>
    <template slot="footer">
      <a-button @click="handleEdit()" type="primary"> 提交 </a-button>
      <a-button @click="handleTestLink()" type="primary"> 测试连接 </a-button>
      <a-button @click="handleClose()"> 取消 </a-button>
    </template>

  </a-modal>
</template>

<script>

import clone from 'clone'
import request from '@/utils/request'
import { message } from 'ant-design-vue'

const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 16 }
}

export default {
  props: {
    initvalue: {
      type: Object, // 类型
      default: null // 默认值
    }
  },
  watch: {
    initvalue () {
      if (this.initvalue) {
        for (const key in this.initvalue) {
          this.form[key] = this.initvalue[key]
        }
      } else {
        this.form = clone(this.initForm)
      }
    }
  },
  methods: {
    show () {
      this.visible = true
    },
    handleTestLink () {
      this.$refs.form.validate((bool) => {
        if (bool) {
          this.commonRequest.head.operationTime = Date.now()
          this.commonRequest.body = this.form
          const commonRequest = this.commonRequest
          request({
            url: '/datasources/testLink',
            method: 'post',
            dataType: 'json',
            data: commonRequest
          }).then(res => {
            if (res.head.status === 'S') {
              message.success(res.head.msg)
            } else {
              message.error(res.head.msg)
            }
          }).catch((err) => {
            console.log(err)
          })
        }
      })
    },
    handleClose () {
      this.form = clone(this.initForm)
      this.form.param = ''
      this.visible = false
    },
    handleEdit () {
      this.$refs.form.validate((bool) => {
        if (bool) {
          this.commonRequest.head.operationTime = Date.now()
          this.commonRequest.body = this.form
          const commonRequest = this.commonRequest
          request({
            url: '/datasources/addOrEdit',
            method: 'post',
            dataType: 'json',
            data: commonRequest
          }).then(res => {
            if (res.head.status === 'S') {
              message.success(res.head.msg)
              this.handleClose()
              this.$emit('refresh')
            } else {
              message.error(res.head.msg)
            }
          }).catch((err) => {
            console.log(err)
          })
        }
      })
    }
  },
  data () {
    return {
      visible: false,
      formLayout: 'horizontal',
      formItemLayout,
      form: {
        id: null,
        name: '',
        url: '',
        username: '',
        password: '',
        remark: ''
      },
      initForm: {
        id: null,
        name: '',
        url: '',
        username: '',
        password: '',
        remark: ''
      },
      rules: {
        name: [
            { required: true, message: '请输入' },
            { max: 50, message: '最多输入50个字符' },
            {
              pattern: /^(?!(\s+$))/,
              message: '输入格式错误'
            }
          ],
        url: [
            { required: true, message: '请输入' },
            { max: 256, message: '最多输入256个字符' }
          ],
        username: [
            { required: true, message: '请输入' },
            { max: 64, message: '最多输入64个字符' }
          ],
        password: [
            { required: true, message: '请输入' },
            { max: 64, message: '最多输入64个字符' }
          ]
        },
        commonRequest: {
          head: {
            operationTime: Date.now(),
            appId: process.env.VUE_APP_BUUKLE_APP_ID
          },
          body: {}
        }
      }
  }
}
</script>
