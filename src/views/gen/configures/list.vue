<template>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="配置名称">
                <a-input v-model="queryParam.name" name="name" placeholder=""/>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="状态">
                <a-select mode="multiple" v-model="queryParam.states" placeholder="请选择" default-value="0">
                  <a-select-option value="3">正常</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <template v-if="advanced">
            </template>
            <a-col :md="!advanced && 8 || 24" :sm="24">
              <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
                <a-button type="primary" @click="handleAdd">新建</a-button>
                <a-button style="margin-left: 8px" type="primary" @click="handleSearch()">查询</a-button>
                <a-button style="margin-left: 8px" @click="() => this.queryParam = {}">重置</a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <div class="table-operator">
        <a-dropdown>
          <a-menu slot="overlay">
            <a-menu-item key="1"><a-icon type="delete" />删除</a-menu-item>
          </a-menu>
          <a-button style="margin-left: 8px">
            批量操作 <a-icon type="down" />
          </a-button>
        </a-dropdown>
      </div>

      <s-table
        ref="table"
        size="default"
        rowKey="id"
        :columns="columns"
        :data="loadData"
        :rowSelection="rowSelection"
        :pagination="{ showTotal: total => `共 ${total} 条记录` }"
      >
        <span slot="serial" slot-scope="text, record, index">
          {{ index + 1 }}
        </span>
        <span slot="status" slot-scope="text">
          <a-badge :status="text | statusTypeFilter" :text="text | statusFilter" />
        </span>
        <span slot="name" slot-scope="text">
          <ellipsis :length="128" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="gmtCreated" slot-scope="text">
          <ellipsis :length="64" tooltip>{{ gmtDateFormat(text) }}</ellipsis>
        </span>
        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="handleEdit(record.id)">编辑</a>&nbsp;
            <a @click="handleDelete(record.id)">删除</a>&nbsp;
            <a @click="handleExecute(record.id)">执行生成</a>
          </template>
        </span>
      </s-table>
      <AddOrEditForm
        ref="AddOrEditForm"
        :initvalue="initvalue"
        @refresh="refresh"
      />
      <InfoTable
        ref="InfoTable"
        :initvalue="initvalue"
        @refresh="refresh"
      />
    </a-card>
</template>

<script>
import { STable, Ellipsis } from '@/components'
 import request from '@/utils/request'
import { message } from 'ant-design-vue'
import AddOrEditForm from '@/views/gen/configures/addOrEditForm'
import InfoTable from '@/views/gen/configures/infoTable'
import moment from 'moment'

message.config({
  duration: 3, // 提示时常单位为s
  top: '40px', // 距离顶部的位置
  maxCount: 3 // 最多显示提示信息条数(后面的会替换前面的提示)
})

