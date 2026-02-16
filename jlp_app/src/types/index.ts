export interface ContentRecord {
  contentId: number;
  title: string | null;
  duration: number | null;
  author: string | null;
  uploadDate: Date | null;
  link: string | null;
  audio: string | null;
}

export interface ContentInput {
  title?: string | null;
  duration?: number | null;
  author?: string | null;
  uploadDate?: Date | null;
  link?: string | null;
  audio?: string | null;
}

export interface ContentAPI {
  getAll: () => Promise<ContentRecord[]>;
  getById: (contentId: number) => Promise<ContentRecord | undefined>;
  create: (data: ContentInput) => Promise<ContentRecord>;
  update: (contentId: number, data: Partial<ContentInput>) => Promise<ContentRecord | undefined>;
  delete: (contentId: number) => Promise<ContentRecord | undefined>;
}
