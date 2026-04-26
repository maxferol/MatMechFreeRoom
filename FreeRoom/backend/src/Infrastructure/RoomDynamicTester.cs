using System.Reflection;
using FreeRoom.backend.src.Domain.Enities;
using FreeRoom.backend.src.Domain.Value_Object.RoomDynamic;
using FreeRoom.backend.src.Infrastructure.GetEntitiesId;
using FreeRoom.backend.src.Infrastructure.RoomStorage;
using MongoDB.Bson;

namespace FreeRoom.backend.src.Infrastructure;

public class RoomDynamicTester
{
    private readonly RoomDynamicMongoDB _repository;

    public RoomDynamicTester(string connectionString, string dbName)
    {
        _repository = new RoomDynamicMongoDB(connectionString, dbName);
    }

    public async Task RunTest()
    {
        Console.WriteLine("\n>>> НАЧАЛО ТЕСТИРОВАНИЯ RoomDynamicMongoDB <<<");

        try
        {
            // 1. ПОДГОТОВКА ДАННЫХ
            var staticId = new RoomStaticId(Guid.NewGuid());
            var userId = new UserId(Guid.NewGuid());
            var lesson = new LessonNumber(3);
            var date = new BookingDate(DateTime.UtcNow.AddDays(2));

            // Используем рефлексию для создания объекта, так как конструктор приватный
            var testBooking = (RoomDynamic)Activator.CreateInstance(
                typeof(RoomDynamic),
                BindingFlags.NonPublic | BindingFlags.Instance,
                null,
                new object[] { staticId, userId, lesson, date },
                null)!;

            // Устанавливаем Id
            var bookingId = Guid.NewGuid();
            typeof(RoomDynamic).GetProperty("Id")?.SetValue(testBooking, new RoomDynamicId(bookingId));

            // 2. ТЕСТ: CreateRoomDynamic
            Console.WriteLine("[TEST 1]: Создание бронирования...");
            await _repository.CreateRoomDynamic(testBooking);
            Console.WriteLine("✓ Успешно сохранено.");

            // 3. ТЕСТ: GetByIdRoomDynamic
            Console.WriteLine("[TEST 2]: Поиск по ID...");
            var foundById = await _repository.GetByIdRoomDynamic(bookingId);
            if (foundById != null && foundById.Id.Value == bookingId)
                Console.WriteLine($"✓ Найдено! ID совпадает: {foundById.Id.Value}");
            else
                throw new Exception("Ошибка: Бронирование по ID не найдено.");

            // 4. ТЕСТ: GetAll
            Console.WriteLine("[TEST 3]: Получение всех записей...");
            var all = await _repository.GetAll();
            Console.WriteLine($"✓ В базе найдено записей: {all.Count}");
            if (all.Count == 0) throw new Exception("Ошибка: Список пуст.");

            // 5. ТЕСТ: IncrementViewCountAsync
            Console.WriteLine("[TEST 4]: Тест инкремента просмотров...");
            bool isUpdated = await _repository.IncrementViewCountAsync(bookingId);
            if (isUpdated)
                Console.WriteLine("✓ Счетчик обновлен в базе (проверь поле viewCount в Compass).");
            else
                Console.WriteLine("! Предупреждение: Документ не обновлен (возможно, поле не существует в BSON).");

            // 6. ТЕСТ: DeleteRoomDynamic
            // Console.WriteLine("[TEST 5]: Удаление записи...");
            // bool isDeleted = await _repository.DeleteRoomDynamic(bookingId);
            // if (isDeleted)
            //     Console.WriteLine("✓ Запись успешно удалена.");
            // else
            //     throw new Exception("Ошибка: Не удалось удалить запись.");
            //
            // Console.WriteLine("\n>>> ВСЕ ТЕСТЫ RoomDynamicMongoDB ПРОЙДЕНЫ УСПЕШНО <<<");
        }
        catch (Exception ex)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"\nОШИБКА ТЕСТЕРА: {ex.Message}");
            Console.ResetColor();
        }
    }
}