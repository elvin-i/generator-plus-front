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

        <span style="font-size: 15px; font-weight: 1000; color: #827f7f;"> 基础配置 </span>
        <div class="line-border">
          <!-- 配置名称  -->
          <a-form-model-item
            label="配置名称"
            prop="name"
            :label-col="formItemLayout.labelCol"
            :wrapper-col="formItemLayout.wrapperCol"
          >
            <a-input v-model="form.name" placeholder="请输入配置名称" />
          </a-form-model-item>
        </div>
        <span style="font-size: 15px; font-weight: 1000; color: #827f7f;"> 连接配置 </span>
        <div class="line-border">
          <!-- 选择连接  -->
          <a-form-model-item
            label="选择连接"
            prop="datasourcesName"
            :label-col="formItemLayout.labelCol"
            :wrapper-col="formItemLayout.wrapperCol"
          >
            <a-select
              v-model="form.datasourcesName"
              placeholder="请选择连接"
              @change="datasourcesChange"
            >
              <a-select-option v-for="datasources in datasourcesList" :key="datasources.id" :value="datasources.name ? datasources.name : datasources.id + 1" :title="datasources.name">
                {{ datasources.name ? datasources.name : datasources.id + 1 }}
              </a-select-option>
            </a-select>
          </a-form-model-item>

          <!-- 数据表名  -->
          <a-form-model-item
            label="选择表名"
            prop="tables"
            :label-col="formItemLayout.labelCol"
            :wrapper-col="formItemLayout.wrapperCol"
          >
            <label v-for="table in form.tableList" :key="table.name" :value="table.name" >
              <div style="float: left;margin-right: 25px">
                <input type="checkbox" v-model="form.tables" :value="table.name"/>
                {{ table.name }}
              </div>
            </label>
          </a-form-model-item>
        </div>

        <span style="font-size: 15px; font-weight: 1000; color: #827f7f;"> 生成配置 </span>
        <div class="line-border">
          <!-- 模板分组  -->
          <a-form-model-item
            label="模板分组"
            prop="templatesGroupName"
            :label-col="formItemLayout.labelCol"
            :wrapper-col="formItemLayout.wrapperCol"
          >
            <a-select
              v-model="form.templatesGroupName"
              placeholder="请选择模板分组"
              @change="templatesGroupChange"
            >
              <a-select-option v-for="templatesGroup in templatesGroupList" :key="templatesGroup.id" :value="templatesGroup.name ? templatesGroup.name : templatesGroup.id + 1" :title="templatesGroup.name">
                {{ templatesGroup.name ? templatesGroup.name : templatesGroup.id + 1 }}
              </a-select-option>
            </a-select>
          </a-form-model-item>
          <!-- 选择模板  -->
          <a-form-model-item
            label="选择模板"
            prop="templateIds"
            :label-col="formItemLayout.labelCol"
            :wrapper-col="formItemLayout.wrapperCol"
          >
            <label v-for="template in form.templatesList" :key="template.name" :value="template.name" >
              <div style="float: left;margin-right: 25px">
                <input type="checkbox" v-model="form.templateIds" :value="template.id"/>
                {{ template.name }}
              </div>
            </label>
          </a-form-model-item>

        </div>
        <span style="font-size: 15px; font-weight: 1000; color: #827f7f;"> 本地配置 </span>
        <div class="line-border">
          <!-- 脚本内容  -->
          <a-form-model-item
            label="脚本内容"
            prop="dirLocation"
            :label-col="formItemLayout.labelCol"
            :wrapper-col="formItemLayout.wrapperCol"
          >
            <a-textarea style="background-color: black; color: wheat;width: 100% ;height: 140px;" name="dirLocation" v-model="form.dirLocation" placeholder="请输入解压源码包之后,把源码copy进项目结构的脚本" autocomplete="off"></a-textarea>
            <span style="color: grey;font-size: 12px;line-height: 1px;">该脚本期望的逻辑实现为:解压源码包之后,执行该脚本将源码copy进正确的项目结构目录中.
              脚本内容会生成bat脚本文件一并打包到最终的压缩包里.</span>
          </a-form-model-item>
          <!-- 示例脚本 -->
          <a-form-model-item
            label="示例脚本"
            :label-col="formItemLayout.labelCol"
            :wrapper-col="formItemLayout.wrapperCol"
          >
            <div :wrapper-col="formItemLayout.wrapperCol" style="background:white; padding:5px">
              <a-card title="" :bordered="false" style="width: 100%">
                <p>@echo off</p>
                <p>echo "starting copy resource code ..."</p>
                <p>xcopy *.* C:\Users\elvin\Desktop\11\buukle-generator\ /s /e /c /y /h /r</p>
                <p>echo "resource code copy finished !"</p>
                <p>pause</p>
              </a-card>
            </div>
          </a-form-model-item>
        </div>
        <span style="font-size: 15px; font-weight: 1000; color: #827f7f;"> 其他配置 </span>
        <div class="line-border">
          <a-form-model-item
            label="备注"
            prop="remark"
            :label-col="formItemLayout.labelCol"
            :wrapper-col="formItemLayout.wrapperCol"
          >
            <a-textarea style="width: 100% ;height: 140px;" name="remark" v-model="form.remark" placeholder="remark" autocomplete="off"></a-textarea>
          </a-form-model-item>
        </div>
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
    templatesGroupChange (value, e) {
      // 加载模板分组的模板
      const commonRequest = this.commonRequest
      this.form.templatesGroupId = e.data.key
      this.bodyByGroupId.templatesGroupId = e.data.key
      commonRequest.body = this.bodyByGroupId
      request({
        url: '/templates/getTemplatesByGroupId',
        method: 'post',
        dataType: 'json',
        data: commonRequest
      }).then(res => {
        if (res.head.status === 'S') {
          this.form.templatesList = res.body
          this.form.templateIds = []
        } else {
          this.form.templatesList = {}
          this.form.templateIds = []
          message.error(res.head.msg)
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    getTemplatesGroupList () {
      const commonRequest = this.commonRequest
      request({
        url: '/templatesGroup/getTemplatesGroupList',
        method: 'post',
        dataType: 'json',
        data: commonRequest
      }).then(res => {
        if (res.head.status === 'S') {
          this.templatesGroupList = res.body
        } else {
          message.error(res.head.msg)
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    datasourcesChange (value, e) {
      // 加载数据源的表
      const commonRequest = this.commonRequest
      this.form.datasourcesId = e.data.key
      this.bodyById.id = e.data.key
      commonRequest.body = this.bodyById
      request({
        url: '/datasources/getTablesListById',
        method: 'post',
        dataType: 'json',
        data: commonRequest
      }).then(res => {
        if (res.head.status === 'S') {
          this.form.tableList = res.body
          this.form.tables = []
        } else {
          this.form.tableList = {}
          this.form.tables = []
          message.error(res.head.msg)
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    getDatasourcesList () {
      const commonRequest = this.commonRequest
      request({
        url: '/datasources/getDatasourcesForConfigure',
        method: 'post',
        dataType: 'json',
        data: commonRequest
      }).then(res => {
        if (res.head.status === 'S') {
          this.datasourcesList = res.body
        } else {
          message.error(res.head.msg)
        }
      }).catch((err) => {
        console.log(err)
      })
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
      this.getDatasourcesList()
      this.getTemplatesGroupList()
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
          data.tables = data.tables.join(',')
          data.templateIds = data.templateIds.join(',')
          this.commonRequest.head.operationTime = Date.now()
          this.commonRequest.body = data
          const commonRequest = this.commonRequest
          request({
            url: '/configures/addOrEdit',
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
      templatesGroupList: [],
      form: {
        id: null,
        name: '',
        datasourcesId: '',
        datasourcesName: '',
        tables: [],
        templateIds: [],
        tableList: {},
        templatesGroupId: '',
        templatesGroupName: '',
        templatesList: {},
        basePackage: '',
        dirLocation: '',
        bak01: '',
        remark: ''
      },
      initForm: {
        id: null,
        name: '',
        datasourcesId: '',
        datasourcesName: '',
        tables: [],
        templatesGroupId: '',
        templatesGroupName: '',
        templateIds: [],
        tableList: {},
        templatesList: {},
        basePackage: '',
        dirLocation: '',
        bak01: '',
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
        datasourcesName: [
            { required: true, message: '请选择' }
          ],
        templatesGroupName: [
            { required: true, message: '请选择' }
          ],
        tables: [
            { required: true, message: '请选择表名(选择前请先选择正确的连接)' }
          ],
        templateIds: [
            { required: true, message: '请选择模板(选择前请先选择正确的模板分组)' }
          ],
        dirLocation: [
            { required: true, message: '请输入脚本' }
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
        },
        bodyByGroupId: {
          templatesGroupId: 0
        }
      }
  }
}
</script>
