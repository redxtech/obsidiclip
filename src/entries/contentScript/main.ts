import browser from "webextension-polyfill";

import {
  DefaultConfig,
  config,
  genObsidianURI,
} from "~/entries/contentScript/utils";
import {
  extractPageContentJinaAI,
  extractPageContentReadability,
} from "~/entries/contentScript/content";

import type { Bind } from "~/types";

// main function to clip the page
async function clipPage(vault: string, folder: string) {
  const readerMethod = await config("readerMethod");
  let content;

  // get the content based on the reader method
  switch (readerMethod) {
    case "readability":
      content = extractPageContentReadability(document);
      break;
    case "r.jina.ai":
      content = await extractPageContentJinaAI(window.location.href);
      break;
    default:
      console.error("Invalid reader method");
      return;
  }

  if (!content) {
    console.error("Failed to extract page content");
    return;
  }

  const { title, markdown } = content;
  const url = genObsidianURI(vault, folder, title, markdown);

  // open in new tab or current tab
  (await config("openInNewTab"))
    ? browser.runtime.sendMessage({ action: "openObsidian", url })
    : (window.location.href = url);

  console.log("clipped to obsidian");
}

// listen for messages from the background script
browser.runtime.onMessage.addListener(async (message) => {
  if (message.action === "clipPage") {
    const vault = await config("vault");
    const folder = await config("folder");

    await clipPage(vault, folder);
  }
});

// get list of all binds, and listen for them
browser.storage.local.get(DefaultConfig).then((options) => {
  // combine the default binds with any custom binds
  const allBinds: Bind[] = [
    {
      mod: options.modifierKey,
      key: options.keybind,
    },
    ...options.customBinds,
  ];

  // listen for keybinds
  for (const bind of allBinds) {
    window.addEventListener("keydown", async function (event: KeyboardEvent) {
      if (event[bind.mod] && event.key.toLowerCase() === bind.key) {
        // use the vault from the bind if it's set, otherwise use the default
        const vault = bind.vault || (await config("vault"));
        const folder = bind.folder || (await config("folder"));
        await clipPage(vault, folder);
      }
    });
  }
});
