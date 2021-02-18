<template lang="pug">
el-form
  el-form-item(label="更新")
    el-button(@click="update_dialog_visible = true", type="primary") 更新
    el-dialog(
      title="更新",
      v-model="update_dialog_visible",
      v-loading="update_info_loading"
    )
      div(v-if="update_info.updating") 更新中，请稍等
      div(v-else-if="update_info.message") {{ update_info.message }}
      dev(v-else)
        el-form(inline)
          el-form-item(label="更新版本")
            el-autocomplete(
              v-model="update.new_version",
              :fetch-suggestions="version_suggestions"
            )
          el-form-item(label="下载源")
            el-autocomplete(
              v-model="update.mirror",
              :fetch-suggestions="mirror_suggestions"
            )
      template(#footer)
        el-button(@click="update_dialog_visible = false") 取消
        el-button(
          @click="update_gypsum",
          :disabled="update_info_loading || update_info.updating",
          type="primary"
        ) 更新
</template>

<script>
import axios from "axios";
import { ElMessage } from "element-plus";

export default {
  name: "Administrator",
  data() {
    return {
      update_dialog_visible: false,
      update_info_loading: true,
      update_info: {
        updating: false,
        message: "unknown",
      },
      update: {
        new_version: "stable",
        mirror: "github.com",
        forced_update: false,
      },
    };
  },
  methods: {
    refresh_status() {
      let thisvue = this;
      axios
        .get("/gypsum/update")
        .then(function (res) {
          if (res.data.code === 0) {
            thisvue.update_info.updating = res.data.updating;
            thisvue.update_info.message = res.data.message;
            thisvue.update_info_loading = false;
          } else {
            thisvue.$alert("失败：" + res.data.message);
          }
        })
        .catch(function (error) {
          thisvue.$alert("失败：" + error);
        });
    },
    update_gypsum() {
      let thisvue = this;
      axios
        .put("/gypsum/update", this.update)
        .then(function (res) {
          if (res.data.code === 0) {
            ElMessage.success("已开始更新");
          } else {
            thisvue.$alert("失败：" + res.data.message);
          }
        })
        .catch(function (error) {
          thisvue.$alert("失败：" + error);
        });
    },
    version_suggestions(_, cb) {
      cb([
        { value: "stable", lable: "稳定版" },
        { value: "beta", lable: "预览版" },
      ]);
    },
    mirror_suggestions(_, cb) {
      cb([
        { value: "github.com", lable: "稳定版" },
        { value: "download.fastgit.org", lable: "预览版" },
      ]);
    },
  },
  created() {
    this.refresh_status();
  },
};
</script>