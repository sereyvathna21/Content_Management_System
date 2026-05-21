using Microsoft.AspNetCore.Authorization;

namespace Backend.Security
{
    public sealed class HasPermissionAttribute : AuthorizeAttribute
    {
        public HasPermissionAttribute(string permission)
        {
            Policy = $"{PermissionPolicyProvider.PolicyPrefix}{permission}";
        }
    }
}
