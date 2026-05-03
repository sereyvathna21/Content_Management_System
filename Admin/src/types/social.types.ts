export type TreeSection = {
    id: string;
    sectionKey: string;
    titleKm: string;
    titleEn?: string;
    sortOrder: number;
    depth: number;
    parentSectionId?: string;
};

export type SectionData = {
  id?: string;
  topicId?: string;
  parentSectionId?: string;
  sectionKey: string;
  titleKm: string;
  titleEn: string;
  contentKm: string;
  contentEn: string;
};

export type MediaDto = {
    id: string;
    publicUrl: string;
    mimeType: string;
    fileSize: number;
    width?: number;
    height?: number;
};

export type SectionMedia = {
    id: string;
    sectionId: string;
    mediaId: string;
    position: number;
    captionKm?: string;
    captionEn?: string;
    altKm?: string;
    altEn?: string;
    sortOrder: number;
    media?: MediaDto | null;
};

export type EditorSection = TreeSection & {
    contentKm: string;
    contentEn: string;
    media: SectionMedia[];
};

export type SocialTopic = {
  id: string;
  slug: string;
  titleKm: string;
  titleEn?: string;
  status: number; // 0 = Draft, 1 = Published
  publishedAt?: string;
  sortOrder: number;
};
