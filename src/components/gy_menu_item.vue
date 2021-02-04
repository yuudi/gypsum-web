<template>
  <rule-editor></rule-editor>
  <GroupEditor></GroupEditor>
  <TriggerEditor></TriggerEditor>
  <JobEditor></JobEditor>
  <ResourceEditor></ResourceEditor>
</template>
<script>
import GroupEditor from "./components/group_editor.vue";
import JobEditor from "./components/job_editor.vue";
import ResourceEditor from "./components/resource_editor.vue";
import RuleEditor from "./components/rule_editor.vue";
import TriggerEditor from "./components/trigger_editor.vue";
export default {
  name: "gyMenuItem",
  components: {
    GroupEditor,
    RuleEditor,
    TriggerEditor,
    JobEditor,
    ResourceEditor,
  },

};
</script>