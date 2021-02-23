<template lang="pug">
h3 编辑组
div
  el-form(inline, v-loading="loading", @submit.native.prevent)
    el-form-item
      el-input(v-model="group.display_name", :disabled="group_id === 0")
    el-form-item
      el-button(type="primary", @click="save", :disabled="group_id === 0") 保存
div(v-if="group.plugin_version !== 0")
  p 导入的插件：{{ group.plugin_name }}
    span.plugin_version_id version: {{ group.plugin_version }}
br
br
el-form(inline, @submit.native.prevent)
  el-form-item
    el-input(v-model="export_info.plugin_name", :disabled="group_id === 0")
  el-form-item
    el-button(@click="export_group", :disabled="group_id === 0") 导出此组
br
br
div
  el-space(wrap) 新增项目
    el-button(type="primary", @click="new_item('rule')") 消息规则
    el-button(type="primary", @click="new_item('trigger')") 事件规则
    el-button(type="primary", @click="new_item('job')") 定时任务
    el-button(type="primary", @click="create_resource_dialog_visible = true") 静态文件
    el-dialog(title="上传文件", v-model="create_resource_dialog_visible")
      el-upload(
        drag,
        multiple,
        ref="upload_resource_dialog",
        :action="'/groups/' + group_id + '/resources/'",
        :auto-upload="false",
        :http-request="upload_resource_upload",
        style="text-align: center"
      )
        i.el-icon-upload
        div 将文件拖到此处，或
          span(style="color: blue") 点击上传
      template(#footer)
        el-button(@click="create_resource_dialog_visible = false") 关闭
        el-button(type="primary", @click="upload_resource") 导入
    el-button-group
      el-button(
        type="primary",
        @click="create_group_dialog_visible = true",
        :disabled="group_id !== 0"
      ) 创建组
      el-dialog(title="创建组", v-model="create_group_dialog_visible")
        el-form(@submit.native.prevent)
          el-form-item(label="名称")
            el-input(
              v-model="new_group.display_name",
              @keyup.enter="create_group"
            ) 
        template(#footer)
          el-button(@click="create_group_dialog_visible = false") 关闭
          el-button(type="primary", @click="create_group") 创建
      el-button(
        type="primary",
        @click="import_group_dialog_visible = true",
        :disabled="group_id !== 0"
      ) 导入组
      el-dialog(title="导入组", v-model="import_group_dialog_visible")
        el-upload(
          drag,
          multiple,
          ref="import_group_dialog",
          accept=".zip,.gypsum",
          :action="'/groups/' + group_id + '/groups'",
          :auto-upload="false",
          :http-request="import_group_upload",
          style="text-align: center"
        )
          i.el-icon-upload
          div 将文件拖到此处，或
            span(style="color: blue") 点击上传
        template(#footer)
          el-button(@click="import_group_dialog_visible = false") 关闭
          el-button(type="primary", @click="import_group") 导入
</template>

<script>
import axios from "axios";
import { ElMessage } from "element-plus";

export default {
  name: "GroupEditor",
  emits: ["item-add"],
  props: {
    group_id: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      loading: true,
      create_resource_dialog_visible: false,
      create_group_dialog_visible: false,
      import_group_dialog_visible: false,
      new_group: {
        display_name: "新组",
      },
      export_info: {
        plugin_name: "my new plugin",
      },
      group: {
        display_name: "新组",
        plugin_name: "",
        plugin_version: 0,
        items: [],
      },
      defaults: {
        rule: {
          display_name: "新规则",
          active: false,
          message_type: 0xff,
          groups_id: [],
          users_id: [],
          matcher_type: 0,
          only_at_me: false,
          patterns: [""],
          response: "",
          priority: 50,
          block: false,
        },
        trigger: {
          display_name: "新规则",
          active: false,
          groups_id: [],
          users_id: [],
          trigger_type: [""],
          response: "",
          priority: 50,
          block: false,
        },
        job: {
          display_name: "新任务",
          active: false,
          groups_id: [],
          users_id: [],
          once: false,
          cron_spec: "0 0 * * *",
          action: "",
        },
      },
    };
  },
  methods: {
    save() {
      let thisvue = this;
      axios
        .patch("/groups/" + this.group_id, {
          display_name: this.group.display_name,
        })
        .then(function (res) {
          if (res.data.code == 0) {
            ElMessage.success("成功");
          } else {
            thisvue.$alert("失败：" + res.data.message);
          }
        })
        .catch(function (error) {
          thisvue.$alert("失败：" + error);
        });
    },
    export_group() {
      window.open(
        "/api/v1/groups/" +
          this.group_id +
          "/archive?plugin_name=" +
          encodeURIComponent(this.export_info.plugin_name) +
          "&plugin_version=" +
          +new Date()
      );
    },
    upload_resource() {
      this.$refs.upload_resource_dialog.submit();
    },
    upload_resource_upload(data) {
      let thisvue = this;
      axios
        .post(data.action + encodeURIComponent(data.file.name), data.file)
        .then(function (res) {
          if (res.data.code === 0) {
            ElMessage.success("成功");
            thisvue.$emit(
              "item-add",
              "resource",
              res.data.resource_id,
              data.file.name
            );
          } else {
            thisvue.$alert("失败：" + res.data.message);
          }
        })
        .catch(function (error) {
          thisvue.$alert("失败：" + error);
        })
        .finally(function () {});
    },
    create_group() {
      let thisvue = this;
      axios
        .post(`/groups/${this.group_id}/groups`, this.new_group)
        .then(function (res) {
          if (res.data.code == 0) {
            ElMessage.success("成功");
            thisvue.$emit(
              "item-add",
              "group",
              res.data.group_id,
              thisvue.new_group.display_name
            );
            thisvue.create_group_dialog_visible = false;
          } else {
            thisvue.$alert("失败：" + res.data.message);
          }
        })
        .catch(function (error) {
          thisvue.$alert("失败：" + error);
        })
        .finally(function () {
          thisvue.create_group_dialog_visible = false;
        });
    },
    import_group() {
      this.$refs.import_group_dialog.submit();
    },
    import_group_upload(data) {
      if (
        !(data.file.name.endsWith(".zip") || data.file.name.endsWith(".gypsum"))
      ) {
        alert("只能导入 .gypsum 文件");
        return;
      }
      let thisvue = this;
      axios
        .post(data.action, data.file, {
          headers: {
            "Content-Type": "application/zip",
          },
        })
        .then(function (res) {
          if (res.data.code === 0) {
            ElMessage.success("成功");
            thisvue.$emit(
              "item-add",
              "group",
              res.data.group_id,
              res.data.display_name
            );
          } else {
            thisvue.$alert("失败：" + res.data.message);
          }
        })
        .catch(function (error) {
          thisvue.$alert("失败：" + error);
        });
    },
    new_item(item_type) {
      let thisvue = this;
      let new_item_data = this.defaults[item_type];
      axios
        .post(`/groups/${this.group_id}/${item_type}s`, new_item_data)
        .then(function (res) {
          if (res.data.code == 0) {
            ElMessage.success("成功");
            thisvue.$emit(
              "item-add",
              item_type,
              res.data[item_type + "_id"],
              new_item_data.display_name
            );
          } else {
            thisvue.$alert("失败：" + res.data.message);
          }
        })
        .catch(function (error) {
          thisvue.$alert("失败：" + error);
        });
    },
  },
  created() {
    let thisvue = this;
    axios
      .get("/groups/" + this.group_id)
      .then(function (res) {
        if (res.data.code === undefined) {
          thisvue.group = res.data;
          thisvue.loading = false;
        } else {
          thisvue.$alert("失败：" + res.data.message);
        }
      })
      .catch(function (error) {
        thisvue.$alert("失败：" + error);
      });
  },
};
</script>

<style scoped>
.plugin_version_id {
  font-style: italic;
  color: #c0c0c0;
}
</style>