var isgening = false
export default {
  name: 'List',
  components: {
    InfoTable,
    STable,
    Ellipsis,
    AddOrEditForm
  },
  methods: {
    handleExecute (id) {
      this.commonRequest.head.operationTime = Date.now()
      this.bodyById.id = id
      this.commonRequest.body = this.bodyById
      const commonRequest = this.commonRequest
      message.loading('生成中...', 3)
      if (isgening) {
        return false
      }
      isgening = true
      request({
        url: '/configures/gen',
        method: 'post',
        dataType: 'json',
        data: commonRequest
      }).then(res => {
        isgening = false
        if (res.head.status === 'S') {
          message.success('生成成功,请到日志管理下载源码压缩包~', 3)
        } else {
          message.error(res.head.msg)
        }
      }).catch((err) => {
        isgening = false
        console.log(err)
      })
    },
    refresh () {
      this.$refs.table.refresh(true)
    },
    handleSearch () {
      this.$refs.table.pagination.pageNo = 1
      this.$refs.table.refresh(true)
    },
    handleAdd () {
      this.initvalue = {}
      this.commonRequest.head.operationTime = Date.now()
      this.commonRequest.body = null
      const commonRequest = this.commonRequest
      request({
        url: '/configures/getById',
        method: 'post',
        dataType: 'json',
        data: commonRequest
      }).then(res => {
        if (res.head.status === 'S') {
          this.initvalue = res.body
          this.initvalue.tables = res.body.tables == null ? [] : res.body.tables.split(',')
          this.initvalue.templateIds = res.body.templateIds == null ? [] : res.body.templateIds.split(',')
          this.initvalue.templatesList = res.body.templatesList
          this.$refs.AddOrEditForm.show()
        } else {
          message.error(res.head.msg)
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    handleDelete (id) {
      var obj = this.$refs.table
      this.commonRequest.head.operationTime = Date.now()
      this.bodyById.id = id
      this.commonRequest.body = this.bodyById
      const commonRequest = this.commonRequest
      this.$confirm({
        title: '确认提示',
        content: `是否删除该条记录？`,
        okType: 'danger',
        okText: '确认',
        cancelText: '取消',
        onOk () {
          request({
            url: '/configures/deleteById',
            method: 'post',
            dataType: 'json',
            data: commonRequest
          }).then(res => {
            if (res.head.status === 'S') {
              message.success('成功!')
              obj.refresh()
            } else {
              message.error(res.head.msg)
            }
          })
        }
      })
    },
    handleEdit (id) {
      this.commonRequest.head.operationTime = Date.now()
      this.bodyById.id = id
      this.commonRequest.body = this.bodyById
      const commonRequest = this.commonRequest
      request({
        url: '/configures/getById',
        method: 'post',
        dataType: 'json',
        data: commonRequest
      }).then(res => {
        if (res.head.status === 'S') {
          this.initvalue = res.body
          this.initvalue.tables = res.body.tables == null ? [] : res.body.tables.split(',')
          this.initvalue.templateIds = res.body.templateIds == null ? [] : res.body.templateIds.split(',')
          this.initvalue.templatesList = res.body.templatesList
          this.$refs.AddOrEditForm.show()
        } else {
          message.error(res.head.msg)
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    handleInfo (id) {
      this.commonRequest.head.operationTime = Date.now()
      this.bodyById.id = id
      this.commonRequest.body = this.bodyById
      const commonRequest = this.commonRequest
      request({
        url: '/configures/getById',
        method: 'post',
        dataType: 'json',
        data: commonRequest
      }).then(res => {
        if (res.head.status === 'S') {
          this.initvalue = res.body
          this.$refs.InfoTable.show()
        } else {
          message.error(res.head.msg)
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    handleBan (record) {
      if (record.status !== 0) {
        this.$message.info(`${record.name} 已停用`)
      } else {
        this.$message.error(`${record.name} 停用失败`)
      }
    },
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    gmtDateFormat (text) {
      return moment(text).format('yyyy-MM-DD HH:mm:ss')
    }
  },
  data () {
    this.columns = columns
    return {
      initvalue: {},
      // create model
      visible: false,
      confirmLoading: false,
      dialogFormVisible: false,
      mdl: null,
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {},
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
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        const param = Object.assign({}, parameter, this.queryParam)
        this.commonRequest.head.operationTime = Date.now()
        this.commonRequest.body = param
        const commonRequest = this.commonRequest
        return request({
          url: '/configures/getPage',
          method: 'post',
          dataType: 'json',
          data: commonRequest
        }).then(res => {
          return res.result
        })
      },
      selectedRowKeys: [],
      selectedRows: []
    }
  },
  filters: {
    statusFilter (type) {
      return statusMap[type].text
    },
    statusTypeFilter (type) {
      return statusMap[type].status
    }
  },
   computed: {
    rowSelection () {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange
      }
    }
  }
}
const columns = [
  {
     title: '序号',
    width: '5%',
    scopedSlots: { customRender: 'serial' }
  },
  {
    title: '配置名称',
    width: '40%',
    dataIndex: 'name',
    scopedSlots: { customRender: 'name' },
    needTotal: true
  },
  {
    title: '创建时间',
    width: '15%',
    dataIndex: 'gmtCreated',
    scopedSlots: { customRender: 'gmtCreated' }
  },
  {
    title: '创建者',
    dataIndex: 'creator',
    width: '5%'
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: '5%',
    scopedSlots: { customRender: 'status' }
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: '30%',
    scopedSlots: { customRender: 'action' }
  }
]
const statusMap = {
  1: {
    status: 'default',
    text: '创建完成'
  },
  2: {
    status: 'processing',
    text: '审批中'
  },
  3: {
    status: 'success',
    text: '正常'
  },
  4: {
    status: 'warning',
    text: '已禁用'
  }
}
</script>
