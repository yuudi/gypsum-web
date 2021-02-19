<template lang="pug">
h3 消息规则
el-form(:model="rule", v-loading="loading", label-width="80px")
  el-form-item(label="名称")
    el-input.short-input(v-model="rule.display_name") 
  el-form-item(label="状态")
    el-switch(v-model="rule.active", active-text="启用", inactive-text="暂停")
  el-form-item(label="群号")
    div(v-if="!rule.groups_id.length") （所有群）
    el-input(
      v-for="(_, i) in rule.groups_id",
      :key="i",
      v-model.number="rule.groups_id[i]",
      placeholder="群号"
    )
    el-button(
      size="mini",
      icon="el-icon-circle-plus-outline",
      @click="rule.groups_id.push(null)"
    ) 添加
    el-button(
      size="mini",
      icon="el-icon-remove-outline",
      @click="rule.groups_id.pop()"
    ) 删除
  el-form-item(label="QQ号")
    div(v-if="!rule.users_id.length") （所有人）
    el-input(
      v-for="(_, i) in rule.users_id",
      :key="i",
      v-model.number="rule.users_id[i]",
      placeholder="QQ号"
    )
    el-button(
      size="mini",
      icon="el-icon-circle-plus-outline",
      @click="rule.users_id.push(null)"
    ) 添加
    el-button(
      size="mini",
      icon="el-icon-remove-outline",
      @click="rule.users_id.pop()"
    ) 删除
  el-form-item(label="消息类型")
    el-select(v-model.number="rule.message_type", placeholder="请选择")
      el-option(
        v-for="item in message_type_options",
        :key="item.value",
        :label="item.label",
        :value="item.value"
      )
      //- TODO: 得想个办法自定义
  el-form-item(label="匹配方式")
    el-select(
      v-model.number="rule.matcher_type",
      placeholder="请选择",
      @change="handle_matcher_type_changed"
    )
      el-option(
        v-for="item in matcher_type_options",
        :key="item.value",
        :label="item.label",
        :value="item.value"
      )
  el-form-item(label="匹配")
    el-input(
      v-for="(_, i) in rule.patterns",
      :key="i",
      v-model.number="rule.patterns[i]",
      placeholder="匹配表达式"
    )
    el-button(
      size="mini",
      icon="el-icon-circle-plus-outline",
      @click="rule.patterns.push(null)",
      :disabled="rule.matcher_type === 5 && rule.patterns.length >= 1"
    ) 添加
    el-button(
      size="mini",
      icon="el-icon-remove-outline",
      :disabled="rule.patterns.length <= 1",
      @click="rule.patterns.pop()"
    ) 删除
  el-form-item(label="仅被at")
    el-checkbox(v-model="rule.only_at_me") 仅当被at时触发
  el-form-item(label="回复")
    el-input(
      type="textarea",
      :autosize="{ minRows: 4, maxRows: 20 }",
      placeholder="请输入回复内容",
      v-model="rule.response"
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
      TemplateTester(
        debug_type="message",
        :matcher_type="rule.matcher_type",
        :pattern="rule.patterns[0]",
        :response="rule.response"
      )
      template(#footer)
        el-button(@click="debugger_dialog_visible = false") 关闭
  el-form-item(label="优先级")
    el-input-number(v-model="rule.priority", size="small") 
  el-form-item(label="阻止后续")
    el-checkbox(v-model="rule.block") 匹配成功后，不再匹配后续规则
  el-form-item
    el-button(v-if="is_create", type="primary", @click="create") 创建
    el-button(v-else, type="primary", @click="save") 保存
</template>

<script>
import axios from "axios";
import { ElMessage } from "element-plus";

import TemplateTester from "./template_tester.vue";

export default {
  name: "RuleEditor",
  components: { TemplateTester },
  props: {
    rule_id: {
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
      message_type_options: [
        {
          value: 0xff,
          label: "所有",
        },
        {
          value: 0x07,
          label: "所有私聊",
        },
        {
          value: 0xb0,
          label: "所有群聊",
        },
      ],
      matcher_type_options: [
        {
          value: 0,
          label: "完全匹配",
        },
        {
          value: 1,
          label: "关键词匹配",
        },
        {
          value: 2,
          label: "前缀匹配",
        },
        {
          value: 3,
          label: "后缀匹配",
        },
        {
          value: 4,
          label: "命令匹配",
        },
        {
          value: 5,
          label: "正则匹配",
        },
      ],
      rule: {
        display_name: "新规则",
        active: true,
        message_type: 0xff,
        groups_id: [],
        users_id: [],
        matcher_type: 0,
        only_at_me: false,
        patterns: [""],
        response: "",
        priority: 50,
        block: false,
      },
    };
  },
  methods: {
    save() {
      let thisvue = this;
      axios
        .put("/rules/" + this.rule_id, this.rule)
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
        .post(`/groups/${this.create_in_group}/rules`, this.rule)
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
    handle_matcher_type_changed() {
      if (this.rule.matcher_type === 5 && this.rule.patterns.length > 1) {
        this.rule.patterns = [this.rule.patterns[0]];
        ElMessage("正则方式只能有一个匹配");
      }
    },
    open_in_new_window(url) {
      window.open(url);
    },
  },
  created() {
    if (!this.is_create) {
      let thisvue = this;
      axios
        .get("/rules/" + this.rule_id)
        .then(function (res) {
          if (res.data.code === undefined) {
            thisvue.rule = res.data;
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