<script setup lang="ts">
import JournalListComponent from "@/components/Journal/JournalListComponent.vue";
import HomeBarComponent from "@/components/Utility/HomeBarComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { ref } from "vue";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

const isMenuVisible = ref(false);
function showMenu() {
  isMenuVisible.value = true;
}

function hideMenu() {
  isMenuVisible.value = false;
}
</script>

<template>
  <main>
    <section>
      <div class="dropdown" @mouseenter="showMenu" @mouseleave="hideMenu">
        <!-- Button to trigger the menu -->
        <button class="dropdown-btn"><img src="@/assets/images/plus.svg" /></button>

        <!-- Menu that shows up on hover -->
        <ul v-show="isMenuVisible" class="dropdown-menu">
          <li>Make new post button goes here</li>
        </ul>
      </div>
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

.dropdown {
  display: flex;
  margin-left: 0;
}
</style>
