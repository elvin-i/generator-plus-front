<template>
  <a-row style="background-color: white" type="flex">
    <a-col :span="6" style="padding-top: 10px;padding-left: 10px ;width: 300px;overflow-y: auto;">
      <a-tree
        :tree-data="templatesGroupTree"
        :show-line="true"
        :defaultExpandAll="true"
        @expand="onExpand"
        @select="onSelect"
        :selectedKeys="selectedKeys"
      >
        <template #title="{ key: treeKey, title }">
          <a-dropdown :trigger="['contextmenu']">
            <span>{{ title }}</span>
            <template #overlay>
              <a-menu @click="({ key: menuKey }) => onContextMenuClick(treeKey, menuKey)">
                <a-menu-item key="1">复制分组(带模板)</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>
      </a-tree>
      <span style="color: rgb(169 150 150);font-size: 12px;">ps : </span>
      <br/>
      <span style="color: rgb(169 150 150);font-size: 12px;">① 支持 右键 -> 复制分组 哦~</span>
    </a-col>
    <a-col :span="18" style="padding-top: 10px;padding-left: 10px">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-input type="hidden" v-model="queryParam.templatesGroupId" name="templatesGroupId" placeholder=""/>
            <a-col :md="8" :sm="24">
              <a-form-item label="模板名称">
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
                <a-button style="margin-left: 8px" @click="handleReset()">重置</a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>
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
          <ellipsis :length="64" tooltip>{{ text }}</ellipsis>
        </span>
        <span slot="gmtCreated" slot-scope="text">
          <ellipsis :length="64" tooltip>{{ gmtDateFormat(text) }}</ellipsis>
        </span>
        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="handleEdit(record.id)">编辑</a>&nbsp;
            <a @click="handleDelete(record.id)">删除</a>&nbsp;
            <a @click="handleInfo(record.id)">详情</a>&nbsp;
<!--            <a @click="handleBan(record)">停用</a>-->
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
      <Copy
        ref="Copy"
        :initvalue="initGroupValue"
        @refresh="refresh"
      />
    </a-col>
  </a-row>
</template>

<script>
import { STable, Ellipsis } from '@/components'
 import request from '@/utils/request'
import { message } from 'ant-design-vue'
import AddOrEditForm from '@/views/gen/templates/addOrEditForm'
import InfoTable from '@/views/gen/templates/infoTable'
import Copy from '@/views/gen/templates/copy'
import moment from 'moment'

message.config({
  duration: 3, // 提示时常单位为s
  top: '40px', // 距离顶部的位置
  maxCount: 3 // 最多显示提示信息条数(后面的会替换前面的提示)
})

export default {
  mounted: function () {
    // 初始化加载分组树
    this.getTemplatesGroupTree()
  },
  name: 'list',
  components: {
    InfoTable,
    STable,
    Ellipsis,
    AddOrEditForm,
    Copy
  },
  methods: {
    onContextMenuClick (treeKey, menuKey) {
      console.log(`treeKey: ${treeKey}, menuKey: ${menuKey}`)
      if (menuKey == 1) {
        this.commonRequest.head.operationTime = Date.now()
        this.bodyById.id = treeKey
        this.commonRequest.body = this.bodyById
        const commonRequest = this.commonRequest
        request({
          url: '/templatesGroup/getById',
          method: 'post',
          dataType: 'json',
          data: commonRequest
        }).then(res => {
          if (res.head.status === 'S') {
            this.initGroupValue = res.body
            this.initGroupValue.name = this.initGroupValue.name + '-copy'
            this.$refs.Copy.show()
          } else {
            message.error(res.head.msg)
          }
        }).catch((err) => {
          console.log(err)
        })
      }
    },
    handleReset () {
      this.queryParam = {}
      this.queryParam.templatesGroupId = null
      this.selectedKeys = []
    },
    // 查询模板分组树
    getTemplatesGroupTree () {
      this.commonRequest.head.operationTime = Date.now()
      const commonRequest = this.commonRequest
      request({
        url: '/templatesGroup/getTemplatesGroupList',
        method: 'post',
        dataType: 'json',
        data: commonRequest
      }).then(res => {
        if (res.head.status === 'S') {
          var a = res.body.map(o => { return { title: o.name, key: o.id } })
          var b = { 'title': '全部模板分组', 'key': '' }
          b.children = a
          this.templatesGroupTree = [b]
        } else {
          message.error(res.head.msg)
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    onExpand (expandedKeys) {
      console.log('onExpand', expandedKeys)
    },
    onSelect (selectedKeys, info) {
      // 调用加载数据
      this.queryParam = {}
      this.queryParam.templatesGroupId = selectedKeys[0]
      this.selectedKeys = selectedKeys
      this.$refs.table.refresh(true)
    },
    refresh () {
      this.$refs.table.refresh(true)
      this.getTemplatesGroupTree()
    },
    handleSearch () {
      this.$refs.table.pagination.pageNo = 1
      this.$refs.table.refresh(true)
    },
    handleAdd () {
      this.initvalue = {}
      this.$refs.AddOrEditForm.show()
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
            url: '/templates/deleteById',
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
        url: '/templates/getById',
        method: 'post',
        dataType: 'json',
        data: commonRequest
      }).then(res => {
        if (res.head.status === 'S') {
          this.initvalue = res.body
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
        url: '/templates/getById',
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
      initGroupValue: {},
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
      templatesGroupTree: [],
      selectedKeys: [],
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        const param = Object.assign({}, parameter, this.queryParam)
        this.commonRequest.head.operationTime = Date.now()
        this.commonRequest.body = param
        const commonRequest = this.commonRequest
        return request({
          url: '/templates/getPage',
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
    width: '10%',
    scopedSlots: { customRender: 'serial' }
  },
  {
    title: '分组名称',
    width: '15%',
    dataIndex: 'templatesGroupName',
    needTotal: true
  },
  {
    title: '模板名称',
    width: '15%',
    dataIndex: 'name',
    scopedSlots: { customRender: 'name' },
    needTotal: true
  },
  {
    title: '创建时间',
    width: '20%',
    dataIndex: 'gmtCreated',
    scopedSlots: { customRender: 'gmtCreated' }
  },
  {
    title: '创建者',
    dataIndex: 'creator',
    width: '15%'
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: '10%',
    scopedSlots: { customRender: 'status' }
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: '15%',
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
