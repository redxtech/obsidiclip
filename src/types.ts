export type ReaderMethod = "readability" | "r.jina.ai";

export type ModKey = "altKey" | "ctrlKey" | "metaKey" | "shiftKey";
export type Bind = {
  key: string;
  mod: ModKey;
  folder?: string;
  vault?: string;
};

export type Prefs = {
  binds: Bind[];
};

export type PageContent = {
  title: string;
  markdown: string;
};

export type ObsidiclipPrefs = {
  vault: string;
  folder: string;
  readerMethod: ReaderMethod;
  openInNewTab: boolean;
  modifierKey: ModKey;
  keybind: string;
  customBinds: Bind[];
};
