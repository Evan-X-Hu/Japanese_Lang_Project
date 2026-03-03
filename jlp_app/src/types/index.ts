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

export interface SegmentRecord {
  segmentId: number;
  contentId: number | null;
  seqIndex: number | null;
  startTime: number | null;
  endTime: number | null;
  text: string | null;
  jlptLevel: number | null;
}

export interface ContentAPI {
  getAll: () => Promise<ContentRecord[]>;
  getById: (contentId: number) => Promise<ContentRecord | undefined>;
  create: (data: ContentInput) => Promise<ContentRecord>;
  update: (contentId: number, data: Partial<ContentInput>) => Promise<ContentRecord | undefined>;
  delete: (contentId: number) => Promise<ContentRecord | undefined>;
  import: (url: string) => Promise<ContentRecord>;
}
