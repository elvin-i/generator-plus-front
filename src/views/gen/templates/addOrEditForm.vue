<template>
  <a-modal
    v-model="visible"
    :destroyOnClose="true"
    :width="900"
    :height="600"
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

        <!-- 模板分组  -->
        <a-form-model-item
          label="模板分组"
          prop="templatesGroupName"
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol"
        >
          <a-select
            v-model="form.templatesGroupName"
            placeholder="请选择分组"
            @change="templatesGroupChange"
          >
            <a-select-option v-for="templatesGroup in templatesGroupList" :key="templatesGroup.id" :value="templatesGroup.name ? templatesGroup.name : templatesGroup.id + 1" :title="templatesGroup.name">
              {{ templatesGroup.name ? templatesGroup.name : templatesGroup.id + 1 }}
            </a-select-option>
          </a-select>
          <a-popover title="模板分组变量列表">
            <template slot="content">
              <a-table :columns="columnsGroupParam" :pagination="false" :data-source="form.templatesGroupParamList" bordered>
                <template slot="name" slot-scope="text">
                  <a>{{ text }}</a>
                </template>
              </a-table>
            </template>
            <span>模板分组变量列表</span>
            <a-icon type="question-circle" />
          </a-popover>
        </a-form-model-item>
        <a-form-model-item
          label="模板名称"
          prop="name"
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol"
        >
          <a-input v-model="form.name" placeholder="请输入模板名称" />
          <span style="color: grey;font-size: 12px;line-height: 1px;">
            请按照模板:
            <span style="color: red;font-size: 12px;line-height: 1px;">A.B.btl</span>
            填写,生成目标文件时会截取<span style="color:red">B</span>值作为文件后缀名
          </span>
        </a-form-model-item>
        <a-form-model-item
          label="文件名称模式"
          prop="addNameSuffix"
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol"
        >
          <a-radio-group name="addNameSuffix" :default-value="form.addNameSuffix" v-model="form.addNameSuffix">
            <a-radio :value="'0'">
              ①. 表名大驼峰
            </a-radio>
            <a-radio :value="'1'">
              ②. 模板前中段
            </a-radio>
            <a-radio :value="'2'">
              ③. ①+②
            </a-radio>
            <a-popover title="说明">
              <template slot="content">
                <span style="color: grey;font-size: 12px;line-height: 1px;">举例 -- 模板名称 : QueryDTO.vue.btl 表名:table_example </span>
                <br/>
                <span style="color: grey;font-size: 12px;line-height: 1px;">生成的文件名为</span>
                <br/>
                <span style="color: grey;font-size: 12px;line-height: 1px;">
                  ① :
                <span style="color: #2c65a0;font-size: 12px;line-height: 1px;">TableExample</span>.vue
                </span>
                <br/>
                <span style="color: grey;font-size: 12px;line-height: 1px;">
                  ② :
                  <span style="color: red;font-size: 12px;line-height: 1px;">QueryDTO</span>.vue
              </span>
                <br/>
                <span style="color: grey;font-size: 12px;line-height: 1px;">
                  ③ :
                  <span style="color: #2c65a0;font-size: 12px;line-height: 1px;">TableExample</span>
                  <span style="color: red;font-size: 12px;line-height: 1px;">QueryDTO</span>.vue
              </span>
              </template>
              <a-icon type="question-circle" />
            </a-popover>
          </a-radio-group>
        </a-form-model-item>
        <a-form-model-item
          style="margin-top: -22px;"
          label="工程路径"
          prop="path"
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol"
        >
          <a-input v-model="form.path" placeholder="请输入工程路径" />
          <a-form-model-item
            label="表名路径"
            prop="openTablePath"
            :label-col="formItemLayout.labelCol"
            :wrapper-col="formItemLayout.wrapperCol"
          >
            <a-radio-group @change="openTablePathChange" name="openTablePath" :default-value="form.openTablePath" v-model="form.openTablePath">
              <a-radio :value="'1'">
                开启
              </a-radio>
              <a-radio :value="'0'">
                不开启
              </a-radio>
            </a-radio-group>
            <a-popover title="说明">
              <template slot="content">
              <span style="color: grey;font-size: 12px;line-height: 1px;">工程路径   :
                <span style="color: #2c65a0;font-size: 12px;line-height: 1px;"> buukle-example/src/java</span>
                  表名    :   table_example </span>
                <br/>
                <span style="color: grey;font-size: 12px;line-height: 1px;">生成的文件路径信息:</span>
                <br/>
                <span style="color: grey;font-size: 12px;line-height: 1px;">
              开启后 :
                <span style="color: #2c65a0;font-size: 12px;line-height: 1px;"> buukle-example/src/java</span>
              <span style="color: red;font-size: 12px;line-height: 1px;">/tableExample</span>/TableExample.java
              <br/>
              不开启 :
                <span style="color: #2c65a0;font-size: 12px;line-height: 1px;"> buukle-example/src/java</span>/TableExample.java
            </span>
              </template>
              <a-icon type="question-circle" />
            </a-popover>
          </a-form-model-item>
        </a-form-model-item>
        <a-form-model-item
          style="margin-top: -22px;"
          label="包名"
          prop="packageInfo"
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol"
        >
          <a-input v-model="form.packageInfo" placeholder="请输入包名" :suffix="suffix" >
          </a-input>
          <span style="color: grey;font-size: 12px;line-height: 1px;">无包名需求可不填写(模板中使用${packageInfo} 获取该值)</span>
        </a-form-model-item>
        <a-form-model-item
          label="模板内容"
          prop="name"
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol"
        >
          <a-popover title="全局变量列表">
            <template slot="content">
              <a-table :columns="columns" :pagination="false" :data-source="data" bordered>
                <template slot="name" slot-scope="text">
                  <a>{{ text }}</a>
                </template>
              </a-table>
            </template>
            <span>全局变量列表</span>
            <a-icon type="question-circle" />
          </a-popover>
          <a-textarea
            v-model="form.content"
            style="background-color: #e6e6e6;
            color: black;border: 0px;
            margin-top: 25px;-webkit-appearance:none;
            padding: 15px"
            rows="20"
            cols="20"
            placeholder="请输入模板内容" />
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

