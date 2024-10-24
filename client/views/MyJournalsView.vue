<script setup lang="ts">
import JournalListComponent from "@/components/Journal/JournalListComponent.vue";
import HomeBarComponent from "@/components/Utility/HomeBarComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <section>
      <h1 v-if="isLoggedIn">{{ currentUsername }}'s Journals</h1>
      <h1 v-else>Login to see your Journals</h1>
    </section>
    <JournalListComponent :shared="false" />
  </main>
  <HomeBarComponent />
</template>

<style scoped>
.main {
  padding-bottom: 100px;
  overflow-y: auto;
}
</style>
