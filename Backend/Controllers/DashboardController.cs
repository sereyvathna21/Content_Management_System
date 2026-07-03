using Backend.Data;
using Backend.Models;
using Backend.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/admin/dashboard")]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public DashboardController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetOverview()
        {
            // ── Content counts by status ──────────────────────────────────
            var newsAll = await _db.NewsArticles.Where(a => a.DeletedAt == null).ToListAsync();
            var newsPublished = newsAll.Count(a => a.Status == ContentStatus.Published);
            var newsDraft = newsAll.Count(a => a.Status == ContentStatus.Draft);
            var newsArchived = newsAll.Count(a => a.Status == ContentStatus.Archived);

            var pubsAll = await _db.Publications.ToListAsync();
            var pubsPublished = pubsAll.Count(p => p.Status == ContentStatus.Published);
            var pubsDraft = pubsAll.Count(p => p.Status == ContentStatus.Draft);
            var pubsArchived = pubsAll.Count(p => p.Status == ContentStatus.Archived);

            var lawsAll = await _db.Laws.ToListAsync();
            var lawsPublished = lawsAll.Count(l => l.Status == ContentStatus.Published);
            var lawsDraft = lawsAll.Count(l => l.Status == ContentStatus.Draft);
            var lawsArchived = lawsAll.Count(l => l.Status == ContentStatus.Archived);

            var videosAll = await _db.Videos.Where(v => v.DeletedAt == null).ToListAsync();
            var videosPublished = videosAll.Count(v => v.Status == ContentStatus.Published);
            var videosDraft = videosAll.Count(v => v.Status == ContentStatus.Draft);
            var videosArchived = videosAll.Count(v => v.Status == ContentStatus.Archived);

            // ── Social Topics ─────────────────────────────────────────────
            var socialAll = await _db.SocialTopics.ToListAsync();
            var socialPublished = socialAll.Count(s => s.Status == TopicStatus.Published);
            var socialDraft = socialAll.Count(s => s.Status == TopicStatus.Draft);
            var totalSections = await _db.SocialSections.CountAsync();

            // ── Contacts ──────────────────────────────────────────────────
            var contactsAll = await _db.Contacts.ToListAsync();
            var contactsUnread = contactsAll.Count(c => !c.Read);
            var contactsReplied = contactsAll.Count(c => c.Replied);

            // ── Telegram sync across all content types ────────────────────
            var allSyncStatuses = newsAll.Select(n => n.TelegramSyncStatus)
                .Concat(pubsAll.Select(p => p.TelegramSyncStatus))
                .Concat(lawsAll.Select(l => l.TelegramSyncStatus))
                .Concat(videosAll.Select(v => v.TelegramSyncStatus))
                .Concat(socialAll.Select(s => s.TelegramSyncStatus))
                .ToList();

            var teleNotSynced = allSyncStatuses.Count(s => s == TelegramSyncStatus.NotSynced);
            var telePending = allSyncStatuses.Count(s => s == TelegramSyncStatus.Pending);
            var teleSuccess = allSyncStatuses.Count(s => s == TelegramSyncStatus.Success);
            var teleFailed = allSyncStatuses.Count(s => s == TelegramSyncStatus.Failed);

            // ── Users & Roles ─────────────────────────────────────────────
            var totalUsers = await _db.Users.CountAsync();
            var activeRoles = await _db.Roles.CountAsync();

            // ── Media ─────────────────────────────────────────────────────
            var totalMedia = await _db.Media.CountAsync();
            var totalStorageBytes = await _db.Media.SumAsync(m => m.FileSize);

            // ── Recent audit activity (last 10) ───────────────────────────
            var recentActivity = await _db.AuditLogs
                .OrderByDescending(a => a.CreatedAt)
                .Take(10)
                .Select(a => new
                {
                    a.Id,
                    a.Action,
                    a.EntityType,
                    a.EntityId,
                    a.Summary,
                    status = a.Status.ToString(),
                    a.ActorEmail,
                    a.CreatedAt
                })
                .ToListAsync();

            // ── Publishing trend (last 6 months) ──────────────────────────
            var sixMonthsAgo = DateTime.UtcNow.AddMonths(-5);
            sixMonthsAgo = new DateTime(sixMonthsAgo.Year, sixMonthsAgo.Month, 1, 0, 0, 0, DateTimeKind.Utc);

            var publishingTrend = Enumerable.Range(0, 6).Select(i =>
            {
                var monthStart = sixMonthsAgo.AddMonths(i);
                var monthEnd = monthStart.AddMonths(1);
                return new
                {
                    month = monthStart.ToString("yyyy-MM"),
                    news = newsAll.Count(n => n.Status == ContentStatus.Published && n.PublishAt.HasValue && n.PublishAt.Value >= monthStart && n.PublishAt.Value < monthEnd),
                    publications = pubsAll.Count(p => p.Status == ContentStatus.Published && p.PublishAt.HasValue && p.PublishAt.Value >= monthStart && p.PublishAt.Value < monthEnd),
                    laws = lawsAll.Count(l => l.Status == ContentStatus.Published && l.PublishAt.HasValue && l.PublishAt.Value >= monthStart && l.PublishAt.Value < monthEnd),
                    videos = videosAll.Count(v => v.Status == ContentStatus.Published && v.PublishAt.HasValue && v.PublishAt.Value >= monthStart && v.PublishAt.Value < monthEnd),
                };
            }).ToList();

            return Ok(new
            {
                news = new { total = newsAll.Count, published = newsPublished, draft = newsDraft, archived = newsArchived },
                publications = new { total = pubsAll.Count, published = pubsPublished, draft = pubsDraft, archived = pubsArchived },
                laws = new { total = lawsAll.Count, published = lawsPublished, draft = lawsDraft, archived = lawsArchived },
                videos = new { total = videosAll.Count, published = videosPublished, draft = videosDraft, archived = videosArchived },
                socialTopics = new { total = socialAll.Count, published = socialPublished, draft = socialDraft, totalSections },
                contacts = new { total = contactsAll.Count, unread = contactsUnread, replied = contactsReplied },
                telegramSync = new { notSynced = teleNotSynced, pending = telePending, success = teleSuccess, failed = teleFailed },
                users = new { total = totalUsers, activeRoles },
                media = new { totalFiles = totalMedia, totalSizeBytes = totalStorageBytes },
                recentActivity,
                publishingTrend,
            });
        }
    }
}
