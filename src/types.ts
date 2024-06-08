export type ReaderMethod = "readability" | "r.jina.ai";

export type Bind = {
  key: string;
  mod: string;
  folder: string;
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
  useNewTab: boolean;
};
