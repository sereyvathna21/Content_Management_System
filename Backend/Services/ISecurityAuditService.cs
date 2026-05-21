namespace Backend.Services
{
    public interface ISecurityAuditService
    {
        Task LogAsync(int actorUserId, string actorEmail, string action, string targetId, object details);
    }
}
