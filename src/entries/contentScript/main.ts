import browser from "webextension-polyfill";
import { config, genObsidianURI } from "./utils";
import type { Prefs } from "~/types";
import {
  extractPageContentJinaAI,
  extractPageContentReadability,
} from "./content";

// TODO: move to options page
const prefs: Prefs = {
  binds: [
    {
      key: "l",
      mod: "altKey",
      folder: "read later",
    },
    {
      key: "c",
      mod: "altKey",
      folder: "the collection",
    },
  ],
};

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
  (await config("useNewTab"))
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

// listen for keybinds
for (const bind of prefs.binds) {
  window.addEventListener("keydown", async function (event: KeyboardEvent) {
    // @ts-expect-error - TS doesn't know about the mod property
    if (event[bind.mod] && event.key.toLowerCase() === bind.key) {
      // use the vault from the bind if it's set, otherwise use the default
      const vault = bind.vault || (await config("vault"));
      const folder = bind.folder || (await config("folder"));
      await clipPage(vault, folder);
    }
  });
}
