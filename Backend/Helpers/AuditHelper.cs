using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Backend.Helpers
{
    public static class AuditHelper
    {
        public static object? GetChanges(EntityEntry entry)
        {
            if (entry.State != EntityState.Modified)
            {
                return null;
            }

            var oldValues = new Dictionary<string, object?>();
            var newValues = new Dictionary<string, object?>();

            foreach (var property in entry.Properties)
            {
                if (property.IsModified)
                {
                    oldValues[property.Metadata.Name] = property.OriginalValue;
                    newValues[property.Metadata.Name] = property.CurrentValue;
                }
            }

            if (oldValues.Count == 0)
            {
                return null; // No actual property changes
            }

            return new
            {
                OldValues = oldValues,
                NewValues = newValues
            };
        }
    }
}