const columns = [
  {
    title: '变量',
    dataIndex: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    title: '内容',
    dataIndex: 'mean'
  }
]
const columnsGroupParam = [
  {
    title: '变量',
    dataIndex: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    title: '内容',
    dataIndex: 'value'
  }
]
const data = [
  // eslint-disable-next-line no-template-curly-in-string
  { name: '${dollar}', mean: '【$】(处理beetl的"$"转义问题,模板需要输出$时,直接${dollar} 取即可)' },
  // eslint-disable-next-line no-template-curly-in-string
  { name: '${author}', mean: '【作者】' },
  // eslint-disable-next-line no-template-curly-in-string
  { name: '${packageInfo}', mean: '【模板包名】' },
  // eslint-disable-next-line no-template-curly-in-string
  { name: '${entity}', mean: '【实体名称(大驼峰)】' },
  // eslint-disable-next-line no-template-curly-in-string
  { name: '${entityNameLowerCamelCase}', mean: '【实体名称(小驼峰)】' },
  // eslint-disable-next-line no-template-curly-in-string,
  { name: '${date}', mean: '【当前日期】' },
  // eslint-disable-next-line no-template-curly-in-string,
  { name: '${table.comment!}', mean: '【表注释】' },
  // eslint-disable-next-line no-template-curly-in-string,
  { name: '${table.name}', mean: '【实际表名】' },
  // eslint-disable-next-line no-template-curly-in-string,
  { name: '${field.comment}', mean: '【字段注释】' },
  // eslint-disable-next-line no-template-curly-in-string,
  { name: '${field.propertyType}', mean: '【字段类型(java语言)】' },
  // eslint-disable-next-line no-template-curly-in-string,
  { name: '${field.propertyName}', mean: '【字段名称(小驼峰)】' }
]

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
        if (this.form.openTablePath === '1') {
          this.suffix = ' .表名小驼峰'
        } else {
          this.suffix = ''
        }
      } else {
        this.form = clone(this.initForm)
      }
    }
  },
  methods: {
    templatesGroupChange (value, e) {
      this.form.templatesGroupId = e.data.key
      this.bodyById.id = e.data.key
      this.commonRequest.body = this.bodyById
      const commonRequest = this.commonRequest
      request({
        url: '/templatesGroup/getById',
        method: 'post',
        dataType: 'json',
        data: commonRequest
      }).then(res => {
        if (res.head.status === 'S') {
          this.form.templatesGroupParamList = res.body.paramList
        } else {
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
    openTablePathChange () {
      if (this.form.openTablePath === '1') {
        this.suffix = ' .表名小驼峰'
      } else {
        this.suffix = ''
      }
    },
    getTitle (initvalue) {
      if (initvalue) {
        return <span> 编辑 <span style="color: red;font-size: 12px;"> * 注 : 当前只兼容 beetl 模板语法 </span></span>
      } else {
        return <span> 新建 <span style="color: red;font-size: 12px;"> * 注 : 当前只兼容 beetl 模板语法 </span></span>
      }
    },
    show () {
      this.visible = true
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
          this.commonRequest.head.operationTime = Date.now()
          this.commonRequest.body = this.form
          const commonRequest = this.commonRequest
          request({
            url: '/templates/addOrEdit',
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
      data,
      columns,
      columnsGroupParam,
      visible: false,
      suffix: '',
      formLayout: 'horizontal',
      formItemLayout,
      templatesGroupList: [],
      form: {
        id: null,
        templatesGroupId: '',
        templatesGroupName: '',
        templatesGroupParamList: '',
        name: '',
        path: '',
        openTablePath: '',
        useOriginalName: '',
        addNameSuffix: '',
        packageInfo: '',
        content: '',
        type: '',
        remark: ''
      },
      initForm: {
        id: null,
        templatesGroupId: '',
        templatesGroupName: '',
        templatesGroupParamList: '',
        name: '',
        path: '',
        openTablePath: '',
        useOriginalName: '',
        addNameSuffix: '',
        packageInfo: '',
        content: '',
        type: '',
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
        path: [
            { required: true, message: '请输入' },
            { max: 256, message: '最多输入256个字符' }
          ],
        url: [
            { required: true, message: '请输入' },
            { max: 256, message: '最多输入256个字符' }
          ],
        username: [
            { required: true, message: '请输入' },
            { max: 16, message: '最多输入16个字符' }
          ],
        openTablePath: [
            { required: true, message: '请选择' }
          ],
        addNameSuffix: [
            { required: true, message: '请选择' }
          ],
        password: [
            { required: true, message: '请输入' },
            { max: 16, message: '最多输入16个字符' }
          ],
        templatesGroupName: [
            { required: true, message: '请输入模板分组' },
            { max: 50, message: '请输入模板分组' }
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
<style>
th.column-money,
td.column-money {
  text-align: right !important;
}
</style>
