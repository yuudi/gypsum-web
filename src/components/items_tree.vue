<template lang="pug">
el-tree(
  :props="tree_props",
  :load="load_group_items",
  :expand-on-click-node="false",
  :highlight-current="true",
  draggable,
  :allow-drop="allow_drop",
  :allow-drag="allow_drag",
  @node-click="group_item_selected",
  @node-drag-start="dragging = true",
  @node-drag-end="dragging = false",
  @node-drop="handle_drop",
  lazy,
  ref="group_tree"
)
  template(#default="{ node, data }")
    span.item-tree-node(:class="[{ dragging: dragging }, node_class(data)]")
      span.item-tree-node-text
        i(:class="item_icon[data.item_type]") {{ data.display_name }}
      span
        i.el-icon-d-caret(
          v-if="data.item_type !== 'group'",
          style="cursor: grab",
          @click.stop
        )
        el-button(
          v-if="data.item_id !== 0",
          type="text",
          icon="el-icon-delete",
          @click.stop="delete_item(node, data)"
        )
        el-dialog(title="确认删除", v-model="confirm_deletion_dialog_visible")
          div(style="padding-bottom: 20px")
            i.el-icon-warning(style="color: #e6a23c; font-size: 24px")
            template(v-if="deleting_group") 组内的项目会被移动到 root group，
            | 此操作无法撤销
          el-checkbox(v-model="do_not_confirm_deletion") 
            div(style="opacity: 0.7; font-size: 12px") 本次运行不再提醒
          template(#footer)
            el-button(@click="confirm_deletion_dialog_visible = false") 取消
            el-button(type="danger", @click="delete_item_confirm(node, data)") 确认
</template>

<script>
import axios from "axios";
import { ElMessage } from "element-plus";

export default {
  name: "ItemTree",
  props: {
    modelValue: {},
  },
  emits: ["update:modelValue"],
  data() {
    return {
      dragging: false,
      confirm_deletion_dialog_visible: false,
      deleting_group: false, //单独作为变量，否则用 data.item_type 会有抖动
      do_not_confirm_deletion: false,
      tree_props: {
        label: "display_name",
        children: "items",
        isLeaf: function (data) {
          return data.item_type !== "group";
        },
      },
      item_icon: {
        group: "el-icon-folder-opened",
        rule: "el-icon-chat-line-round",
        trigger: "el-icon-bell",
        scheduler: "el-icon-time",
        resource: "el-icon-paperclip",
      },
    };
  },
  methods: {
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
    node_class(data) {
      if (data.item_type !== "group") {
        return "node-leaf";
      } else if (data.item_id === 0) {
        return "node-root";
      } else {
        return "node-branch";
      }
    },
    group_item_selected(data) {
      this.$emit("update:modelValue", data);
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
      if (this.do_not_confirm_deletion) {
        this.delete_item_confirm(node, data);
      } else {
        this.deleting_group = data.item_type === "group";
        this.confirm_deletion_dialog_visible = true;
      }
    },
    delete_item_confirm(node, data) {
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
            thisvue.$refs.group_tree.remove(node);
            thisvue.confirm_deletion_dialog_visible = false;
          } else {
            thisvue.$alert("失败：" + res.data.message);
          }
        })
        .catch(function (error) {
          thisvue.$alert("失败：" + error);
        });
    },
    group_item_add(item_type, item_id, display_name) {
      if (item_type == "job") {
        // 这哪个家伙没有统一命名的……哦是我自己那没事了
        item_type = "scheduler";
      }
      let tree = this.$refs.group_tree;
      tree.append(
        {
          item_type: item_type,
          item_id: item_id,
          display_name: display_name,
        },
        tree.getCurrentNode()
      );
    },
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
.node-leaf.dragging {
  /* 变暗 */
  opacity: 0.1;
}
</style>