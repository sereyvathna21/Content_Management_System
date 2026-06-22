export interface PaginatedResponse<T> {
  items?: T[];
  data?: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  contentHtml?: string;
  contentMd?: string;
  publishAt: string;
  category: string;
  imageUrl: string;
}

export interface Video {
  id: string;
  embedUrl: string;
  title: string;
  description: string;
  category: string;
  publishAt: string;
}

export interface ApiSocialMedia {
  publicUrl: string;
  alt?: string;
  caption?: string;
  position?: string;
  width?: number;
}

export interface ApiSocialSection {
  sectionKey?: string;
  sortOrder?: number;
  title?: string;
  content?: string;
  media?: ApiSocialMedia[];
  childSections?: ApiSocialSection[];
}

export interface ApiTopicReference {
  title?: string;
  publicUrl: string;
  fileSizeBytes?: number;
}

export interface ApiSocialTopic {
  slug: string;
  title?: string;
  subtitle?: string;
  reference?: string;
  referencesKm?: ApiTopicReference[];
  referencesEn?: ApiTopicReference[];
  sections?: ApiSocialSection[];
}

export interface SocialContentSection {
  id: string;
  title?: string | { en: string; kh: string } | null;
  content?: string | string[] | { en: string[]; kh: string[] } | { en: string; kh: string } | { en: string | string[]; kh: string | string[] };
  image?: {
    src: string | { en: string; kh: string };
    alt?: string | { en: string; kh: string };
    caption?: string | { en: string; kh: string };
    position?: "top" | "bottom" | "left" | "right" | "full";
    width?: number;
  };
  images?: Array<{
    src: string;
    alt?: string | { en: string; kh: string };
    caption?: string | { en: string; kh: string };
    width?: number;
  }>;
  subsections?: SocialContentSection[];
}

export interface SocialTopic {
  id: string;
  title?: string;
  subtitle?: string;
  category?: string;
  reference?: string;
  referenceFilesKm?: { title: string; publicUrl: string; fileSizeBytes?: number }[];
  referenceFilesEn?: { title: string; publicUrl: string; fileSizeBytes?: number }[];
  sections: SocialContentSection[];
}
