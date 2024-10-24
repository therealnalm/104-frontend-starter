<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { ObjectId } from "mongodb";
import { defineProps, onBeforeMount, ref } from "vue";
import PostComponent from "../Post/PostComponent.vue";

let posts = ref<Array<Record<string, string>>>([]);
const props = defineProps(["journal"]);

async function getPosts() {
  let postResults;
  try {
    console.log("journal: " + props.journal._id);
    postResults = await fetchy("/api/posts/all", "GET", { query: { journalid: props.journal._id } });
  } catch (_) {
    return;
  }
  posts.value = postResults;
}

async function removePost(postId: ObjectId) {
  await fetchy(`/api/journals/entry/${props.journal._id}/${postId}`, "DELETE");
  await getPosts();
}

onBeforeMount(async () => {
  await getPosts();
});
</script>

<template>
  <section v-if="posts.length !== 0" class="posts">
    <article v-for="post in posts" :key="post._id">
      <PostComponent :post="post" :journal="props.journal" @refreshPosts="getPosts" @removePost="removePost" />
    </article>
  </section>
  <h1 v-else>This Journal is Empty!, {{ posts }}</h1>
</template>
