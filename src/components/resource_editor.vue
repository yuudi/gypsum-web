<template lang="pug">
h3 资源
div
  el-form(inline, v-loading="loading")
    el-form-item
      el-input(v-model="resource.file_name")
        template(#append) {{ resource.ext }}
    el-form-item
      el-button(type="primary", @click="save") 保存
div
  template(v-if="image_ext.includes(resource.ext)")
    el-image(
      :src="'/api/v1/resources/' + resource_id + '/content'",
      fit="contain"
    )
  template(v-else-if="audio_ext.includes(resource.ext)")
    audio(
      :src="'/api/v1/resources/' + resource_id + '/content'",
      controls,
      preload="none"
    ) 浏览器无法在线播放此音频
  template(v-else) 无预览
div
  span.copy_bar_label 资源编号：
  el-input(
    :value="resource_name",
    ref="pongo_id",
    readonly,
    style="width: 400px"
  )
  el-button(icon="el-icon-copy-document", @click="copy_ref('pongo_id')") 复制
div
  span.copy_bar_label 资源路径：
  el-input(
    :value="resource_path",
    ref="pongo_path",
    readonly,
    style="width: 400px"
  )
  el-button(icon="el-icon-copy-document", @click="copy_ref('pongo_path')") 复制
div
  span.copy_bar_label 资源引用：
  el-input(
    :value="resource_ref",
    ref="pongo_ref",
    readonly,
    style="width: 400px"
  )
  el-button(icon="el-icon-copy-document", @click="copy_ref('pongo_ref')") 复制
div
  el-button(type="primary", @click="download") 下载
</template>

<script>
import axios from "axios";
import { ElMessage } from "element-plus";

export default {
  name: "ResourceEditor",
  props: {
    resource_id: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      loading: true,
      image_ext: [".jpg", ".jpeg", ".png", ".gif", ".bmp"],
      audio_ext: [".mp3", ".wav", ".flac", ".silk"],
      resource: {
        file_name: "新文件",
        ext: "",
        sha256_sum: "",
      },
    };
  },
  computed: {
    resource_ref() {
      return 'res("' + this.resource.sha256_sum + this.resource.ext + '")';
    },
    resource_path() {
      return '"resources/' + this.resource.sha256_sum + this.resource.ext + '"';
    },
    resource_name() {
      return this.resource.sha256_sum + this.resource.ext;
    },
  },
  methods: {
    save() {
      let thisvue = this;
      axios
        .patch("/resources/" + this.resource_id, {
          file_name: this.resource.file_name,
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
    copy_ref(ref) {
      this.$refs[ref].select();
      document.execCommand("copy");
      ElMessage.success("已复制");
    },
    download() {
      window.open("/api/v1/resources/" + this.resource_id + "/content");
    },
  },
  created() {
    let thisvue = this;
    axios
      .get("/resources/" + this.resource_id)
      .then(function (res) {
        if (res.data.code === undefined) {
          thisvue.resource = res.data;
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
.copy_bar_label {
  width: 90px;
  display: inline-block;
}
</style>