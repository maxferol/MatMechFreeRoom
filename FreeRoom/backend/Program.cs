using FreeRoom.backend.src.Infrastructure;

namespace FreeRoom.backend;

public class Program
{
    public static async Task Main(string[] args)
    {
        var roomTester = new RoomDynamicTester("mongodb://localhost:27017", "FreeRoom");
        await roomTester.RunTest();
    }
}