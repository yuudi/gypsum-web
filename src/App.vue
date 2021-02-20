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
      Administrator
      template(#footer)
        el-button(@click="admin_setting_dialog_visible = false") 关闭
    el-tree(
      :props="tree_props",
      :load="load_group_items",
      draggable,
      :allow-drop="allow_drop",
      :allow-drag="allow_drag",
      @node-drop="handle_drop",
      lazy,
      :key="refresh_key",
      ref="group_tree"
    )
      template(#default="{ node, data }")
        span.item-tree-node(style="cursor: auto")
          span.item-tree-node-text(
            @click="group_item_selected(data)",
            style="cursor: pointer"
          )
            i(:class="item_icon[data.item_type]") {{ data.display_name }}
          span
            i.el-icon-d-caret(
              v-if="data.item_type !== 'group'",
              style="cursor: grab"
            )
            el-button(
              type="text",
              icon="el-icon-delete",
              @click="delete_item(node, data)"
            )
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
          @item-add="group_item_add",
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
import Administrator from "./components/administrator.vue";

export default {
  name: "App",
  components: {
    GroupEditor,
    RuleEditor,
    TriggerEditor,
    JobEditor,
    ResourceEditor,
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
      item_icon: {
        group: "el-icon-folder-opened",
        rule: "el-icon-chat-line-round",
        trigger: "el-icon-bell",
        scheduler: "el-icon-time",
        resource: "el-icon-paperclip",
      },
      item_select: null,
      tree_props: {
        label: "display_name",
        children: "items",
        isLeaf: function (data) {
          return data.item_type !== "group";
        },
      },
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
    load_group_items(node, resolve) {
      if (node.level === 0) {
        return resolve([
          {
            item_type: "group",
            item_id: 0,
            display_name: "root group",
          },
        ]);
      }
      let group_id = node.data.item_id;
      let thisvue = this;
      axios
        .get("/groups/" + group_id)
        .then(function (res) {
          if (res.data.code === undefined) {
            return resolve(res.data.items ?? []);
          } else {
            thisvue.$alert("失败：" + res.data.message);
          }
        })
        .catch(function (error) {
          thisvue.$alert("失败：" + error);
        });
    },
    group_item_selected(data) {
      this.item_select = data;
    },
    allow_drag(node) {
      // 暂时不允许拖动组
      return node.data.item_type !== "group";
    },
    allow_drop(_, drop_node) {
      return drop_node.data.item_type === "group";
    },
    handle_drop(dragging_node, drop_node) {
      let thisvue = this;
      axios
        .put(
          `/groups/${drop_node.data.item_id}/items/${dragging_node.data.item_type}/${dragging_node.data.item_id}`
        )
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
    delete_item(node, data) {
      this.$refs.group_tree.remove(node);
      let config = {};
      if (data.item_type === "group") {
        config.data = { move_to: 0 };
      }
      let thisvue = this;
      axios
        .delete(`/${data.item_type}s/${data.item_id}`, config)
        .then(function (res) {
          if (res.data.code == 0) {
            ElMessage.success("已删除");
          } else {
            thisvue.$alert("失败：" + res.data.message);
          }
        })
        .catch(function (error) {
          thisvue.$alert("失败：" + error);
        });
    },
    group_item_add(item_type, item_id) {
      if (item_type == "job") {
        // 这哪个家伙没有统一命名的……哦是我自己那没事了
        item_type = "scheduler";
      }
      let tree = this.$refs.group_tree;
      tree.append(
        {
          item_type: item_type,
          item_id: item_id,
          display_name: "未命名",
        },
        tree.getCurrentNode()
      );
    },
  },
  created() {
    let thisvue = this;
    axios
      .get("/gypsum/information")
      .then(function (res) {
        if (res.data.code === undefined) {
          thisvue.gypsum.version = res.data.version;
          thisvue.gypsum.commit = res.data.commit;
          thisvue.gypsum.password_salt = res.data.password_salt;
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
.item-tree-node {
  flex: 1;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
.item-tree-node-text {
  padding-top: 8px;
}
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
