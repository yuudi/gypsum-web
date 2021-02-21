<template lang="pug">
el-card(style="margin: auto 20%")
  template(#header)
    .card-header
      span 
        a.github-button(
          href="https://github.com/yuudi/gypsum",
          data-size="large",
          data-show-count="true",
          aria-label="Star pcrbot/gypsum on GitHub"
        ) gypsum
      el-button(@click="update_dialog_visible = true", type="text") 更新
  div 版本 {{ information.version }}
  div 编号 {{ information.commit }}
  div 平台 {{ information.platform }}
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
  props: {
    information: { type: Object, required: true },
  },
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
            thisvue.update_info.updating = true;
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
      cb([{ value: "stable" }, { value: "beta" }]);
    },
    mirror_suggestions(_, cb) {
      cb([{ value: "github.com" }, { value: "download.fastgit.org" }]);
    },
  },
  created() {
    this.refresh_status();
    let github_buttons_script = document.createElement("script");
    github_buttons_script.setAttribute(
      "src",
      "https://cdn.jsdelivr.net/npm/github-buttons@2.14.2/dist/buttons.min.js"
    );
    document.head.appendChild(github_buttons_script);
  },
};
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>