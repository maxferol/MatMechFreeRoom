using FreeRoom.backend.src.Infrastructure;
using FreeRoom.backend.src.Infrastructure.RoomStorage;
using Microsoft.EntityFrameworkCore;

namespace FreeRoom.backend;

public class Program
{
    public static async Task Main(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("FREEROOM_POSTGRES_CONNECTION_STRING");
        if (string.IsNullOrWhiteSpace(connectionString))
            throw new InvalidOperationException(
                "Set the FREEROOM_POSTGRES_CONNECTION_STRING environment variable.");

        var options = new DbContextOptionsBuilder<FreeRoomDbContext>()
            .UseNpgsql(connectionString)
            .Options;

        await using var dbContext = new FreeRoomDbContext(options);
        var roomTester = new RoomDynamicTester(new RoomDynamicPostgres(dbContext));
        await roomTester.RunTest();
    }
}