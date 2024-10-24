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
      <h1 v-if="isLoggedIn">Journals shared with {{ currentUsername }}</h1>
      <h1 v-else>Login to see the journals shared with you</h1>
    </section>
    <JournalListComponent :shared="true" />
  </main>
  <HomeBarComponent />
</template>
