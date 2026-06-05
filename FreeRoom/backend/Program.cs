using FreeRoom.backend.src.Infrastructure;

namespace FreeRoom.backend;

public class Program
{
    public static async Task Main(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("FREEROOM_POSTGRES_CONNECTION_STRING");
        if (string.IsNullOrWhiteSpace(connectionString))
            throw new InvalidOperationException(
                "Set the FREEROOM_POSTGRES_CONNECTION_STRING environment variable.");

        var roomTester = new RoomDynamicTester(connectionString);
        await roomTester.RunTest();
    }
}