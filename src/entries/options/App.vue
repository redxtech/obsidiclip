<template>
  <n-message-provider :closable="true">
    <OptionsPage />
  </n-message-provider>
</template>

<script setup lang="ts">
import { NMessageProvider } from "naive-ui";
import OptionsPage from "~/components/OptionsPage.vue";
</script>
