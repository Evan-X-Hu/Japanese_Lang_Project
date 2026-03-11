export interface ContentRecord {
  contentId: number;
  title: string | null;
  duration: number | null;
  author: string | null;
  uploadDate: Date | null;
  link: string | null;
  audio: string | null;
  video: string | null;
  vtt: string | null;
}

export interface ContentInput {
  title?: string | null;
  duration?: number | null;
  author?: string | null;
  uploadDate?: Date | null;
  link?: string | null;
  audio?: string | null;
  video?: string | null;
  vtt?: string | null;
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
  getAll: (userId: number) => Promise<ContentRecord[]>;
  getById: (contentId: number) => Promise<ContentRecord | undefined>;
  create: (data: ContentInput) => Promise<ContentRecord>;
  update: (contentId: number, data: Partial<ContentInput>) => Promise<ContentRecord | undefined>;
  delete: (contentId: number) => Promise<ContentRecord | undefined>;
  import: (url: string, userId: number) => Promise<ContentRecord>;
}

export interface UserRecord {
  userId: number;
  email: string | null;
  password: string | null;
  fName: string | null;
  lName: string | null;
  jlptLevel: number | null;
  userType: number | null;
}

export interface UserInput {
  email?: string | null;
  password?: string | null;
  fName?: string | null;
  lName?: string | null;
  jlptLevel?: number | null;
  userType?: number | null;
}

export interface UserAPI {
  getAll: () => Promise<UserRecord[]>;
  create: (data: UserInput) => Promise<UserRecord>;
  delete: (userId: number) => Promise<void>;
  signIn: (email: string, password: string) => Promise<UserRecord | null>;
  getCurrent: () => Promise<UserRecord | null>;
  setCurrent: (userId: number) => Promise<UserRecord | null>;
}
