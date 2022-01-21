<style>
div .line-border{
  border: 1px #dccece solid;
  border-style: dashed;
  padding-top: 20px;
  padding-right: 20px;
  margin-top: 15px;
  margin-bottom: 15px;
}
</style>
<template>
  <a-modal
    v-model="visible"
    :destroyOnClose="true"
    :width="1080"
    :visible="visible"
    title="生成"
  >
    <div class="main">
      <a-form-model ref="form" :layout="formLayout" :model="form" :rules="rules">
        <a-form-model-item
          v-show="false"
          label="archetypesId"
          prop="archetypesId"
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol"
        >
          <a-input v-model="form.archetypesId" />
        </a-form-model-item>

          <!-- groupId  -->
          <a-form-model-item
            label="groupId"
            prop="groupId"
            :label-col="formItemLayout.labelCol"
            :wrapper-col="formItemLayout.wrapperCol"
          >
            <a-input v-model="form.groupId" placeholder="请输入 groupId" />
          </a-form-model-item>
          <!-- artifactId  -->
          <a-form-model-item
            label="artifactId"
            prop="artifactId"
            :label-col="formItemLayout.labelCol"
            :wrapper-col="formItemLayout.wrapperCol"
          >
            <a-input v-model="form.artifactId" placeholder="请输入 artifactId" />
          </a-form-model-item>
          <!-- version  -->
          <a-form-model-item
            label="version"
            prop="version"
            :label-col="formItemLayout.labelCol"
            :wrapper-col="formItemLayout.wrapperCol"
          >
            <a-input v-model="form.version" placeholder="请输入 version" />
          </a-form-model-item>
          <!-- basePackage  -->
          <a-form-model-item
            label="basePackage"
            prop="basePackage"
            :label-col="formItemLayout.labelCol"
            :wrapper-col="formItemLayout.wrapperCol"
          >
            <a-input v-model="form.basePackage" placeholder="请输入 basePackage" />
          </a-form-model-item>
          <!-- archetype  -->
          <a-form-model-item
            label="archetypeUrl"
            prop="archetypeUrl"
            :label-col="formItemLayout.labelCol"
            :wrapper-col="formItemLayout.wrapperCol"
          >
            <span v-text="form.archetypeUrl"></span>
          </a-form-model-item>
      </a-form-model>
    </div>
    <template slot="footer">
      <a-button @click="handleExecute()" type="primary"> 执行 </a-button>
      <a-button @click="handleClose()"> 取消 </a-button>
    </template>

  </a-modal>
</template>

<script>

import clone from 'clone'
import request from '@/utils/request'
import { message } from 'ant-design-vue'

const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 21 }
}

export default {
  components: {
  },
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
    },
    // 清理表单
    visible (val, newVal) {
      if (!val) {
        try {
          // 清理文件上传缓存
          this.fileList = []
          this.form = clone(this.initForm)
        } catch (e) {}
      }
    }
  },
  methods: {
    show () {
      this.visible = true
    },
    handleClose () {
      this.form = clone(this.initForm)
      this.form.param = ''
      this.visible = false
    },
    handleExecute () {
      this.$refs.form.validate((bool) => {
        if (bool) {
          // 深拷贝,以避开提交时改变源数据
          var data = JSON.parse(JSON.stringify(this.form))
          this.commonRequest.head.operationTime = Date.now()
          this.commonRequest.body = data
          const commonRequest = this.commonRequest
          request({
            url: '/archetypes/execute',
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
      datasourcesList: [],
      form: {
       archetypesId: null,
       groupId: null,
       artifactId: null,
       version: null,
        archetypeUrl: null,
       basePackage: null
      },
      initForm: {
        archetypesId: null,
        groupId: null,
        artifactId: null,
        version: null,
        archetypeUrl: null,
        basePackage: null
      },
      rules: {
        groupId: [
            { required: true, message: '请输入 groupId' },
            { max: 128, message: '最多输入128个字符' }
          ],
        artifactId: [
            { required: true, message: '请输入 artifactId' },
            { max: 128, message: '最多输入128个字符' }
          ],
        version: [
            { required: true, message: '请输入 version' },
            { max: 128, message: '最多输入128个字符' }
          ],
        basePackage: [
            { required: true, message: '请输入 basePackage' },
            { max: 128, message: '最多输入255个字符' }
          ]
        },
        commonRequest: {
          head: {
            operationTime: Date.now(),
            appId: process.env.VUE_APP_BUUKLE_APP_ID
          },
          body: {}
        },
        bodyById: {
          id: 0
        }
      }
  }
}
</script>
