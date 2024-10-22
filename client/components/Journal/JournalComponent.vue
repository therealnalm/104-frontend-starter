<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { fetchy } from "../../utils/fetchy";
import { ref, onBeforeMount } from "vue";
import addUserFormComponent from "@/components/Journal/addUserFormComponent.vue";
import removeUserFormComponent from "@/components/Journal/removeUserFormComponent.vue";

const props = defineProps(["journal", "selfOwned"]);
const emit = defineEmits(["editJournal", "refreshJournals"]);
const { currentUsername } = storeToRefs(useUserStore());
let owner = ref("");

const deleteJournal = async () => {
  try {
    await fetchy(`/api/journals`, "DELETE", { query: { journalid: props.journal._id } });
  } catch {
    return;
  }
  emit("refreshJournals");
};

onBeforeMount(async () => {
  if (props.selfOwned) {
    owner.value = currentUsername;
  } else {
    owner.value = await fetchy(`/api/users/id/${props.journal.owner}`).username;
  }
});

const addUser = async (username: string) => {
  const userId = await fetchy(`/api/users/${username}`, "GET");
  await fetchy(`/api/journals/users/${userId._id}`, "GET");
};

const removeUser = async (username: string) => {
  const userId = await fetchy(`/api/users/${username}`, "GET");
  await fetchy(`/api/journals/users/${userId._id}`, "GET");
};
</script>

<template>
  <body>
    <!-- <RouterLink :to="{ name: 'Journal', params: { journal: props.journal } }"></RouterLink> -->
    <h3 class="title">{{ props.journal.title }}</h3>
    <h4>Owner: {{ owner }}</h4>
    <h5># of Entries: {{ props.journal.objects.length }}</h5>
    <addUserFormComponent @addUser="addUser" />
    <removeUserFormComponent @remUser="removeUser" />
    <button class="button-error btn-small pure-button" @click="deleteJournal">Delete</button>
    <button class="button btn-small pure-button">
      <!-- <RouterLink :to="{ name: 'Journal', params: { id: params.journal._id, journal: params.journal } }"> View Contents </RouterLink> -->
    </button>
  </body>
</template>

<style scoped></style>
