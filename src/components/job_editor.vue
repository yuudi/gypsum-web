<template lang="pug">
h3 定时任务
el-form(v-loading="loading", label-width="80px")
  el-form-item(label="名称")
    el-input.short-input(v-model="job.display_name") 
  el-form-item(label="状态")
    el-switch(v-model="job.active", active-text="启用", inactive-text="暂停")
  el-form-item(label="群号")
    div(v-if="!job.groups_id.length") （所有群）
    div(v-for="(_, i) in job.groups_id")
      el-input.short-input(
        :key="i",
        v-model.number="job.groups_id[i]",
        placeholder="群号"
      )
      el-button(
        size="mini",
        icon="el-icon-remove-outline",
        @click="job.groups_id.splice(i, 1)"
      ) 删除
    el-button(
      size="mini",
      icon="el-icon-circle-plus-outline",
      @click="job.groups_id.push(null)"
    ) 添加
  el-form-item(label="QQ号")
    div(v-if="!job.users_id.length") （所有人）
    div(v-for="(_, i) in job.users_id")
      el-input.short-input(
        :key="i",
        v-model.number="job.users_id[i]",
        placeholder="QQ号"
      )
      el-button(
        size="mini",
        icon="el-icon-remove-outline",
        @click="job.users_id.splice(i, 1)"
      ) 删除
    el-button(
      size="mini",
      icon="el-icon-circle-plus-outline",
      @click="job.users_id.push(null)"
    ) 添加
  el-form-item(label="单次任务")
    el-checkbox(v-model="job.once") 执行一次后自动删除此任务
  el-form-item(label="计划")
    el-switch(
      v-model="cron_advanced_editor",
      inactive-text="简单模式",
      active-text="高级模式"
    )
    div(v-if="cron_advanced_editor")
      el-input.short-input(v-model="job.cron_spec") 
      span {{ cron_discription }}
    div(v-else) 每天
      el-time-picker(
        v-model="cron_time_simple",
        @change="apply_time_pick_value",
        :clearable="false",
        placeholder="选择时间"
      )
  el-form-item(label="内容")
    el-input(
      type="textarea",
      :autosize="{ minRows: 4, maxRows: 20 }",
      placeholder="请输入执行或发送的内容",
      v-model="job.action"
    )
    el-button(
      type="text",
      icon="el-icon-question",
      @click="open_in_new_window('https://github.com/yuudi/gypsum/blob/master/docs/template.md')"
    ) 简介
    el-button(
      type="text",
      icon="el-icon-ship",
      @click="debugger_dialog_visible = true"
    ) 测试
    el-dialog(title="模板测试", v-model="debugger_dialog_visible")
      TemplateTester(debug_type="schedule", :response="job.action")
      template(#footer)
        el-button(@click="debugger_dialog_visible = false") 关闭
  el-form-item
    el-button(v-if="is_create", type="primary", @click="create") 创建
    el-button(v-else, type="primary", @click="save") 保存
</template>

<script>
import axios from "axios";
import { ElMessage } from "element-plus";
import cronstrue from "cronstrue/i18n";

import TemplateTester from "./template_tester.vue";

export default {
  name: "JobEditor",
  components: { TemplateTester },
  props: {
    job_id: {
      type: Number,
      default: 0,
    },
    is_create: {
      type: Boolean,
      default: false,
    },
    create_in_group: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      loading: true,
      debugger_dialog_visible: false,
      cron_advanced_editor: true,
      cron_time_simple: new Date(),
      job: {
        display_name: "新任务",
        active: true,
        groups_id: [],
        users_id: [],
        once: false,
        cron_spec: "0 0 * * *",
        action: "",
      },
    };
  },
  methods: {
    save() {
      let thisvue = this;
      axios
        .put("/jobs/" + this.job_id, this.job)
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
    create() {
      let thisvue = this;
      axios
        .post(`/groups/${this.create_in_group}/jobs`, this.job)
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
    open_in_new_window(url) {
      window.open(url);
    },
    apply_time_pick_value() {
      let m = this.cron_time_simple.getMinutes();
      let h = this.cron_time_simple.getHours();
      this.job.cron_spec = `${m} ${h} * * *`;
    },
  },
  computed: {
    cron_discription() {
      return cronstrue.toString(this.job.cron_spec, {
        use24HourTimeFormat: true,
        locale: "zh_CN",
      });
    },
  },
  created() {
    if (!this.is_create) {
      let thisvue = this;
      axios
        .get("/jobs/" + this.job_id)
        .then(function (res) {
          if (res.data.code === undefined) {
            thisvue.job = res.data;
            thisvue.loading = false;
          } else {
            thisvue.$alert("失败：" + res.data.message);
          }
        })
        .catch(function (error) {
          thisvue.$alert("失败：" + error);
        });
    } else {
      this.loading = false;
    }
  },
};
</script>
