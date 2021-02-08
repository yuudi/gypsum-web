<template>
  <el-container>
    <el-aside width="250px">
      <el-tree
        :props="treeProps"
        :load="load_group_items"
        @node-click="group_item_selected"
        lazy
      >
        <template #default="{ node, data }">
          <span class="item-tree-node">
            <span class="item-tree-node-text">
              <i :class="item_icon[data.item_type]"> </i>
              {{ data.display_name }}
            </span>
            <span>
              <el-button
                type="text"
                icon="el-icon-delete"
                @click="console.log(node, data)"
              >
              </el-button>
            </span>
          </span>
        </template>
      </el-tree>
    </el-aside>
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
        <GroupEditor :group_id="item_select.item_id" :key="item_select.item_id">
        </GroupEditor>
      </template>
    </el-main>
  </el-container>
</template>

<script>
import axios from "axios";

import GroupEditor from "./components/group_editor.vue";
import JobEditor from "./components/job_editor.vue";
import ResourceEditor from "./components/resource_editor.vue";
import RuleEditor from "./components/rule_editor.vue";
import TriggerEditor from "./components/trigger_editor.vue";

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
      item_icon: {
        group: "el-icon-folder-opened",
        rule: "el-icon-chat-line-round",
        trigger: "el-icon-bell",
        scheduler: "el-icon-time",
        resource: "el-icon-paperclip",
      },
      item_select: null,
      treeProps: {
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
        .get("/api/v1/groups/" + group_id)
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
  },
  created() {
    // let thisvue = this;
    // axios
    //   .get("/api/v1/groups/0")
    //   .then(function (res) {
    //     if (res.data.code === undefined) {
    //       thisvue.root_group = res.data;
    //     } else {
    //       thisvue.$alert("失败：" + res.data.message);
    //     }
    //   })
    //   .catch(function (error) {
    //     thisvue.$alert("失败：" + error);
    //   });
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