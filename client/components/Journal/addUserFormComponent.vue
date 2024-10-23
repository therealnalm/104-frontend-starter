<script setup lang="ts">
import { defineEmits, ref } from "vue";

const user = ref("");
const emit = defineEmits(["addUser"]);
</script>

<template>
  <form @submit.prevent="emit('addUser', user)" class="pure-form">
    <fieldset>
      <legend>Add User to Journal</legend>
      <input id="user" type="text" v-model="user" placeholder="Username" />
      <button type="submit" class="pure-button pure-button-primary">Submit</button>
    </fieldset>
  </form>
</template>

<style scoped>
form {
  display: flex;
  gap: 0.5em;
  padding: 1em;
  align-items: center;
}
</style>
