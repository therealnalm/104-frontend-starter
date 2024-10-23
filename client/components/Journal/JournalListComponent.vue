<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import CreateJournalForm from "./CreateJournalForm.vue";
import JournalComponent from "./JournalComponent.vue";

const loaded = ref(false);
let journalIds = ref<Array<Record<string, string>>>([]);
let journals = ref<Array<Record<string, string>>>([]);
const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
let user = ref();

async function getJournals() {
  let journalIdResults;
  journals.value = [];
  try {
    journalIdResults = await fetchy("/api/journals", "GET");
    // console.log(journalIdResults);
    // console.log("test");
  } catch (_) {
    return;
  }
  journalIds.value = journalIdResults;
  for (const id of journalIdResults) {
    const temp = await fetchy(`/api/journals/contents/${id}`, "GET");
    journals.value.push(temp.journal);
  }
}

onBeforeMount(async () => {
  await getJournals();
  loaded.value = true;
  //   user.value = await fetchy(`/api/users/${currentUsername.value}`, "GET");
});

// async function getJournalCont(id) {
//   return await fetchy(`/api/journals/${id}`, "GET");
// }
</script>

<template>
  <section>
    <CreateJournalForm @refreshJournals="getJournals" />
  </section>
  <section class="posts" v-if="journals.length !== 0">
    <article v-for="journal in journals" :key="journal._id">
      <JournalComponent :journal="journal" selfOwned="true" @refreshJournals="getJournals" />
    </article>
  </section>
</template>

<style>
section {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  margin: 0 auto;
  max-width: 60em;
  align-items: center;
  flex-wrap: wrap;
}
.posts {
  padding: 1em;
}
article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}
</style>
