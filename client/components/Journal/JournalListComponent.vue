<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import JournalComponent from "./JournalComponent.vue";

const loaded = ref(false);
let journals = ref<Array<Record<string, string>>>([]);
const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

async function getJournals(requester?: string) {
  let journalResults;
  try {
    journalResults = await fetchy("/api/journals", "GET");
  } catch (_) {
    return;
  }
  journals.value = journalResults;
}

onBeforeMount(async () => {
  await getJournals();
  loaded.value = true;
});
</script>

<template>
  <section>
    <RouterLink :to="{ name: 'CreateJournal' }">Create a journal here</RouterLink>
  </section>
  <section class="journals" v-if="loaded && journals.length !== 0">
    <article v-for="journal in journals" : key="journal._id">
      <JournalComponent journal="journal" />
    </article>
  </section>
</template>

<style></style>
