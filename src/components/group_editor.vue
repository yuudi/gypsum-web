<template>
  <h3>编辑组</h3>
  <div>
    <el-form inline>
      <el-form-item>
        <el-input v-model="group.display_name" :disabled="group_id === 0">
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save" :disabled="group_id === 0">
          保存
        </el-button>
      </el-form-item>
    </el-form>
  </div>
  <div v-if="group.plugin_version !== 0">
    <p>
      导入的插件：{{ group.plugin_name }}
      <span class="plugin_version_id"> {{ group.plugin_version }} </span>
    </p>
  </div>
  <br /><br />
  <el-form inline>
    <el-form-item>
      <el-input v-model="export_info.plugin_name"> </el-input>
    </el-form-item>
    <el-form-item>
      <el-button @click="export_group"> 导出此组 </el-button>
    </el-form-item>
  </el-form>
  <br /><br />
  <div>
    新增项目
    <el-button type="primary" @click="new_item('rules')"> 消息规则 </el-button>
    <el-button type="primary" disabled> 事件规则 </el-button>
    <el-button type="primary" disabled> 定时任务 </el-button>
    <el-button type="primary" disabled> 静态文件 </el-button>
    <el-button
      type="primary"
      @click="new_item('groups')"
      :disabled="group_id !== 0"
    >
      组
    </el-button>
  </div>
</template>

<script>
import axios from "axios";
import { ElMessage } from "element-plus";

export default {
  name: "GroupEditor",
  props: {
    group_id: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      loading: true,
      export_info: {
        plugin_name: "my new plugin",
      },
      group: {
        display_name: "新组",
        plugin_name: "",
        plugin_version: 0,
        items: [],
      },
    };
  },
  methods: {
    save() {
      let thisvue = this;
      axios
        .patch("/api/v1/groups/" + this.group_id, {
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
    new_item(item_type) {
      let thisvue = this;
      axios
        .post("/api/v1/groups/" + this.group_id + "/" + item_type, {})
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
  },
  created() {
    let thisvue = this;
    axios
      .get("/api/v1/groups/" + this.group_id)
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
  color: #606060;
}
</style>