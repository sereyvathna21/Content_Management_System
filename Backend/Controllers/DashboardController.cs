using Backend.Data;
using Backend.Models;
using Backend.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/admin/dashboard")]
    [Authorize]
    [HasPermission(PermissionConstants.DashboardRead)]
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
            // ── News Stats ──────────────────────────────────
            var newsStats = await _db.NewsArticles.Where(a => a.DeletedAt == null)
                .GroupBy(a => 1)
                .Select(g => new {
                    Total = g.Count(),
                    Published = g.Count(x => x.Status == ContentStatus.Published),
                    Draft = g.Count(x => x.Status == ContentStatus.Draft),
                    Archived = g.Count(x => x.Status == ContentStatus.Archived),
                    TeleNotSynced = g.Count(x => x.TelegramSyncStatus == TelegramSyncStatus.NotSynced),
                    TelePending = g.Count(x => x.TelegramSyncStatus == TelegramSyncStatus.Pending),
                    TeleSuccess = g.Count(x => x.TelegramSyncStatus == TelegramSyncStatus.Success),
                    TeleFailed = g.Count(x => x.TelegramSyncStatus == TelegramSyncStatus.Failed)
                }).FirstOrDefaultAsync();

            var pubsStats = await _db.Publications
                .GroupBy(a => 1)
                .Select(g => new {
                    Total = g.Count(),
                    Published = g.Count(x => x.Status == ContentStatus.Published),
                    Draft = g.Count(x => x.Status == ContentStatus.Draft),
                    Archived = g.Count(x => x.Status == ContentStatus.Archived),
                    TeleNotSynced = g.Count(x => x.TelegramSyncStatus == TelegramSyncStatus.NotSynced),
                    TelePending = g.Count(x => x.TelegramSyncStatus == TelegramSyncStatus.Pending),
                    TeleSuccess = g.Count(x => x.TelegramSyncStatus == TelegramSyncStatus.Success),
                    TeleFailed = g.Count(x => x.TelegramSyncStatus == TelegramSyncStatus.Failed)
                }).FirstOrDefaultAsync();

            var lawsStats = await _db.Laws
                .GroupBy(a => 1)
                .Select(g => new {
                    Total = g.Count(),
                    Published = g.Count(x => x.Status == ContentStatus.Published),
                    Draft = g.Count(x => x.Status == ContentStatus.Draft),
                    Archived = g.Count(x => x.Status == ContentStatus.Archived),
                    TeleNotSynced = g.Count(x => x.TelegramSyncStatus == TelegramSyncStatus.NotSynced),
                    TelePending = g.Count(x => x.TelegramSyncStatus == TelegramSyncStatus.Pending),
                    TeleSuccess = g.Count(x => x.TelegramSyncStatus == TelegramSyncStatus.Success),
                    TeleFailed = g.Count(x => x.TelegramSyncStatus == TelegramSyncStatus.Failed)
                }).FirstOrDefaultAsync();

            var videosStats = await _db.Videos.Where(v => v.DeletedAt == null)
                .GroupBy(a => 1)
                .Select(g => new {
                    Total = g.Count(),
                    Published = g.Count(x => x.Status == ContentStatus.Published),
                    Draft = g.Count(x => x.Status == ContentStatus.Draft),
                    Archived = g.Count(x => x.Status == ContentStatus.Archived),
                    TeleNotSynced = g.Count(x => x.TelegramSyncStatus == TelegramSyncStatus.NotSynced),
                    TelePending = g.Count(x => x.TelegramSyncStatus == TelegramSyncStatus.Pending),
                    TeleSuccess = g.Count(x => x.TelegramSyncStatus == TelegramSyncStatus.Success),
                    TeleFailed = g.Count(x => x.TelegramSyncStatus == TelegramSyncStatus.Failed)
                }).FirstOrDefaultAsync();

            var socialStats = await _db.SocialTopics
                .GroupBy(a => 1)
                .Select(g => new {
                    Total = g.Count(),
                    Published = g.Count(x => x.Status == TopicStatus.Published),
                    Draft = g.Count(x => x.Status == TopicStatus.Draft),
                    TeleNotSynced = g.Count(x => x.TelegramSyncStatus == TelegramSyncStatus.NotSynced),
                    TelePending = g.Count(x => x.TelegramSyncStatus == TelegramSyncStatus.Pending),
                    TeleSuccess = g.Count(x => x.TelegramSyncStatus == TelegramSyncStatus.Success),
                    TeleFailed = g.Count(x => x.TelegramSyncStatus == TelegramSyncStatus.Failed)
                }).FirstOrDefaultAsync();

            var totalSections = await _db.SocialSections.CountAsync();

            // ── Contacts ──────────────────────────────────────────────────
            var contactsStats = await _db.Contacts
                .GroupBy(a => 1)
                .Select(g => new {
                    Total = g.Count(),
                    Unread = g.Count(c => !c.Read),
                    Replied = g.Count(c => c.Replied)
                }).FirstOrDefaultAsync();

            // ── Telegram aggregate ────────────────────
            var teleNotSynced = (newsStats?.TeleNotSynced ?? 0) + (pubsStats?.TeleNotSynced ?? 0) + (lawsStats?.TeleNotSynced ?? 0) + (videosStats?.TeleNotSynced ?? 0) + (socialStats?.TeleNotSynced ?? 0);
            var telePending = (newsStats?.TelePending ?? 0) + (pubsStats?.TelePending ?? 0) + (lawsStats?.TelePending ?? 0) + (videosStats?.TelePending ?? 0) + (socialStats?.TelePending ?? 0);
            var teleSuccess = (newsStats?.TeleSuccess ?? 0) + (pubsStats?.TeleSuccess ?? 0) + (lawsStats?.TeleSuccess ?? 0) + (videosStats?.TeleSuccess ?? 0) + (socialStats?.TeleSuccess ?? 0);
            var teleFailed = (newsStats?.TeleFailed ?? 0) + (pubsStats?.TeleFailed ?? 0) + (lawsStats?.TeleFailed ?? 0) + (videosStats?.TeleFailed ?? 0) + (socialStats?.TeleFailed ?? 0);

            // ── Users & Roles ─────────────────────────────────────────────
            var totalUsers = await _db.Users.CountAsync();
            var activeRoles = await _db.Roles.CountAsync();

            // ── Media ─────────────────────────────────────────────────────
            var totalMedia = await _db.Media.CountAsync();
            var totalStorageBytes = await _db.Media.SumAsync(m => (long?)m.FileSize) ?? 0;

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

            // ── Recent Drafts (Workflow Feature) ──────────────────────────
            var draftNews = await _db.NewsArticles
                .Where(n => n.Status == ContentStatus.Draft && n.DeletedAt == null)
                .OrderByDescending(n => n.CreatedAt)
                .Take(5)
                .Select(n => new { Id = n.Id.ToString(), Title = n.Translations.Select(t => t.Title).FirstOrDefault() ?? "Untitled", Type = "News", n.CreatedAt })
                .ToListAsync();

            var draftPubs = await _db.Publications
                .Where(p => p.Status == ContentStatus.Draft)
                .OrderByDescending(p => p.CreatedAt)
                .Take(5)
                .Select(p => new { Id = p.Id.ToString(), Title = p.Translations.Select(t => t.Title).FirstOrDefault() ?? "Untitled", Type = "Publication", p.CreatedAt })
                .ToListAsync();

            var draftLaws = await _db.Laws
                .Where(l => l.Status == ContentStatus.Draft)
                .OrderByDescending(l => l.CreatedAt)
                .Take(5)
                .Select(l => new { Id = l.Id.ToString(), Title = l.Translations.Select(t => t.Title).FirstOrDefault() ?? "Untitled", Type = "Law", l.CreatedAt })
                .ToListAsync();

            var draftVideos = await _db.Videos
                .Where(v => v.Status == ContentStatus.Draft && v.DeletedAt == null)
                .OrderByDescending(v => v.CreatedAt)
                .Take(5)
                .Select(v => new { Id = v.Id.ToString(), Title = v.Title, Type = "Video", v.CreatedAt })
                .ToListAsync();

            var recentDrafts = draftNews.Concat(draftPubs).Concat(draftLaws).Concat(draftVideos)
                .OrderByDescending(x => x.CreatedAt)
                .Take(5)
                .ToList();

            // ── Publishing trend (last 6 months) ──────────────────────────
            var sixMonthsAgo = DateTime.UtcNow.AddMonths(-5);
            sixMonthsAgo = new DateTime(sixMonthsAgo.Year, sixMonthsAgo.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var endOfPeriod = sixMonthsAgo.AddMonths(6);

            var newsTrendData = await _db.NewsArticles
                .Where(n => n.Status == ContentStatus.Published && n.PublishAt >= sixMonthsAgo && n.PublishAt < endOfPeriod)
                .Select(n => n.PublishAt!.Value)
                .ToListAsync();
            var pubsTrendData = await _db.Publications
                .Where(p => p.Status == ContentStatus.Published && p.PublishAt >= sixMonthsAgo && p.PublishAt < endOfPeriod)
                .Select(p => p.PublishAt!.Value)
                .ToListAsync();
            var lawsTrendData = await _db.Laws
                .Where(l => l.Status == ContentStatus.Published && l.PublishAt >= sixMonthsAgo && l.PublishAt < endOfPeriod)
                .Select(l => l.PublishAt!.Value)
                .ToListAsync();
            var videosTrendData = await _db.Videos
                .Where(v => v.Status == ContentStatus.Published && v.PublishAt >= sixMonthsAgo && v.PublishAt < endOfPeriod)
                .Select(v => v.PublishAt!.Value)
                .ToListAsync();

            var publishingTrend = Enumerable.Range(0, 6).Select(i =>
            {
                var monthStart = sixMonthsAgo.AddMonths(i);
                var monthEnd = monthStart.AddMonths(1);
                return new
                {
                    month = monthStart.ToString("yyyy-MM"),
                    news = newsTrendData.Count(d => d >= monthStart && d < monthEnd),
                    publications = pubsTrendData.Count(d => d >= monthStart && d < monthEnd),
                    laws = lawsTrendData.Count(d => d >= monthStart && d < monthEnd),
                    videos = videosTrendData.Count(d => d >= monthStart && d < monthEnd),
                };
            }).ToList();

            return Ok(new
            {
                news = new { total = newsStats?.Total ?? 0, published = newsStats?.Published ?? 0, draft = newsStats?.Draft ?? 0, archived = newsStats?.Archived ?? 0 },
                publications = new { total = pubsStats?.Total ?? 0, published = pubsStats?.Published ?? 0, draft = pubsStats?.Draft ?? 0, archived = pubsStats?.Archived ?? 0 },
                laws = new { total = lawsStats?.Total ?? 0, published = lawsStats?.Published ?? 0, draft = lawsStats?.Draft ?? 0, archived = lawsStats?.Archived ?? 0 },
                videos = new { total = videosStats?.Total ?? 0, published = videosStats?.Published ?? 0, draft = videosStats?.Draft ?? 0, archived = videosStats?.Archived ?? 0 },
                socialTopics = new { total = socialStats?.Total ?? 0, published = socialStats?.Published ?? 0, draft = socialStats?.Draft ?? 0, totalSections },
                contacts = new { total = contactsStats?.Total ?? 0, unread = contactsStats?.Unread ?? 0, replied = contactsStats?.Replied ?? 0 },
                telegramSync = new { notSynced = teleNotSynced, pending = telePending, success = teleSuccess, failed = teleFailed },
                users = new { total = totalUsers, activeRoles },
                media = new { totalFiles = totalMedia, totalSizeBytes = totalStorageBytes },
                recentActivity,
                recentDrafts,
                publishingTrend,
            });
        }
    }
}
