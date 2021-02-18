<template lang="pug">
el-form
  el-form-item(label="测试类型")
    el-radio(v-model="test_case.debug_type", label="message") 消息
    el-radio(v-model="test_case.debug_type", label="notice") 事件
  el-form-item(label="匹配方式")
    el-select(
      v-model.number="test_case.matcher_type",
      placeholder="请选择",
      :disabled="test_case.debug_type !== 'message'"
    )
      el-option(
        v-for="item in matcher_type_options",
        :key="item.value",
        :label="item.label",
        :value="item.value"
      )
  el-form-item(label="事件")
    span {{ test_case.event.message }}
    el-button(
      type="primary",
      @click="event_editor_dialog_visible = true",
      size="mini"
    ) 编辑
    el-button(
      type="primary",
      @click="json_editor_dialog_visible = true",
      size="mini"
    ) 高级编辑
    el-dialog(title="事件编辑", v-model="event_editor_dialog_visible")
      el-form
        el-form-item(label="接受消息QQ")
          el-input(v-model.number="test_case.event.user_id")
        el-form-item(label="接受消息群号")
          el-input(v-model.number="test_case.event.group_id")
        el-form-item(label="接受消息")
          el-input(v-model="test_case.event.message")
      template(#footer)
        el-button(@click="event_editor_dialog_comfirm") 确定
    el-dialog(title="事件高级编辑", v-model="json_editor_dialog_visible")
      JsonEditor(
        v-model="test_case.event",
        @finish="json_editor_dialog_visible = false"
      )
  el-form-item(label="匹配")
    el-input(
      v-model.number="test_case.pattern",
      placeholder="匹配表达式",
      :disabled="test_case.debug_type !== 'message'"
    )
  el-form-item(label="回复")
    el-input(
      type="textarea",
      :autosize="{ minRows: 4, maxRows: 20 }",
      placeholder="请输入回复内容",
      v-model="test_case.response"
    )
  el-form-item
    el-button(
      type="primary",
      @click="execute_test",
      v-loading="test_result_dialog_loading"
    ) 执行测试
    el-dialog(title="测试结果", v-model="test_result_dialog_visible")
      div {{ test_result.matched === null ? '' : test_result.matched ? '匹配成功' : '匹配失败' }}
      el-card
        div {{ test_result.message }}
      template(#footer)
        el-button(@click="test_result_dialog_visible = false") 关闭
</template>

<script>
import axios from "axios";
import JsonEditor from "./json_editor.vue";

export default {
  name: "TemplateTester",
  components: {
    JsonEditor,
  },
  props: {
    debug_type: {
      type: String,
      default: "message",
    },
    matcher_type: {
      type: Number,
      default: 0,
    },
    pattern: {
      type: String,
      default: "",
    },
    response: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      event_editor_dialog_visible: false,
      json_editor_dialog_visible: false,
      test_result_dialog_visible: false,
      test_result_dialog_loading: false,
      message_event: {
        time: Math.floor(+(new Date() / 1000)),
        self_id: 12345,
        post_type: "message",
        message_type: "group",
        sub_type: "normal",
        message_id: 12345,
        group_id: 12345,
        user_id: 12345,
        anonymous: null,
        message: "hello",
        raw_message: "hello",
        sender: {
          user_id: 12345,
          nickname: "发送者",
          card: "群名片",
          sex: Math.random() < 0.5 ? "male" : "female",
          age: 14,
          area: "shanghai",
          level: "1",
          role: "member",
          title: "头衔",
        },
      },
      notice_event: {
        time: Math.floor(+(new Date() / 1000)),
        self_id: 12345,
        post_type: "notice",
        notice_type: "test",
        sub_type: "test",
        group_id: 12345,
        user_id: 12345,
        operator_id: 12345,
        target_id: 12345,
        duration: 3600,
        message_id: 0,
        honor_type: "talkative",
        comment: "验证信息",
        flag: "test",
      },
      test_case: {
        event: {},
        debug_type: this.debug_type,
        matcher_type: this.matcher_type,
        pattern: this.pattern,
        response: this.response,
      },
      test_result: {
        matched: null,
        message: "",
      },
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
    };
  },
  methods: {
    event_editor_dialog_comfirm() {
      this.test_case.event.raw_message = this.test_case.event.message;
      this.event_editor_dialog_visible = false;
    },
    execute_test() {
      this.test_result_dialog_loading = true;
      let thisvue = this;
      axios
        .post("/debug", this.test_case)
        .then(function (res) {
          if (res.data.code === 0) {
            thisvue.test_result.matched = res.data.matched;
            thisvue.test_result.message = res.data.reply;
          } else {
            thisvue.test_result.matched = null;
            thisvue.test_result.message = res.data.message;
          }
          thisvue.test_result_dialog_loading = false;
          thisvue.test_result_dialog_visible = true;
        })
        .catch(function (error) {
          thisvue.$alert("失败：" + error);
        });
    },
  },
  created() {
    this.test_case.event =
      this.debug_type === "message" ? this.message_event : this.notice_event;
  },
};
</script>