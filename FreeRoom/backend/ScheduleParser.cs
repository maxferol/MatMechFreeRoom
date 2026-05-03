using System.Text.Json;
using FreeRoom.backend.src.Infrastructure;

namespace FreeRoom;

public class ScheduleParser
{
    private readonly string _connectionString;
    private readonly string _databaseName;
    private readonly RoomDynamicTester _tester;

    public ScheduleParser(string connectionString, string databaseName)
    {
        _connectionString = connectionString;
        _databaseName = databaseName;
        _tester = new RoomDynamicTester(connectionString, databaseName);
    }

    public async Task LoadScheduleFromJsonFile(string jsonFilePath)
    {
        try
        {
            if (!File.Exists(jsonFilePath))
            {
                Console.WriteLine($"⚠️ Файл {jsonFilePath} не найден");
                return;
            }

            Console.WriteLine($"Загрузка расписания из {jsonFilePath}...");
            
            var jsonContent = await File.ReadAllTextAsync(jsonFilePath);
            await LoadScheduleFromJsonString(jsonContent);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Ошибка при загрузке файла: {ex.Message}");
            throw;
        }
    }

    public async Task LoadScheduleFromJsonString(string jsonContent)
    {
        try
        {
            using var document = JsonDocument.Parse(jsonContent);
            var root = document.RootElement;
        
            if (root.TryGetProperty("schedule", out var scheduleElement))
            {
                foreach (var dateProperty in scheduleElement.EnumerateObject())
                {
                    var dateStr = dateProperty.Name;
                    if (DateTime.TryParse(dateStr, out var date))
                    {
                        // Устанавливаем время на 10:00 утра
                        var dateWithTime = new DateTime(date.Year, date.Month, date.Day, 10, 0, 0, DateTimeKind.Local);
                    
                        Console.WriteLine($"📅 Загрузка расписания на {dateStr} (локальное время: {dateWithTime})...");
                    
                        var roomsDict = dateProperty.Value;
                        var roomsData = new Dictionary<string, List<int>>();
                    
                        foreach (var roomProperty in roomsDict.EnumerateObject())
                        {
                            var roomName = roomProperty.Name;
                            var lessons = roomProperty.Value.EnumerateArray().Select(x => x.GetInt32()).ToList();
                            roomsData[roomName] = lessons;
                            Console.WriteLine($"  Комната {roomName}: {string.Join(", ", lessons)} пар");
                        }
                    
                        var rawJson = JsonSerializer.Serialize(roomsData);
                        await _tester.CreateRoomsFromJson(rawJson, dateWithTime);
                        Console.WriteLine($"  ✅ Загружено расписание на {dateStr}");
                    }
                }
                Console.WriteLine("✅ Все расписания успешно загружены!");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Ошибка при парсинге JSON: {ex.Message}");
            throw;
        }
    }
}

// Вспомогательный класс для работы с JSON в другом формате
public class ScheduleWeekData
{
    public DateTime GeneratedAt { get; set; }
    public PeriodInfo Period { get; set; }
    public Dictionary<string, Dictionary<string, List<int>>> Schedule { get; set; }
}

public class PeriodInfo
{
    public DateTime Start { get; set; }
    public DateTime End { get; set; }
}