using System.Threading.Channels;
using Backend.Models;

namespace Backend.Services
{
    public class AuditLogQueue
    {
        private readonly Channel<AuditLog> _channel;

        public AuditLogQueue()
        {
            // unbounded channel to avoid dropping logs; consider bounded+batching for production
            _channel = Channel.CreateUnbounded<AuditLog>(new UnboundedChannelOptions
            {
                SingleReader = true,
                SingleWriter = false
            });
        }

        public ValueTask EnqueueAsync(AuditLog log)
        {
            return _channel.Writer.WriteAsync(log);
        }

        public IAsyncEnumerable<AuditLog> ReadAllAsync(CancellationToken cancellationToken)
        {
            return _channel.Reader.ReadAllAsync(cancellationToken);
        }
    }
}
