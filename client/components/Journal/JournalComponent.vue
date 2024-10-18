<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["journal"]);
const emit = defineEmits(["editJournal", "refreshJournals"]);
const { currentUsername } = storeToRefs(useUserStore());

const deleteJournal = async () => {
  try {
    await fetchy(`/api/journals`, "DELETE", { query: { journalid: props.journal._id } });
  } catch {
    return;
  }
  emit("refreshJournals");
};

const addUser = async (username: string) => {
  const userId = await fetchy(`/api/users/$username`, "GET");
  await fetchy(`/api/journals/users/${userId._id}`, "GET");
};
</script>

<template>
  <!-- <RouterLink :to="{ name: 'Journal', params: { journal: props.journal } }"></RouterLink> -->
  <h3 class="title">Journal: {{ props.journal.title }}</h3>
  <!-- <h4>Contents: {{ props.journal.objects }}</h4> -->
  <h4>Owner: {{ currentUsername }}</h4>
  <h5># of Entries: {{ props.journal.objects.length }}</h5>
  <!-- <addUserFormComponent @addUser='/> -->
  <button class="button-error btn-small pure-button" @click="deleteJournal">Delete</button>
</template>

<style scoped></style>
