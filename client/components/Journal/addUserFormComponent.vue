<script>
import { ref } from "vue";
const user = ref("");
const emit = defineEmits(["addUser"]);
</script>

<template>
  <h1>addUser!</h1>
  <form @submit.prevent="emit('addUser', user)" class="pure-form">
    <fieldset>
      <legend>Add User to Journal</legend>
      <input id="user" type="text" v-model="user" placeholder="Username" />
      <button type="submit" class="pure-button pure-button-primary">Search</button>
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
