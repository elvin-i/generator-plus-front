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
    :title="getTitle(initvalue)"
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

          <!-- 名称  -->
          <a-form-model-item
            label="名称"
            prop="name"
            :label-col="formItemLayout.labelCol"
            :wrapper-col="formItemLayout.wrapperCol"
          >
            <a-input v-model="form.name" placeholder="请输入名称" />
          </a-form-model-item>
          <!-- 制品上传  -->
          <a-form-model-item
            label="请上传制品"
            prop="url"
            :label-col="formItemLayout.labelCol"
            :wrapper-col="formItemLayout.wrapperCol"
          >
            <template>
              <a-upload-dragger
                name="file"
                :multiple="false"
                :customRequest="customRequest"
                :remove="removeFile"
                :file-list="fileList"
              >
                <p class="ant-upload-drag-icon">
                  <a-icon type="inbox" />
                </p>
                <p class="ant-upload-text">
                  点击或拖动文件到此区域上传
                </p>
              </a-upload-dragger>
            </template>
          </a-form-model-item>
      </a-form-model>
    </div>
    <template slot="footer">
      <a-button @click="handleEdit()" type="primary"> 提交 </a-button>
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
        if (this.initvalue.url) {
          const file = {
            uid: this.initvalue.url,
            name: this.initvalue.url,
            status: 'done'
          }
          this.fileList.splice(this.fileList.indexOf(file), 1)
          this.fileList.push(file)
        }
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
    customRequest (data) {
      const formData = new FormData()
      formData.append('file', data.file)
      request({
        url: '/app/upload',
        method: 'post',
        dataType: 'json',
        data: formData
      }).then(res => {
        if (res.head.status === 'S') {
          this.form.url = res.body
          this.fileList = []
          this.fileList.push({
            uid: res.body,
            name: res.body,
            status: 'done',
            response: res
          })
          message.success('文件:' + data.file.name + ' 上传结果:' + res.head.msg)
        } else {
          message.error(res.head.msg)
        }
      }).catch(() => {
        message.error('上传失败!')
      })
    },
    removeFile (file) {
      this.form.url = ''
      this.fileList.splice(this.fileList.indexOf(file), 1)
    },
    getTitle (initvalue) {
      if (initvalue) {
        return <span> 编辑 </span>
      } else {
        return <span> 新建 </span>
      }
    },
    show () {
      this.visible = true
    },
    handleClose () {
      this.form = clone(this.initForm)
      this.form.param = ''
      this.visible = false
    },
    handleEdit () {
      this.$refs.form.validate((bool) => {
        if (bool) {
          // 深拷贝,以避开提交时改变源数据
          var data = JSON.parse(JSON.stringify(this.form))
          this.commonRequest.head.operationTime = Date.now()
          this.commonRequest.body = data
          const commonRequest = this.commonRequest
          request({
            url: '/archetypes/addOrEdit',
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
      fileList: [],
      visible: false,
      formLayout: 'horizontal',
      formItemLayout,
      datasourcesList: [],
      form: {
       id: null,
       auditId: null,
       applicationCode: null,
       name: null,
       url: null,
       description: null,
       remark: null,
       gmtCreated: null,
       creator: null,
       creatorTenantId: null,
       creatorCode: null,
       gmtModified: null,
       modifier: null,
       modifierCode: null,
       auditStatus: null,
       status: null,
       bak01: null,
       bak02: null,
       bak03: null,
       bak04: null,
       bak05: null,
        end: ''
      },
      initForm: {
       id: null,
       auditId: null,
       applicationCode: null,
       name: null,
       url: null,
       description: null,
       remark: null,
       gmtCreated: null,
       creator: null,
       creatorTenantId: null,
       creatorCode: null,
       gmtModified: null,
       modifier: null,
       modifierCode: null,
       auditStatus: null,
       status: null,
       bak01: null,
       bak02: null,
       bak03: null,
       bak04: null,
       bak05: null,
        end: ''
      },
      rules: {
        name: [
            { required: true, message: '请输入' },
            { max: 50, message: '最多输入50个字符' },
            {
              pattern: /^(?!(\s+$))/,
              message: '输入格式错误'
            }
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
