using Microsoft.AspNetCore.Http;

namespace RaceDay.Api.Tests;

public class TestSession : ISession
{
    private readonly Dictionary<string, byte[]> _store = new();

    public string Id { get; } = Guid.NewGuid().ToString();

    public bool IsAvailable => true;

    public IEnumerable<string> Keys => _store.Keys;

    public void Clear()
    {
        _store.Clear();
    }

    public Task CommitAsync(
        CancellationToken cancellationToken = default)
    {
        return Task.CompletedTask;
    }

    public Task LoadAsync(
        CancellationToken cancellationToken = default)
    {
        return Task.CompletedTask;
    }

    public void Remove(string key)
    {
        _store.Remove(key);
    }

    public void Set(string key, byte[] value)
    {
        _store[key] = value;
    }

    public bool TryGetValue(
        string key,
        out byte[] value)
    {
        return _store.TryGetValue(key, out value!);
    }
}