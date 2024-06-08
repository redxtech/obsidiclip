import browser from "webextension-polyfill";
import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";
import { genObsidianURI } from "./utils";

// PREFS
// TODO: move to options page

type Bind = {
  key: string;
  mod: string;
  vault: string;
  folder: string;
};

type Prefs = {
  vault: string;
  folder: string;
  binds: Bind[];
};

const prefs: Prefs = {
  vault: "Main",
  folder: "read later",
  binds: [
    {
      key: "l",
      mod: "altKey",
      vault: "Main",
      folder: "read later",
    },
    {
      key: "c",
      mod: "altKey",
      vault: "Main",
      folder: "the collection",
    },
  ],
};

async function clipPage(vault: string, folder: string) {
  const clone = document.cloneNode(true) as Document;
  const reader = new Readability(clone).parse();

  if (!reader) {
    console.error("Failed to parse content");
    return;
  }

  const turndownService = new TurndownService({
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
  });

  const { title, content } = reader;

  const markdown = turndownService.turndown(content);
  const url = genObsidianURI(vault, folder, title, markdown);

  const useTab = false;

  // open in new tab or current tab
  if (useTab) {
    browser.runtime.sendMessage({ action: "openObsidian", url });
  } else {
    window.location.href = url;
  }

  console.log("clipped to obsidian");
}

// listen for messages from the background script
browser.runtime.onMessage.addListener(async (message) => {
  if (message.action === "clipPage") {
    await clipPage(prefs.vault, prefs.folder);
  }
});

// listen for keybinds
for (const bind of prefs.binds) {
  window.addEventListener("keydown", async function (event: KeyboardEvent) {
    // @ts-expect-error - TS doesn't know about the mod property
    if (event[bind.mod] && event.key.toLowerCase() === bind.key) {
      await clipPage(bind.vault, bind.folder);
    }
  });
}
