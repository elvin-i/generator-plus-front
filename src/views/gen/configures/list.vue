<template>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="配置名称">
                <a-input v-model.trim="queryParam.name" name="name" placeholder=""/>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="状态">
                <a-select mode="multiple" v-model.trim="queryParam.states" placeholder="请选择" default-value="0">
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
      <a-modal
        v-model="visible"
        :destroyOnClose="true"
        :width="400"
        :height="300"
        :visible="visible"
        :title="title"
      >
        <span style="margin-right: 1px;color: black;font-weight: bold">  下载 </span>
        <div style="float: right;"><span style="margin-right: 1px">  {{ text }} </span></div>
        <br/>
        <a-progress :percent="percent" />
        <br/>
        <span style="margin-right: 1px;color: grey">  <ellipsis :length="26" tooltip>文件名 : {{ fileName }}</ellipsis> </span>
        <br/>
        <span style="margin-right: 1px;color: black;font-weight: bold">  解压 </span>
        <div style="float: right;"><span style="margin-right: 1px">  {{ textUnzip }} </span></div>
        <br/>
        <a-progress :percent="percentUnzip" />
        <br/>
        <span style="margin-right: 1px;color: grey">  <ellipsis :length="26" tooltip>目标地址 : {{ targetDictionary }}</ellipsis> </span>
        <template slot="footer">
          <a-button @click="handleClose()"> 朕知道了! </a-button>
        </template>
      </a-modal>
    </a-card>
</template>

<script>
import { STable, Ellipsis } from '@/components'
 import request from '@/utils/request'
import { message } from 'ant-design-vue'
import AddOrEditForm from '@/views/gen/configures/addOrEditForm'
import InfoTable from '@/views/gen/configures/infoTable'
import moment from 'moment'
import { downloadType } from '@/config/commonEums'

message.config({
  duration: 3, // 提示时常单位为s
  top: '40px', // 距离顶部的位置
  maxCount: 3000 // 最多显示提示信息条数(后面的会替换前面的提示)
})

let isgening = false;

export default {
  name: 'List',
  components: {
    InfoTable,
    STable,
    Ellipsis,
    AddOrEditForm
  },
  mounted () {
    window.ipcRenderer.on('common-download-success-callback', (event,type,obj,info) => {
      if (type === downloadType.CONFIGURE_EXECUTE.type) {
       this.text = '下载完成!'
      }
    })
    window.ipcRenderer.on('common-download-ing-callback', (event,type,obj,info) => {
      if (type === downloadType.CONFIGURE_EXECUTE.type) {
        this.visible = true
        this.percent = info
        this.fileName = obj.fileName
      }
    })
    window.ipcRenderer.on('common-download-fail-callback', (event,type,obj,info) => {
      if (type === downloadType.CONFIGURE_EXECUTE.type) {
        this.text = '下载失败!'
      }
    })
    window.ipcRenderer.on('common-unzip-success-callback', (event,type,obj,info) => {
      if (type === downloadType.CONFIGURE_EXECUTE.type) {
        this.percentUnzip = 100
        this.textUnzip = '解压完成!'
        this.targetDictionary = obj.dirLocation
      }
    })
    window.ipcRenderer.on('common-unzip-fail-callback', (event,type,obj,info) => {
      if (type === downloadType.CONFIGURE_EXECUTE.type) {
        this.percentUnzip = 30
        this.textUnzip = info
        this.targetDictionary = obj.dirLocation
      }
    })
  },
  methods: {
    handleClose () {
      this.visible = false
    },
    handleExecute (id) {
      // 下载进度框初始化
      this.percent = 0
      this.percentUnzip = 0
      this.text = '下载中'
      this.textUnzip = '未开始'
      this.visible = false
      this.fileName = 'xx.zip'
      this.targetDictionary = 'xx'
      // 下载进度框初始化
      this.commonRequest.head.operationTime = Date.now()
      this.bodyById.id = id
      this.commonRequest.body = this.bodyById
      const commonRequest = this.commonRequest
      if (isgening) {
        return false
      }
      request({
        url: '/configures/gen',
        method: 'post',
        dataType: 'json',
        data: commonRequest
      }).then(res => {
        isgening = false
        if (res.head.status === 'S') {
          let fileName = res.body.name + Math.random() + '.zip'
          let directory = res.body.dirLocation + '/' + fileName;
          res.body.fileName = fileName
          window.ipcRenderer.send("common-download", {
            url: res.body.zipDownUrl,
            type: downloadType.CONFIGURE_EXECUTE.type,
            obj: res.body,
            directory: directory
          });
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
      percent: 0,
      percentUnzip: 0,
      // create model
      visible: false,
      title: '导出进度',
      text: '下载中',
      textUnzip: '未开始',
      fileName: 'xx.zip',
      targetDictionary: 'xx',
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
    width: '25%',
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
    width: '25%'
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
    width: '25%',
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
