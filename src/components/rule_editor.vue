<template>
  <h3>编辑规则</h3>
  <el-form :model="rule" v-loading="loading" label-width="80px">
    <el-form-item label="名称">
      <el-input v-model="rule.display_name"></el-input>
    </el-form-item>
    <el-form-item label="状态">
      <el-switch v-model="rule.active" active-text="启用" inactive-text="暂停">
      </el-switch>
    </el-form-item>
    <el-form-item label="群号">
      <div v-if="!rule.groups_id.length">（所有群）</div>
      <el-input
        v-for="(_, i) in rule.groups_id"
        :key="i"
        v-model.number="rule.groups_id[i]"
        placeholder="群号"
      ></el-input>
      <el-button
        size="mini"
        icon="el-icon-circle-plus-outline"
        @click="rule.groups_id.push(null)"
        >添加
      </el-button>
      <el-button
        size="mini"
        icon="el-icon-remove-outline"
        @click="rule.groups_id.pop()"
        >删除
      </el-button>
    </el-form-item>
    <el-form-item label="QQ号">
      <div v-if="!rule.users_id.length">（所有人）</div>
      <el-input
        v-for="(_, i) in rule.users_id"
        :key="i"
        v-model.number="rule.users_id[i]"
        placeholder="QQ号"
      ></el-input>
      <el-button
        size="mini"
        icon="el-icon-circle-plus-outline"
        @click="rule.users_id.push(null)"
        >添加
      </el-button>
      <el-button
        size="mini"
        icon="el-icon-remove-outline"
        @click="rule.users_id.pop()"
        >删除
      </el-button>
    </el-form-item>
    <el-form-item label="消息类型">
      <el-select v-model.number="rule.message_type" placeholder="请选择">
        <el-option
          v-for="item in message_type_options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        ></el-option>
        <!-- 
          TODO: 得想个办法自定义
        -->
      </el-select>
    </el-form-item>
    <el-form-item label="匹配方式">
      <el-select v-model.number="rule.matcher_type" placeholder="请选择">
        <el-option
          v-for="item in matcher_type_options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="匹配">
      <el-input
        v-for="(_, i) in rule.patterns"
        :key="i"
        v-model.number="rule.patterns[i]"
        placeholder="匹配表达式"
      ></el-input>
      <el-button
        size="mini"
        icon="el-icon-circle-plus-outline"
        @click="rule.patterns.push(null)"
        >添加
      </el-button>
      <el-button
        size="mini"
        icon="el-icon-remove-outline"
        :disabled="rule.patterns.length <= 1"
        @click="rule.patterns.pop()"
        >删除
      </el-button>
    </el-form-item>
    <el-form-item label="仅被at">
      <el-checkbox v-model="rule.only_at_me">仅当被at时触发</el-checkbox>
    </el-form-item>
    <el-form-item label="回复">
      <el-input
        type="textarea"
        :autosize="{ minRows: 4, maxRows: 20 }"
        placeholder="请输入回复内容"
        v-model="rule.response"
      ></el-input>
    </el-form-item>
    <el-form-item label="优先级">
      <el-input-number v-model="rule.priority" size="small"></el-input-number>
    </el-form-item>
    <el-form-item label="阻止后续">
      <el-checkbox v-model="rule.block">
        匹配成功后，不再匹配后续规则
      </el-checkbox>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="save">保存</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import axios from "axios";
import { ElMessage } from "element-plus";

export default {
  name: "RuleEditor",
  props: {
    rule_id: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      loading: true,
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
        .put("/api/v1/rules/" + this.rule_id, this.rule)
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
    if (this.rule_id !== 0) {
      let thisvue = this;
      axios
        .get("/api/v1/rules/" + this.rule_id)
        .then(function (res) {
          if (res.data.code === undefined) {
            thisvue.rule = res.data;
            this.loading = false;
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