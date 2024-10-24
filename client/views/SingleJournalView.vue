<script setup lang="ts">
import postsInJournalComponent from "@/components/Journal/postsInJournalComponent.vue";
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const journalId = route.params.id.toString();
let journal: object;
let usernames: object[];
const loaded = ref(false);

async function getJournal() {
  console.log("hello" + journalId);
  const response = await fetchy(`/api/journals/contents/${journalId}`, "GET");
  journal = response.journal;
  console.log("continuing");
  const users = await fetchy(`/api/journals/users/${journalId}`, "GET");
  usernames = await Promise.all(
    users.map(async (id) => {
      return (await fetchy(`/api/users/id/${id}`, "GET")).username;
    }),
  );
  loaded.value = true;
}

onBeforeMount(async () => {
  await getJournal();
});
</script>

<template>
  <main v-if="loaded">
    <h1>{{ journal.title }}</h1>
    Users:
    <div v-for="name in usernames" :key="name">{{ name }}</div>
    <postsInJournalComponent :journal="journal" />
  </main>
  <h1 v-else>Journal {{ journalId }} loading</h1>
</template>
