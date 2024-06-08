import browser from "webextension-polyfill";

browser.runtime.onInstalled.addListener(() => {
  console.log("Obsidiclip installed");
});

// listen for clicks on the extension button and
// send a message to the content script in the active tab
browser.browserAction.onClicked.addListener((tab) => {
  if (!tab.id) return;
  browser.tabs.sendMessage(tab.id, { action: "clipPage" });
});

function tabListener(tabId: number, changeInfo: any) {
  console.log("tabListener", tabId, changeInfo);
  if (changeInfo.status === "complete") {
    setTimeout(() => {
      browser.tabs.remove(tabId);
    }, 500);
  }
}

// listen for messages from the content script to
// open a new tab with the obsidian URI
browser.runtime.onMessage.addListener(async (message) => {
  if (message.action === "openObsidian") {
    await browser.tabs.create({ url: message.url });
  }
});
