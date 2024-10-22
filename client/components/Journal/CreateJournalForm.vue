<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { ref } from "vue";

const title = ref("");
const emit = defineEmits(["refreshJournals"]);

const createJournal = async (title: string) => {
  try {
    await fetchy("/api/journals", "POST", { query: { title: title } });
  } catch (_) {
    return;
  }
  emit("refreshJournals");
  emptyForm();
};

const emptyForm = () => {
  title.value = "";
};
</script>

<template>
  <form @submit.prevent="createJournal(title)">
    <label for="title">Journal Title:</label>
    <textarea id="title" v-model="title" placeholder="New Title Here!" required> </textarea>
    <button type="submit" class="pure-button-primary pure-button">Create Journal</button>
  </form>
</template>

<style scoped>
form {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
  width: 33.33vw;
  align-items: center;
}
</style>
