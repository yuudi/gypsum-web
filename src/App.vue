<template>
  <el-container style="height: 98vh">
    <el-aside width="250px">
      <el-button type="text" icon="el-icon-refresh" @click="refresh_key++"
        >刷新
      </el-button>
      <el-tree
        :props="tree_props"
        :load="load_group_items"
        draggable
        :allow-drop="allow_drop"
        :allow-drag="allow_drag"
        @node-drop="handle_drop"
        lazy
        :key="refresh_key"
        ref="group_tree"
      >
        <template #default="{ node, data }">
          <span class="item-tree-node" style="cursor: auto">
            <span
              class="item-tree-node-text"
              @click="group_item_selected(data)"
              style="cursor: pointer"
            >
              <i :class="item_icon[data.item_type]"> </i>
              {{ data.display_name }}
            </span>
            <span>
              <i
                v-if="data.item_type !== 'group'"
                class="el-icon-d-caret"
                style="cursor: grab"
              >
              </i>
              <el-button
                type="text"
                icon="el-icon-delete"
                @click="delete_item(node, data)"
              >
              </el-button>
            </span>
          </span>
        </template>
      </el-tree>
    </el-aside>
    <el-container>
      <el-main>
        <template v-if="item_select === null">
          <el-empty description="选择一个项目开始"> </el-empty>
        </template>
        <template v-else-if="item_select.item_type === 'rule'">
          <RuleEditor :rule_id="item_select.item_id" :key="item_select.item_id">
          </RuleEditor>
        </template>
        <template v-else-if="item_select.item_type === 'trigger'">
          <TriggerEditor
            :trigger_id="item_select.item_id"
            :key="item_select.item_id"
          >
          </TriggerEditor>
        </template>
        <template v-else-if="item_select.item_type === 'scheduler'">
          <JobEditor :job_id="item_select.item_id" :key="item_select.item_id">
          </JobEditor>
        </template>
        <template v-else-if="item_select.item_type === 'resource'">
          <ResourceEditor
            :resource_id="item_select.item_id"
            :key="item_select.item_id"
          >
          </ResourceEditor>
        </template>
        <template v-else-if="item_select.item_type === 'group'">
          <GroupEditor
            :group_id="item_select.item_id"
            @item-add="group_item_add"
            :key="item_select.item_id"
          >
          </GroupEditor>
        </template>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import axios from "axios";
import { ElMessage } from "element-plus";

import GroupEditor from "./components/group_editor.vue";
import JobEditor from "./components/job_editor.vue";
import ResourceEditor from "./components/resource_editor.vue";
import RuleEditor from "./components/rule_editor.vue";
import TriggerEditor from "./components/trigger_editor.vue";

axios.defaults.baseURL = "/api/v1";

export default {
  name: "App",
  components: {
    GroupEditor,
    RuleEditor,
    TriggerEditor,
    JobEditor,
    ResourceEditor,
  },
  data() {
    return {
      refresh_key: 0,
      tree_node_id: 1000,
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
</style>

<style>
.short-input {
  width: 180px;
}
</style>
