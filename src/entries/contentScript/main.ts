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
  binds: Bind[];
};

const prefs: Prefs = {
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

  const { title, content, byline } = reader;

  const prepend = `# [${title}](${window.location.href})\n\n${byline ? byline + "\n\n" : ""}`;
  const markdown = prepend + turndownService.turndown(content);
  const url = genObsidianURI(vault, folder, title, markdown);

  // open in new tab or current tab
  if ((await browser.storage.local.get("useNewTab")).useNewTab) {
    browser.runtime.sendMessage({ action: "openObsidian", url });
  } else {
    window.location.href = url;
  }

  console.log("clipped to obsidian");
}

// listen for messages from the background script
browser.runtime.onMessage.addListener(async (message) => {
  if (message.action === "clipPage") {
    const vault =
      (await browser.storage.local.get("vault").then((r) => r.vault)) || "Main";
    const folder =
      (await browser.storage.local.get("folder").then((r) => r.folder)) ||
      "read later";

    await clipPage(vault, folder);
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
