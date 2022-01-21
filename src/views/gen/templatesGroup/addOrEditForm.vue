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

        <a-form-model-item
          label="自定义分组变量"
          prop="paramList"
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol"
        >
          <a-form-item
            v-for="(k, index) in form.paramList"
            :key="index"
            v-bind="formItemLayout"
            :required="false"
          >
            (<span v-html="index + 1"></span>)
            <a-input
              addon-before="变量名"
              v-model="k.name"
              placeholder="name"
              style="width: 30%; margin-right: 8px"
            />
            <a-input
              addon-before="变量值"
              v-model="k.value"
              placeholder="value"
              style="width: 30%; margin-right: 8px"
            />
            <a-icon
              v-if="form.paramList.length > 0"
              class="dynamic-delete-button"
              type="minus-circle-o"
              @click="() => remove(k)"
            />
          </a-form-item>
          <a-form-item v-bind="formItemLayout">
            <a-button type="dashed" style="width: 60%" @click="add">
              <a-icon type="plus" /> 添加分组变量
            </a-button>
          </a-form-item>
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

// eslint-disable-next-line no-unused-vars
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
          this.form = clone(this.initForm)
        } catch (e) {}
      }
    }
  },
  methods: {
    remove (k) {
      var length = this.form.paramList.length
      for (var i = 0; i < length; i++) {
        if (this.form.paramList[i] == k) {
          this.form.paramList.splice(i, 1)
        }
      }
    },
    add () {
      this.form.paramList.push({ 'name': '', 'value': '' })
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
          var validate = true
          for (var i = 0; i < this.form.paramList.length; i++) {
            if (this.form.paramList[i].name === '') {
              message.error('请填写 [自定义分组变量] 第' + (i + 1) + '行 "变量名"')
              validate = false
            }
            if (this.form.paramList[i].value === '') {
              message.error('请填写 [自定义分组变量] 第' + (i + 1) + '行 "变量值"')
              validate = false
            }
          }
          if (validate) {
            // 深拷贝,以避开提交时改变源数据
            var data = JSON.parse(JSON.stringify(this.form))
            this.commonRequest.head.operationTime = Date.now()
            this.commonRequest.body = data
            const commonRequest = this.commonRequest
            request({
              url: '/templatesGroup/addOrEdit',
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
        }
      })
    }
  },
  data () {
    return {
      formItemLayout: {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 4 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 20 }
        }
      },
      visible: false,
      formLayout: 'horizontal',
      datasourcesList: [],
      form: {
       paramList: [],
       id: null,
       auditId: null,
       applicationCode: null,
       name: null,
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
       paramList: [],
       id: null,
       auditId: null,
       applicationCode: null,
       name: null,
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
