<script>
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const userStore = useUserStore();
const { isLoggedIn } = storeToRefs(userStore);
</script>

<template>
  <header>
    <home>
      <div>
        <RouterLink :to="{ name: 'SharedJournals' }">
          <img src="../../assets/images/threeBooks.svg" />
        </RouterLink>
      </div>
      <div>
        <RouterLink :to="{ name: 'MyJournals' }">
          <img src="../../assets/images/threeBooks.svg" />
        </RouterLink>
      </div>
      <div v-if="isLoggedIn">
        <RouterLink :to="{ name: 'Settings' }">
          <img src="../../assets/images/threeBooks.svg" />
        </RouterLink>
      </div>
      <div v-else>
        <RouterLink :to="{ name: 'Settings' }">
          <img src="../../assets/images/threeBooks.svg" />
        </RouterLink>
      </div>
    </home>
  </header>
</template>

<style scoped>
home {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
}
</style>
