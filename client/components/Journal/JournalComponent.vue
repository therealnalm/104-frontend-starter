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
  emit("refreshPosts");
};
</script>

<template>
  <p class="title">{{ props.journal.title }}</p>
</template>

<style scoped>
p {
  margin: 0em;
}

.author {
  font-weight: bold;
  font-size: 1.2em;
}

.title {
  font-weight: bold;
  font-size: 1.2em;
}

menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
}

.timestamp {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9em;
  font-style: italic;
}

.base {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.base article:only-child {
  margin-left: auto;
}
</style>
