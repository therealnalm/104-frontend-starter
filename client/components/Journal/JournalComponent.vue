<script setup lang="ts">
import addUserFormComponent from "@/components/Journal/addUserFormComponent.vue";
import removeUserFormComponent from "@/components/Journal/removeUserFormComponent.vue";
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

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
    owner.value = currentUsername.toString();
  } else {
    owner.value = (await fetchy(`/api/users/id/${props.journal.owner}`, "GET")).username;
  }
});

const addUser = async (username: string) => {
  await fetchy(`/api/journals/users/${username}`, "POST", { query: { journalid: props.journal._id } });
};

const removeUser = async (username: string) => {
  console.log("deleting user:" + username);
  await fetchy(`/api/journals/users/${username}`, "DELETE", { query: { journalid: props.journal._id } });
};

const viewContents = () => {
  void router.push({ name: "Journal", params: { id: props.journal._id } });
};
</script>

<template>
  <body>
    <!-- <RouterLink :to="{ name: 'Journal', params: { journal: props.journal } }"></RouterLink> -->
    <h3 class="title">{{ props.journal.title }}</h3>
    <h4>Owner: {{ owner }}</h4>
    <h5># of Entries: {{ props.journal.objects.length }}</h5>
    <addUserFormComponent v-if="props.journal.title !== 'self'" @addUser="addUser" />
    <removeUserFormComponent v-if="props.journal.title !== 'self'" @remUser="removeUser" />
    <button class="button-error btn-small pure-button" @click="deleteJournal">Delete</button>
    <button class="button btn-medium pure-button" @click="viewContents">View Contents</button>
  </body>
</template>

<style scoped></style>
