<template lang="pug">
el-form
  el-form-item(label="测试类型")
    el-radio-group(
      v-model="test_case.debug_type",
      @change="initial_test_event"
    )
      el-radio-button(label="message") 消息
      el-radio-button(label="notice") 事件
      el-radio-button(label="schedule") 定时
  el-form-item(v-if="test_case.debug_type === 'message'", label="匹配方式")
    el-select(v-model.number="test_case.matcher_type", placeholder="请选择")
      el-option(
        v-for="item in matcher_type_options",
        :key="item.value",
        :label="item.label",
        :value="item.value"
      )
  el-form-item(v-if="test_case.debug_type !== 'schedule'", label="事件")
    span(v-if="test_case.debug_type === 'message'") {{ test_case.event.message }}
    el-button(
      type="primary",
      @click="initial_event_editor_dialog",
      size="mini"
    ) 编辑
    el-button(
      type="primary",
      @click="json_editor_dialog_visible = true",
      size="mini"
    ) 高级编辑
    el-dialog(title="事件编辑", v-model="event_editor_dialog_visible")
      el-form(label-width="120px")
        el-form-item(label="接受消息QQ")
          el-input(v-model.number="test_case.event.user_id")
        el-form-item(label="接受消息群号")
          el-input(v-model.number="test_case.event.group_id")
        el-form-item(v-if="test_case.debug_type === 'message'", label="接受消息")
          el-input(v-model="test_case.event.message")
        el-form-item(v-if="test_case.debug_type === 'notice'", label="接受事件")
          el-cascader(
            v-model="event_type_select",
            :options="event_type_options",
            style="width: 240px"
          )
      template(#footer)
        el-button(@click="event_editor_dialog_comfirm") 确定
    el-dialog(title="事件高级编辑", v-model="json_editor_dialog_visible")
      JsonEditor(
        v-model="test_case.event",
        @finish="json_editor_dialog_visible = false; save_test_event()"
      )
  el-form-item(v-if="test_case.debug_type === 'message'", label="匹配")
    el-input(v-model.number="test_case.pattern", placeholder="匹配表达式")
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
        pre.show-code {{ test_result.message }}
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
      event_type_options: [
        {
          value: "friend",
          label: "加好友请求",
        },
        {
          value: "friend_add",
          label: "好友添加成功",
        },
        {
          value: "group",
          label: "加群请求",
          children: [
            {
              value: "add",
              label: "请求加入群",
            },
            {
              value: "invite",
              label: "邀请加入群",
            },
          ],
        },
        {
          value: "group_upload",
          label: "群文件上传",
        },
        {
          value: "group_admin",
          label: "群管理员变动",
          children: [
            {
              value: "set",
              label: "群管理员新增",
            },
            {
              value: "unset",
              label: "群管理员取消",
            },
          ],
        },
        {
          value: "group_decrease",
          label: "群成员减少",
          children: [
            {
              value: "leave",
              label: "群成员主动退群",
            },
            {
              value: "kick",
              label: "群成员被踢",
            },
            {
              value: "kick_me",
              label: "自己被踢",
            },
          ],
        },
        {
          value: "group_increase",
          label: "群成员增加",
          children: [
            {
              value: "approve",
              label: "管理员同意入群",
            },
            {
              value: "invite",
              label: "管理员邀请入群",
            },
          ],
        },
        {
          value: "group_ban",
          label: "群禁言",
          children: [
            {
              value: "ban",
              label: "群成员被禁言",
            },
            {
              value: "lift_ban",
              label: "群成员被解除禁言",
            },
          ],
        },
        {
          value: "group_recall",
          label: "群消息撤回",
        },
        {
          value: "friend_recall",
          label: "好友消息撤回",
        },
        {
          value: "notify",
          label: "群系统提示",
          children: [
            {
              value: "poke",
              label: "群内戳一戳",
            },
            {
              value: "lucky_king",
              label: "群红包运气王",
            },
            {
              value: "honor",
              label: "群成员荣誉变更",
            },
          ],
        },
        {
          value: "group_card",
          label: "群成员名片更新",
        },
        {
          value: "offline_file",
          label: "接收到离线文件",
        },
        {
          value: "client_status",
          label: "其他客户端在线状态变更",
        },
        {
          value: "essence",
          label: "精华消息",
          children: [
            {
              value: "add",
              label: "精华消息添加",
            },
            {
              value: "delete",
              label: "精华消息移除",
            },
          ],
        },
      ],
      event_type_select: [],
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
      if (this.test_case.debug_type === "notice") {
        // onebot协议的历史包袱
        if (
          this.event_type_select[0] === "friend" ||
          this.event_type_select[0] === "group"
        ) {
          this.test_case.event.post_type = "request";
          this.test_case.event.request_type = this.event_type_select[0];
          delete this.test_case.event.notice_type;
        } else {
          this.test_case.event.post_type = "notice";
          this.test_case.event.notice_type = this.event_type_select[0];
          delete this.test_case.event.request_type;
        }
        this.test_case.event.sub_type = this.event_type_select[1];
      }
      this.test_case.event.raw_message = this.test_case.event.message;
      this.event_editor_dialog_visible = false;
      this.save_test_event();
    },
    execute_test() {
      this.test_result_dialog_loading = true;
      let thisvue = this;
      axios
        .post("/debug", this.test_case)
        .then(function (res) {
          if (res.data.code === 0) {
            thisvue.test_result.matched =
              thisvue.test_case.debug_type === "message"
                ? res.data.matched
                : null;
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
    initial_test_event(test_type) {
      if (test_type === "schedule") {
        this.test_case.event = {};
        return;
      }
      let stored_event_json = localStorage.getItem(
        "gypsum-user-debugger-event-" + test_type
      );
      if (stored_event_json !== null) {
        this.test_case.event = JSON.parse(stored_event_json);
      } else {
        if (test_type === "message") {
          this.test_case.event = this.message_event;
        } else if (test_type === "notice") {
          this.test_case.event = this.notice_event;
        } else {
          console.warn("unknown type " + test_type);
        }
      }
    },
    initial_event_editor_dialog() {
      this.event_type_select[0] = this.test_case.event.notice_type;
      this.event_type_select[1] = this.test_case.event.sub_type;
      this.event_editor_dialog_visible = true;
    },
    save_test_event() {
      localStorage.setItem(
        "gypsum-user-debugger-event-" + this.debug_type,
        JSON.stringify(this.test_case.event)
      );
    },
  },
  created() {
    this.initial_test_event(this.debug_type);
  },
};
</script>

<style scoped>
.show-code {
  line-height: 24px;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>