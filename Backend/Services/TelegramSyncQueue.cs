using System.Threading.Channels;
using Backend.Models;

namespace Backend.Services
{
    public class TelegramSyncQueue
    {
        private readonly Channel<TelegramSyncJob> _channel;

        public TelegramSyncQueue()
        {
            _channel = Channel.CreateBounded<TelegramSyncJob>(new BoundedChannelOptions(500)
            {
                FullMode = BoundedChannelFullMode.Wait,
                SingleReader = true,
                SingleWriter = false
            });
        }

        public ValueTask EnqueueAsync(TelegramSyncJob job) => _channel.Writer.WriteAsync(job);
        public IAsyncEnumerable<TelegramSyncJob> ReadAllAsync(CancellationToken cancellationToken) => _channel.Reader.ReadAllAsync(cancellationToken);
    }
}

