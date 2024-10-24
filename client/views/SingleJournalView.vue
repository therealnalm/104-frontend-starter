<script setup lang="ts">
import postsInJournalComponent from "@/components/Journal/postsInJournalComponent.vue";
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";
import { useRoute } from "vue-router";

interface JournalDoc {
  title: string;
  objects: object[];
}

const route = useRoute();
const journalId = route.params.id.toString();
let journal: JournalDoc;
let title = ref("");
let usernames: object[];
const loaded = ref(false);

async function getJournal() {
  const response = await fetchy(`/api/journals/contents/${journalId}`, "GET");
  journal = response.journal;
  title.value = journal.title;
  const users = await fetchy(`/api/journals/users/${journalId}`, "GET");
  usernames = await Promise.all(
    users.map(async (id: object) => {
      const result = await fetchy(`/api/users/id/${id}`, "GET");
      return result.username;
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
    <h1>{{ title }}</h1>
    Users:
    <div v-for="name in usernames" :key="name.toString()">{{ name }}</div>
    <postsInJournalComponent :journal="journal" />
  </main>
  <h1 v-else>Journal {{ journalId }} loading</h1>
</template>
