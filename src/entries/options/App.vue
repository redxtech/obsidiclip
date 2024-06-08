<template>
  <main>
    <n-h1>Obsidiclip Configuration</n-h1>
    <n-form
      :model="obsidiclipPreferences"
      :rules="rules"
      label-placement="left"
      size="large"
      :show-feedback="false"
    >
      <n-collapse arrow-placement="right" :default-expanded-names="['1', '2']">
        <n-collapse-item title="Obsidian settings" name="1">
          <n-space vertical>
            <n-form-item
              label="Vault"
              path="vault"
              :label-width="obsidianLabelWidth"
            >
              <n-input
                v-model:value="obsidiclipPreferences.vault"
                autosize
                type="text"
                placeholder="Main"
                style="min-width: 8rem"
                @change="handleChange('vault', $event)"
              />
            </n-form-item>
            <n-form-item
              label="Folder"
              path="folder"
              :label-width="obsidianLabelWidth"
            >
              <n-input
                v-model:value="obsidiclipPreferences.folder"
                autosize
                type="text"
                placeholder="Clips"
                style="min-width: 8rem"
                @change="handleChange('folder', $event)"
              />
            </n-form-item>
          </n-space>
        </n-collapse-item>
        <n-collapse-item title="Extension Settings" name="2">
          <n-space vertical>
            <n-form-item
              label="Reader Method"
              path="readerMethod"
              :label-width="extensionLabelWidth"
            >
              <n-radio-group
                v-model:value="obsidiclipPreferences.readerMethod"
                name="readerMethod"
                :on-update:value="
                  (val: ReaderMethod) => {
                    obsidiclipPreferences.readerMethod = val;
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
              path="openInNewTab"
              :label-width="extensionLabelWidth"
            >
              <n-switch
                v-model:value="obsidiclipPreferences.openInNewTab"
                @change="handleChange('openInNewTab', $event)"
              />
            </n-form-item>
          </n-space>
        </n-collapse-item>
      </n-collapse>
    </n-form>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import browser from "webextension-polyfill";
import {
  NH1,
  NCollapse,
  NCollapseItem,
  NForm,
  NFormItem,
  NInput,
  NRadioButton,
  NRadioGroup,
  NSpace,
  NSwitch,
} from "naive-ui";

import { DefaultConfig } from "~/entries/contentScript/utils";
import { ObsidiclipPrefs, ReaderMethod } from "~/types";

// label widths, to keep sections aligned
const obsidianLabelWidth = 60;
const extensionLabelWidth = 120;

// settings
const obsidiclipPreferences = ref<ObsidiclipPrefs>(DefaultConfig);
const rules = {};

// immediately save changes to browser storage
const handleChange = (key: string, value: string) => {
  const newOptions: Record<string, string> = {};
  newOptions[key] = value;

  browser.storage.local.set(newOptions);
};

// load options from browser storage on mount
onMounted(async () => {
  // load options with fallback values
  const options = await browser.storage.local.get(DefaultConfig);

  if (options.vault) obsidiclipPreferences.value.vault = options.vault;
  if (options.folder) obsidiclipPreferences.value.folder = options.folder;
  obsidiclipPreferences.value.readerMethod = options.readerMethod;
  obsidiclipPreferences.value.openInNewTab = options.openInNewTab;
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
