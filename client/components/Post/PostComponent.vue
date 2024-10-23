<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["post", "journal"]);
console.log(props.journal);
const emit = defineEmits(["editPost", "refreshPosts", "removePost", "addToJournal"]); //consider removing edit Post functionality
const { currentUsername } = storeToRefs(useUserStore());
let journalAddTitle = ref("");
let journalAddAuthor = ref("");

const deletePost = async () => {
  try {
    await fetchy(`/api/posts/${props.post._id}`, "DELETE");
    console.log("success");
  } catch {
    return;
  }
  emit("refreshPosts");
};

async function addToJournal() {
  console.log(journalAddTitle.value);
  await fetchy(`/api/journals/${journalAddTitle.value}`, "PATCH", { query: { ownerUsername: journalAddAuthor.value, entryid: props.post._id } });
}
</script>

<template>
  <p class="author">{{ props.post.author }}</p>
  <p>{{ props.post.content }}</p>
  <div class="base">
    <menu v-if="props.post.author == currentUsername">
      <!-- <li><button class="btn-small pure-button" @click="emit('editPost', props.post._id)">Edit</button></li> -->
      <li><button class="button-error btn-small pure-button" @click="deletePost">Delete</button></li>
      <li>
        <button v-if="props.journal && props.journal.title !== 'self'" class="button-error btn-small pure-button" @click="emit('removePost', props.post._id)">Remove from Journal</button>
      </li>
    </menu>
    <article class="timestamp">
      <p v-if="props.post.dateCreated !== props.post.dateUpdated">Edited on: {{ formatDate(props.post.dateUpdated) }}</p>
      <p v-else>Created on: {{ formatDate(props.post.dateCreated) }}</p>
    </article>
  </div>
  <div class="base">
    <menu v-if="props.post.author == currentUsername">
      <legend>Add to journal:</legend>
      <input id="journalAddTitle" type="text" v-model="journalAddTitle" placeholder="Journal Title" />
      <input id="journalAddAuthor" type="text" v-model="journalAddAuthor" placeholder="Journal Author" />
      <button type="submit" class="pure-button pure-button-primary" @click="addToJournal">Add</button>
    </menu>
  </div>
  <div class="base"></div>
</template>

<style scoped>
p {
  margin: 0em;
}

.author {
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
