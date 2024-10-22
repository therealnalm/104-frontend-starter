<script setup lang="ts">
import { useToastStore } from "@/stores/toast";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { useRoute } from "vue-router";

const currentRoute = useRoute();
const currentRouteName = computed(() => currentRoute.name);
const userStore = useUserStore();
const { isLoggedIn } = storeToRefs(userStore);
const { toast } = storeToRefs(useToastStore());

// Make sure to update the session before mounting the app in case the user is already logged in
</script>

<template>
  <header>
    <footer>
      <div class="bottomBar">
        <RouterLink :to="{ name: 'SharedJournals' }">
          <img src="../../assets/images/threeBooks.svg" />
        </RouterLink>

        <RouterLink :to="{ name: 'MyJournals' }">
          <img src="../../assets/images/journal.svg" />
        </RouterLink>

        <RouterLink v-if="isLoggedIn" :to="{ name: 'Settings' }">
          <img src="../../assets/images/settings.svg" />
        </RouterLink>

        <RouterLink v-else :to="{ name: 'Login' }"> Login </RouterLink>
      </div>
    </footer>
  </header>
</template>

<style scoped>
.bottomBar {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 100px;
  background-color: #333;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  padding: 10px 0;
}

img {
  width: 70px;
  height: 70px;
}
</style>
