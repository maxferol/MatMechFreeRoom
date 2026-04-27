using FreeRoom.backend.src.Infrastructure;

namespace FreeRoom.backend;

public class Program
{
    public static async Task Main(string[] args)
    {
        string rawJson = "{\"612\": [2, 3, 1, 7, 6], \"625\": [2, 3, 6, 4, 5], \"623\": [2, 1, 3, 4], \"632\": [3, 1, 2, 4, 7, 6, 5], \"621\": [1, 2, 5, 6, 3], \"622\": [3, 1, 2], \"628\": [3, 4, 5, 2], \"602\": [3, 2], \"608\": [3, 2, 6], \"622\\u0430\": [3, 2, 4], \"601\": [3, 2, 4], \"605\": [2, 3, 4, 6], \"611\": [4, 5, 3, 2, 1, 7, 6], \"614\": [3]}";
        var tester = new RoomDynamicTester("mongodb://localhost:27017", "FreeRoomDB");
        await tester.CreateRoomsFromJson(rawJson);
    }
}