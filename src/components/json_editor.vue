<template lang="pug">
el-form(@submit.native.prevent)
  el-form-item
    el-input(
      type="textarea",
      :autosize="{ minRows: 4, maxRows: 20 }",
      v-model="json_body",
      @keyup.ctrl.enter="apply_json_body"
    )
  el-form-item
    el-button(@click="save_json_body") 存档
    el-button(@click="load_json_body") 读档
    el-button(type="primary", @click="apply_json_body") 确定 (Ctrl+Enter)
</template>

<script>
export default {
  name: "JsonEditor",
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
  },
  emits: ["update:modelValue", "finish"],
  data() {
    return {
      json_body: JSON.stringify(this.modelValue, null, 4),
    };
  },
  watch: {
    modelValue: {
      handler(newValue) {
        this.json_body = JSON.stringify(newValue, null, 4);
      },
      deep: true,
    },
  },
  methods: {
    save_json_body() {
      //TODO
      this.$alert("未完成");
    },
    load_json_body() {
      //TODO
      this.$alert("未完成");
    },
    apply_json_body() {
      try {
        this.$emit("update:modelValue", JSON.parse(this.json_body));
        this.$emit("finish");
      } catch (error) {
        this.$alert("json解析错误：" + error);
      }
    },
  },
};
</script>