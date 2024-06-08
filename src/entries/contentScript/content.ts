import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";

import type { PageContent } from "~/types";

function processMarkdown(
  markdown: string,
  title: string,
  url: string,
  byline?: string,
) {
  const prepend = `# [${title}](${url})\n\n${byline ? byline + "\n\n" : ""}`;
  return prepend + markdown;
}

export function extractPageContentReadability(
  document: Document,
): PageContent | undefined {
  const clone = document.cloneNode(true) as Document;
  // TODO: add some configuration options
  const reader = new Readability(clone).parse();

  if (!reader) {
    console.error("Failed to parse content");
    return;
  }

  // TODO: add some configuration options
  const turndownService = new TurndownService({
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
  });

  const { title, content, byline } = reader;

  const markdown = processMarkdown(
    turndownService.turndown(content),
    title,
    window.location.href,
    byline,
  );

  return {
    title,
    markdown,
  };
}

export async function extractPageContentJinaAI(
  url: string,
): Promise<PageContent | undefined> {
  const fetchURL = "https://r.jina.ai/" + url;

  try {
    const result = await fetch(fetchURL, {
      headers: {
        Accept: "application/json",
      },
    })
      .then((resp) => resp.json())
      .then((json) => json.data);

    const { title, content } = result;

    const markdown = processMarkdown(content, title, url);

    return {
      title,
      markdown,
    };
  } catch (err: unknown) {
    console.error(err);
  }
}
