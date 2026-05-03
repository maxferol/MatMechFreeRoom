using System.Reflection;
using FreeRoom.backend.src.Domain.Enities;
using FreeRoom.backend.src.Domain.Value_Object.RoomDynamic;
using FreeRoom.backend.src.Domain.Value_Object.RoomStatic; // Добавлен, если RoomStaticId там
using FreeRoom.backend.src.Infrastructure.GetEntitiesId;
using FreeRoom.backend.src.Infrastructure.RoomStorage;
using System.Text.Json;
using MongoDB.Bson;

namespace FreeRoom.backend.src.Infrastructure;

public class RoomDynamicTester
{
    private readonly RoomDynamicMongoDB _repository;

    public RoomDynamicTester(string connectionString, string dbName)
    {
        _repository = new RoomDynamicMongoDB(connectionString, dbName);
    }

    public async Task CreateRoomsFromJson(string jsonString, DateTime dateCorrect)
    {
        Console.WriteLine("\n>>> НАЧАЛО МАССОВОГО ДОБАВЛЕНИЯ ИЗ JSON <<<");

        try
        {
            var roomsData = JsonSerializer.Deserialize<Dictionary<string, List<int>>>(jsonString);
            if (roomsData == null) return;

            // Создаем системный UserId (Guid)
            var userId = new UserId(Guid.NewGuid()); 
            var date = new BookingDate(dateCorrect);

            foreach (var entry in roomsData)
            {
                string roomName = entry.Key;      
                List<int> pairs = entry.Value;    

                Console.WriteLine($"Обработка аудитории {roomName}...");

                foreach (var pairNumber in pairs)
                {
                    var staticId = new RoomStaticId(roomName); 
                    var lesson = new LessonNumber(pairNumber);

                    // ИСПРАВЛЕННЫЙ ВЫЗОВ ACTIVATOR
                    // Добавлен BindingFlags.Public, так как конструктор в RoomDynamic — public
                    var testBooking = (RoomDynamic)Activator.CreateInstance(
                        typeof(RoomDynamic),
                        BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance,
                        null,
                        new object[] { staticId, userId, lesson, date }, 
                        null)!;

                    // Устанавливаем Id для MongoDB (свойство Id)
                    var bookingId = Guid.NewGuid();
                    var idProp = typeof(RoomDynamic).GetProperty("Id");
                    if (idProp != null)
                    {
                        idProp.SetValue(testBooking, new RoomDynamicId(bookingId));
                    }

                    // Сохранение
                    await _repository.CreateRoomDynamic(testBooking);
                    Console.WriteLine($"  - Пара №{pairNumber} добавлена.");
                }
            }

            Console.WriteLine("\n>>> ВСЕ ДАННЫЕ УСПЕШНО ЗАГРУЖЕНЫ <<<");
        }
        catch (Exception ex)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"\nОШИБКА В ТЕСТЕРЕ: {ex.Message}");
            if (ex.InnerException != null) 
                Console.WriteLine($"Детали: {ex.InnerException.Message}");
            Console.ResetColor();
        }
    }
}