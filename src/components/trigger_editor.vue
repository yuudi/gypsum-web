<template lang="pug">
h3 事件规则
el-form(v-loading="loading", label-width="80px")
  el-form-item(label="名称")
    el-input.short-input(v-model="trigger.display_name") 
  el-form-item(label="状态")
    el-switch(v-model="trigger.active", active-text="启用", inactive-text="暂停")
  el-form-item(label="群号")
    div(v-if="!trigger.groups_id.length") （所有群）
    el-input(
      v-for="(_, i) in trigger.groups_id",
      :key="i",
      v-model.number="trigger.groups_id[i]",
      placeholder="群号"
    )
    el-button(
      size="mini",
      icon="el-icon-circle-plus-outline",
      @click="trigger.groups_id.push(null)"
    ) 添加
    el-button(
      size="mini",
      icon="el-icon-remove-outline",
      @click="trigger.groups_id.pop()"
    ) 删除
  el-form-item(label="QQ号")
    div(v-if="!trigger.users_id.length") （所有人）
    el-input(
      v-for="(_, i) in trigger.users_id",
      :key="i",
      v-model.number="trigger.users_id[i]",
      placeholder="QQ号"
    )
    el-button(
      size="mini",
      icon="el-icon-circle-plus-outline",
      @click="trigger.users_id.push(null)"
    ) 添加
    el-button(
      size="mini",
      icon="el-icon-remove-outline",
      @click="trigger.users_id.pop()"
    ) 删除
  el-form-item(label="事件类型")
    el-cascader(
      :v-model="trigger.trigger_type",
      :options="event_type_options",
      :props="{ checkStrictly: true }"
    )
  el-form-item(label="回复")
    el-input(
      type="textarea",
      :autosize="{ minRows: 4, maxRows: 20 }",
      placeholder="请输入回复内容",
      v-model="trigger.response"
    )
  el-form-item(label="优先级")
    el-input-number(v-model="trigger.priority", size="small")
  el-form-item(label="阻止后续")
    el-checkbox(v-model="trigger.block") 匹配成功后，不再匹配后续规则
  el-form-item
    el-button(v-if="is_create", type="primary", @click="create") 创建
    el-button(v-else, type="primary", @click="save") 保存
</template>

<script>
import axios from "axios";
import { ElMessage } from "element-plus";

export default {
  name: "TriggerEditor",
  props: {
    trigger_id: {
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
          label: "加群",
          children: [
            {
              value: "add",
              label: "加群请求",
            },
            {
              value: "invite",
              label: "加群邀请",
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
      trigger: {
        display_name: "新规则",
        active: true,
        groups_id: [],
        users_id: [],
        trigger_type: [],
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
        .put("/triggers/" + this.trigger_id, this.trigger)
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
        .post(`/groups/${this.create_in_group}/triggers`, this.trigger)
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
    if (!this.is_create) {
      let thisvue = this;
      axios
        .get("/triggers/" + this.trigger_id)
        .then(function (res) {
          if (res.data.code === undefined) {
            thisvue.trigger = res.data;
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