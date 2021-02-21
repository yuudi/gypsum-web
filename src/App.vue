<template lang="pug">
el-dialog(
  title="登录",
  v-model="login_dialog_visible",
  :close-on-click-modal="false",
  :close-on-press-escape="false",
  :show-close="false"
)
  el-form(@submit.native.prevent)
    el-form-item(
      label="密码",
      placeholder="请输入密码",
      show-password,
      @keyup.enter="start_login"
    )
      el-input(v-model="password_input")
  template(#footer)
    el-button(
      type="primary",
      v-loading="login_loading",
      :disabled="password_input === ''",
      @click="start_login"
    ) 登录 (Enter)
el-container(style="height: 98vh")
  el-aside.left-aside
    p gypsum v{{ gypsum.version }}
    el-button(type="text", icon="el-icon-refresh", @click="refresh_key++") 刷新
    el-button(
      type="text",
      icon="el-icon-setting",
      @click="admin_setting_dialog_visible = true"
    ) 设置
    el-dialog(v-model="admin_setting_dialog_visible")
      Administrator(:information="gypsum")
      template(#footer)
        el-button(@click="admin_setting_dialog_visible = false") 关闭
    ItemTree(v-model="item_select", ref="item_tree", :key="refresh_key")
  el-container
    el-main
      template(v-if="item_select === null")
        el-empty(description="选择一个项目开始") 
      template(v-else-if="item_select.item_type === 'rule'")
        RuleEditor(:rule_id="item_select.item_id", :key="item_select.item_id")
      template(v-else-if="item_select.item_type === 'trigger'")
        TriggerEditor(
          :trigger_id="item_select.item_id",
          :key="item_select.item_id"
        )
      template(v-else-if="item_select.item_type === 'scheduler'")
        JobEditor(:job_id="item_select.item_id", :key="item_select.item_id")
      template(v-else-if="item_select.item_type === 'resource'")
        ResourceEditor(
          :resource_id="item_select.item_id",
          :key="item_select.item_id"
        )
      template(v-else-if="item_select.item_type === 'group'")
        GroupEditor(
          :group_id="item_select.item_id",
          @item-add="$refs.item_tree.group_item_add",
          :key="item_select.item_id"
        )
</template>

<script>
import sha256 from "crypto-js/sha256";
import axios from "axios";
import { ElMessage } from "element-plus";

import GroupEditor from "./components/group_editor.vue";
import JobEditor from "./components/job_editor.vue";
import ResourceEditor from "./components/resource_editor.vue";
import RuleEditor from "./components/rule_editor.vue";
import TriggerEditor from "./components/trigger_editor.vue";
import ItemTree from "./components/items-tree.vue";
import Administrator from "./components/administrator.vue";

export default {
  name: "App",
  components: {
    GroupEditor,
    RuleEditor,
    TriggerEditor,
    JobEditor,
    ResourceEditor,
    ItemTree,
    Administrator,
  },
  data() {
    return {
      gypsum: {
        version: "unknown",
        commit: "unknown",
        password_salt: "",
      },
      password_input: "",
      login_loading: false,
      admin_setting_dialog_visible: false,
      login_dialog_visible: false,
      refresh_key: 0,
      item_select: null,
    };
  },
  methods: {
    start_login() {
      this.login_loading = true;
      let password_hashed = String(
        sha256(this.password_input + this.gypsum.password_salt)
      );
      let thisvue = this;
      axios
        .put("/gypsum/login", { password: password_hashed })
        .then(function (res) {
          if (res.data.code === 0) {
            thisvue.login_dialog_visible = false;
            thisvue.login_loading = false;
            ElMessage.success("登录成功");
          } else {
            thisvue.login_loading = false;
            thisvue.$alert("登录失败：" + res.data.message);
          }
        })
        .catch(function (error) {
          thisvue.login_loading = false;
          thisvue.$alert("失败：" + error);
        });
    },
  },
  created() {
    let thisvue = this;
    axios
      .get("/gypsum/information")
      .then(function (res) {
        if (res.data.code === undefined) {
          thisvue.gypsum = res.data;
          if (res.data.logged_in === false) {
            thisvue.login_dialog_visible = true;
          }
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
.left-aside {
  width: 250px;
  border-right-style: solid;
  border-color: rgba(0, 0, 0, 0.1);
  border-width: 1px;
}
</style>

<style>
.short-input {
  width: 180px;
  margin-right: 10px;
}

.long-input {
  width: 80vh;
  margin-right: 10px;
}
</style>
