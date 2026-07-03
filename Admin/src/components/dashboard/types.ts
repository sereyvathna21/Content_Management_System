export interface ContentStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
}

export interface SocialTopicStats {
  total: number;
  published: number;
  draft: number;
  totalSections: number;
}

export interface ContactStats {
  total: number;
  unread: number;
  replied: number;
}

export interface TelegramSyncStats {
  notSynced: number;
  pending: number;
  success: number;
  failed: number;
}

export interface UserStats {
  total: number;
  activeRoles: number;
}

export interface MediaStats {
  totalFiles: number;
  totalSizeBytes: number;
}

export interface AuditActivity {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  status: string;
  actorEmail: string;
  createdAt: string;
}

export interface PublishingTrendItem {
  month: string;
  news: number;
  publications: number;
  laws: number;
  videos: number;
}

export interface DashboardData {
  news: ContentStats;
  publications: ContentStats;
  laws: ContentStats;
  videos: ContentStats;
  socialTopics: SocialTopicStats;
  contacts: ContactStats;
  telegramSync: TelegramSyncStats;
  users: UserStats;
  media: MediaStats;
  recentActivity: AuditActivity[];
  publishingTrend: PublishingTrendItem[];
}
