<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { defineProps, onBeforeMount, ref } from "vue";
import CreateJournalForm from "./CreateJournalForm.vue";
import JournalComponent from "./JournalComponent.vue";

const loaded = ref(false);
let journalIds = ref<Array<Record<string, string>>>([]);
let journals = ref<Array<Record<string, string>>>([]);
const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
const props = defineProps(["shared"]);

async function getJournals() {
  let journalIdResults;
  journals.value = [];
  try {
    journalIdResults = await fetchy("/api/journals", "GET");
  } catch (_) {
    return;
  }
  journalIds.value = journalIdResults;
  journals.value = await Promise.all(
    journalIdResults.map(async (id: object) => {
      return (await fetchy(`/api/journals/contents/${id}`, "GET")).journal;
    }),
  );
  const user = await fetchy(`/api/session`, "GET");
  if (props.shared) {
    journals.value = journals.value.filter((journal) => journal.owner.toString() !== user._id.toString());
  } else {
    journals.value = journals.value.filter((journal) => journal.owner.toString() == user._id.toString());
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
  <section v-if="!props.shared">
    <CreateJournalForm @refreshJournals="getJournals" />
  </section>
  <section class="posts" v-if="journals.length !== 0">
    <article v-for="journal in journals" :key="journal._id">
      <JournalComponent :journal="journal" :self-owned="!props.shared" @refreshJournals="getJournals" />
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
