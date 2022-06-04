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
      <template>
        <div>
          <a-row type="flex">
            <!-- 名称 -->
            <a-col :span="12" style="margin-top: 5px">
              <a-col :span="6" align="right">
                <span>名称:</span>
              </a-col>
              <a-col :span="18" style="padding-left: 10px;">
                <span> {{ initvalue.name }} </span>
              </a-col>
            </a-col>
            <a-col :span="12" style="margin-top: 5px">
              <a-col :span="6" align="right">
                <span>制品:</span>
              </a-col>
              <a-col :span="18" style="padding-left: 10px;">
                <span> {{ (initvalue.url == '' || null) ? '空' : initvalue.url }} </span>
                <div v-if="initvalue.url">
                  <template>
                    <a href="javascript:(0)" @click="handleDown(initvalue.url)">资源导出</a>
                  </template>
                </div>
              </a-col>
            </a-col>
            <!-- 创建者 -->
            <a-col :span="12" style="margin-top: 5px">
              <a-col :span="6" align="right">
                <span>创建者:</span>
              </a-col>
              <a-col :span="18" style="padding-left: 10px;">
                <span> {{ initvalue.creator }} </span>
              </a-col>
            </a-col>
            <!-- 创建时间 -->
            <a-col :span="12" style="margin-top: 5px">
              <a-col :span="6" align="right">
                <span>创建时间:</span>
              </a-col>
              <a-col :span="18" style="padding-left: 10px;">
                <span> {{ gmtDateFormat(initvalue.gmtCreated) }} </span>
              </a-col>
            </a-col>
            <!-- 更新者 -->
            <a-col :span="12" style="margin-top: 5px">
              <a-col :span="6" align="right">
                <span>更新者:</span>
              </a-col>
              <a-col :span="18" style="padding-left: 10px;">
                <span> {{ initvalue.modifier }} </span>
              </a-col>
            </a-col>
            <!-- 更新时间 -->
            <a-col :span="12" style="margin-top: 5px">
              <a-col :span="6" align="right">
                <span>更新时间:</span>
              </a-col>
              <a-col :span="18" style="padding-left: 10px;">
                <span> {{ gmtDateFormat(initvalue.gmtModified) }} </span>
              </a-col>
            </a-col>
            <!-- 备注 -->
            <a-col :span="24" style="margin-top: 5px">
              <a-col :span="3" align="right">
                <span>备注:</span>
              </a-col>
              <a-col :span="21" style="padding-left: 10px;">
                <span> {{ initvalue.remark }} </span>
              </a-col>
            </a-col>
          <!-- row end -->
          </a-row>
        </div>
      </template>
    </div>
    <template slot="footer">
      <a-button @click="handleClose()"> 返回 </a-button>
    </template>
  </a-modal>
</template>
<script>

import moment from 'moment'

const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 16 }
}
export default {
  methods: {
    getTitle (initvalue) {
      return <span> 详情</span>
    },
    show () {
      this.visible = true
    },
    handleClose () {
      this.visible = false
    },
    gmtDateFormat (text) {
      return moment(text).format('yyyy-MM-DD HH:mm:ss')
    },
    handleDown (url) {
      const headers = {}
      headers[process.env.VUE_APP_AUTHORIZATION_HEADER_KEY] = this.getCookie(process.env.VUE_APP_AUTHORIZATION_COOKIE_KEY)
      headers[process.env.VUE_APP_BUUKLE_APP_ID_KEY] = process.env.VUE_APP_BUUKLE_APP_ID
      fetch(url, {
        method: 'GET',
        headers: headers
      }).then(res => res.blob()).then(data => {
          const blobUrl = window.URL.createObjectURL(data)
          const a = document.createElement('a')
          a.href = blobUrl
          a.click()
        })
    },
    getCookie (cname) {
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
  },
  props: {
    initvalue: {
      type: Object, // 类型
      default: null // 默认值
    }
  },
  data () {
    return {
      visible: false,
      formItemLayout
    }
  }
}
</script>
