<template>
  <main>
    <n-h1>Obsidiclip Configuration</n-h1>
    <n-collapse arrow-placement="right" :default-expanded-names="['1', '2']">
      <n-collapse-item title="Obsidian settings" name="1">
        <n-space vertical>
          <n-form-item
            label="Vault"
            size="large"
            label-placement="left"
            :label-width="obsidianLabelWidth"
            :show-feedback="false"
          >
            <n-input
              v-model:value="vault"
              autosize
              type="text"
              placeholder="Main"
              style="min-width: 8rem"
              @change="handleChange('vault', $event)"
            />
          </n-form-item>
          <n-form-item
            label="Folder"
            size="large"
            label-placement="left"
            :label-width="obsidianLabelWidth"
            :show-feedback="false"
          >
            <n-input
              v-model:value="folder"
              autosize
              type="text"
              placeholder="Clips"
              style="min-width: 8rem"
              @change="handleChange('folder', $event)"
            />
          </n-form-item>
        </n-space>
      </n-collapse-item>
      <n-collapse-item
        title="Extension Settings"
        name="2"
        :style="{ fontSize: '2rem' }"
      >
        <n-space vertical>
          <n-form-item
            label="Reader Method"
            size="large"
            label-placement="left"
            :label-width="extensionLabelWidth"
            :show-feedback="false"
          >
            <n-radio-group
              v-model:value="readerMethod"
              name="readerMethod"
              :on-update:value="
                (val: ReaderMethod) => {
                  readerMethod = val;
                  handleChange('readerMethod', val);
                }
              "
            >
              <n-radio-button value="readability">
                readability.js
              </n-radio-button>
              <n-radio-button value="r.jina.ai"> r.jina.ai </n-radio-button>
            </n-radio-group>
          </n-form-item>
          <n-form-item
            label="Use New Tab"
            size="large"
            label-placement="left"
            :label-width="extensionLabelWidth"
            :show-feedback="false"
          >
            <n-switch
              v-model:value="openInNewTab"
              @change="handleChange('openInNewTab', $event)"
              size="large"
            />
          </n-form-item>
        </n-space>
      </n-collapse-item>
    </n-collapse>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import browser from "webextension-polyfill";
import {
  NH1,
  NCollapse,
  NCollapseItem,
  NFormItem,
  NInput,
  NRadioButton,
  NRadioGroup,
  NSpace,
  NSwitch,
} from "naive-ui";

import { ReaderMethod } from "~/types";

// label widths, to keep sections aligned
const obsidianLabelWidth = 60;
const extensionLabelWidth = 120;

// obsidian settings
const vault = ref<string | null>(null);
const folder = ref<string | null>(null);

// extension settings
const readerMethod = ref<ReaderMethod | null>(null);
const openInNewTab = ref<boolean>(false);

// immediately save changes to browser storage
const handleChange = (key: string, value: string) => {
  const newOptions: Record<string, string> = {};
  newOptions[key] = value;

  browser.storage.local.set(newOptions);
};

// load options from browser storage on mount
onMounted(async () => {
  // load options with fallback values
  const options = await browser.storage.local.get({
    vault: null,
    folder: null,
    readerMethod: "readability",
    openInNewTab: false,
  });

  if (options.vault) vault.value = options.vault;
  if (options.folder) folder.value = options.folder;
  readerMethod.value = options.readerMethod as ReaderMethod;
  openInNewTab.value = options.openInNewTab;
});
</script>

<style>
main {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  padding: 2rem;
}

.n-collapse-item__header-main {
  font-size: 1.4rem;
}
</style>
