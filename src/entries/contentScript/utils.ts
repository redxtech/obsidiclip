export function genFileName(title: string) {
  if (!title) return "untitled";

  // remove < > : " / \ | ? *
  const illegalRe = /[\/\?<>\\:\*\|":]/g;

  const sanitized = title
    .replace(illegalRe, "-")
    .replace(new RegExp("\u00A0", "g"), " ");

  return sanitized;
}

export function genObsidianURI(
  vault: string,
  folder: string,
  title: string,
  content: string,
) {
  const encodedTitle = encodeURIComponent(genFileName(title));
  const encodedContent = encodeURIComponent(content);
  const mode = "new";

  const uri = `obsidian://advanced-uri?vault=${vault}&filepath=${folder}/${encodedTitle}.md&data=${encodedContent}&mode=${mode}`;

  return uri;
}
