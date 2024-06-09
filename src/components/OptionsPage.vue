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
      <n-collapse
        arrow-placement="right"
        :default-expanded-names="['1', '2', '3']"
      >
        <n-collapse-item title="Obsidian Settings" name="1">
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
            <n-form-item
              label="Default ModKey"
              path="modifierKey"
              :label-width="extensionLabelWidth"
            >
              <n-select
                v-model:value="obsidiclipPreferences.modifierKey"
                :options="modifierKeyOptions"
                :consistent-menu-width="false"
                style="width: 5rem"
                :on-update:value="
                  (val: ModKey) => {
                    obsidiclipPreferences.modifierKey = val;
                    handleChange('modifierKey', val);
                  }
                "
              />
            </n-form-item>
            <n-form-item
              label="Key"
              path="keybind"
              :label-width="extensionLabelWidth"
            >
              <n-input
                v-model:value="obsidiclipPreferences.keybind"
                type="text"
                placeholder="keypress"
                autosize
                style="min-width: 3rem"
                @change="handleChange('keybind', $event)"
              />
            </n-form-item>
          </n-space>
        </n-collapse-item>
        <n-collapse-item title="Custom Keybinds" name="3">
          <n-space vertical>
            <n-dynamic-input
              v-model:value="obsidiclipPreferences.customBinds"
              :on-create="onCreateBind"
              :on-remove="handleBindChange"
              #="{ index }"
            >
              <div
                :style="{ display: 'flex', alignItems: 'center', gap: '8px' }"
              >
                <n-form-item
                  ignore-path-change
                  :path="`customBinds[${index}].mod`"
                >
                  <n-select
                    v-model:value="obsidiclipPreferences.customBinds[index].mod"
                    :options="modifierKeyOptions"
                    :consistent-menu-width="false"
                    style="width: 5rem"
                    @update:value="handleBindChange()"
                  />
                </n-form-item>
                <Icon size="18" color="#2c3e50">
                  <Add12Filled />
                </Icon>
                <n-form-item
                  ignore-path-change
                  :show-label="false"
                  :path="`customBinds[${index}].key`"
                >
                  <n-input
                    v-model:value="obsidiclipPreferences.customBinds[index].key"
                    type="text"
                    placeholder="keypress"
                    autosize
                    style="min-width: 2.5rem"
                    @change="handleBindChange()"
                  />
                </n-form-item>
                <Icon size="24" color="#2c3e50">
                  <FolderArrowRight20Filled />
                </Icon>
                <n-form-item
                  ignore-path-change
                  :show-label="false"
                  :path="`customBinds[${index}].folder`"
                >
                  <n-input
                    v-model:value="
                      obsidiclipPreferences.customBinds[index].folder
                    "
                    type="text"
                    placeholder="folder"
                    autosize
                    style="min-width: 8rem"
                    @change="handleBindChange()"
                  />
                </n-form-item>
              </div>
            </n-dynamic-input>
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
  NDynamicInput,
  NForm,
  NFormItem,
  NInput,
  NRadioButton,
  NRadioGroup,
  NSelect,
  NSpace,
  NSwitch,
  useMessage,
} from "naive-ui";
import { Icon } from "@vicons/utils";
import Add12Filled from "@vicons/fluent/Add12Filled";
import FolderArrowRight20Filled from "@vicons/fluent/FolderArrowRight20Filled";

import { DefaultConfig } from "~/entries/contentScript/utils";
import { ObsidiclipPrefs, ReaderMethod, ModKey } from "~/types";

// label widths, to keep sections aligned
const obsidianLabelWidth = 60;
const extensionLabelWidth = 120;

// settings
const obsidiclipPreferences = ref<ObsidiclipPrefs>(DefaultConfig);
const rules = {};

const modifierKeyOptions = [
  { label: "Ctrl", value: "ctrlKey" },
  { label: "Alt", value: "altKey" },
  { label: "Shift", value: "shiftKey" },
  { label: "Meta", value: "metaKey" },
];

const message = useMessage();

// immediately save changes to browser storage
const handleChange = (key: string, value: string) => {
  const newOptions: Record<string, string> = {};
  newOptions[key] = value;

  browser.storage.local.set(newOptions);

  message.success("Configuration saved");
};

// default bind creation
const onCreateBind = () => {
  return {
    mod: "altKey",
    key: "",
  };
};

// submit the entire customBinds array to browser storage
// on change, removing the bind at the given index if provided
const handleBindChange = (index?: number) => {
  // deep clone the customBinds array
  const binds = JSON.parse(
    JSON.stringify(obsidiclipPreferences.value.customBinds),
  );

  const newOptions: Partial<ObsidiclipPrefs> = {
    customBinds: index !== undefined ? binds.splice(index, 1) : binds,
  };

  browser.storage.local.set(newOptions);

  message.success("Configuration saved");
};

// load options from browser storage on mount
onMounted(async () => {
  // load options with fallback values
  const options = (await browser.storage.local.get(
    DefaultConfig,
  )) as ObsidiclipPrefs;

  // apply options to reactive state
  if (options) obsidiclipPreferences.value = options;
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
