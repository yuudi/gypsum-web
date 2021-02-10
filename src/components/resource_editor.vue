<template>
  <h3>资源</h3>
  <div>
    <el-form inline>
      <el-form-item>
        <el-input v-model="resource.file_name">
          <template #append>{{ resource.ext }}</template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save"> 保存 </el-button>
      </el-form-item>
    </el-form>
  </div>
  <div>
    <template v-if="image_ext.includes(resource.ext)">
      <el-image
        :src="'/api/v1/resources/' + resource_id + '/content'"
        fit="contain"
      >
      </el-image>
    </template>
    <template v-else-if="audio_ext.includes(resource.ext)">
      <audio
        :src="'/api/v1/resources/' + resource_id + '/content'"
        controls
        preload="none"
      >
        浏览器无法在线播放此音频
      </audio>
    </template>
    <template v-else> 无预览 </template>
  </div>
  <div><el-button type="primary" @click="download"> 下载 </el-button></div>
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