using System.Reflection;
using FreeRoom.backend.src.Domain.Enities;
using FreeRoom.backend.src.Domain.Value_Object.RoomDynamic;
using FreeRoom.backend.src.Infrastructure.GetEntitiesId;
using FreeRoom.backend.src.Infrastructure.RoomStorage;
using FreeRoom.backend.src.Infrastructure.UserStorage;
using System.Text.Json;
using MongoDB.Bson;

namespace FreeRoom.backend.src.Infrastructure;

public class UserMongoTester
{
    private readonly UserMongoDB _repository;

    public UserMongoTester(string connectionString, string dbName)
    {
        _repository = new UserMongoDB(connectionString, dbName);
    }

    // public async Task CreateRoomsFromJson(string jsonString)
    // {
    //     Console.WriteLine("\n>>> НАЧАЛО МАССОВОГО ДОБАВЛЕНИЯ ИЗ JSON <<<");

    //     try
    //     {
    //         // 1. ПАРСИНГ JSON
    //         // Превращаем строку в Dictionary<string, List<int>>
    //         var roomsData = JsonSerializer.Deserialize<Dictionary<string, List<int>>>(jsonString);

    //         if (roomsData == null) return;

    //         var userId = new UserId(Guid.NewGuid()); // Допустим, бронит один "системный" юзер
    //         var date = new BookingDate(DateTime.UtcNow.AddDays(1)); // На завтра

    //         foreach (var entry in roomsData)
    //         {
    //             string roomName = entry.Key;      // Например, "612"
    //             List<int> pairs = entry.Value;    // Например, [2, 3, 1]

    //             Console.WriteLine($"Обработка аудитории {roomName}...");

    //             foreach (var pairNumber in pairs)
    //             {
    //                 // Создаем RoomStaticId. 
    //                 // ВНИМАНИЕ: Если у тебя RoomStaticId ждет Guid, "612" не проканает.
    //                 // Если ты переделал его под string (как LessonNumber), то всё ок.
    //                 var staticId = new RoomStaticId(roomName); 
    //                 var lesson = new LessonNumber(pairNumber);

    //                 // 2. СОЗДАНИЕ ОБЪЕКТА (Твоя рефлексия)
    //                 var testBooking = (RoomDynamic)Activator.CreateInstance(
    //                     typeof(RoomDynamic),
    //                     BindingFlags.NonPublic | BindingFlags.Instance,
    //                     null,
    //                     new object[] { staticId, userId, lesson, date },
    //                     null)!;

    //                 // Устанавливаем Id для MongoDB
    //                 var bookingId = Guid.NewGuid();
    //                 typeof(RoomDynamic).GetProperty("Id")?.SetValue(testBooking, new RoomDynamicId(bookingId));

    //                 // 3. СОХРАНЕНИЕ В БАЗУ
    //                 await _repository.CreateRoomDynamic(testBooking);
    //                 Console.WriteLine($"  - Пара №{pairNumber} добавлена.");
    //             }
    //         }

    //         Console.WriteLine("\n>>> ВСЕ ДАННЫЕ УСПЕШНО ЗАГРУЖЕНЫ <<<");
    //     }
    //     catch (Exception ex)
    //     {
    //         Console.ForegroundColor = ConsoleColor.Red;
    //         Console.WriteLine($"\nОШИБКА ПРИ ЗАГРУЗКЕ: {ex.Message}");
    //         Console.ResetColor();
    //     }
    // }

    public async Task RunUserTest()
    {
        Console.WriteLine("\n>>> НАЧАЛО ТЕСТИРОВАНИЯ UserMongoDB <<<");

        try
        {
            // 1. ПОДГОТОВКА ДАННЫХ
            // Создаем Login через фабричный метод (он публичный)
            var login = Login.CreateLogin("Иван", "Иванов", "ivan_test_" + Guid.NewGuid().ToString().Substring(0, 5));
            var passwordHash = new PasswordHash("super_secret_hash_123");
            var role = UserRole.User;

            // Создаем User через рефлексию (так как конструктор User(login, pass, role) может быть приватным или внутренним)
            var testUser = (User)Activator.CreateInstance(
                typeof(User),
                BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.Public,
                null,
                new object[] { login, passwordHash, role },
                null)!;

            // Устанавливаем Id для пользователя
            var userIdValue = Guid.NewGuid();
            typeof(User).GetProperty("Id")?.SetValue(testUser, new UserId(userIdValue));

            // 2. ТЕСТ: CreateUser
            Console.WriteLine($"[TEST 1]: Создание пользователя {login.LoginUser}...");
            var createdUser = await _userRepository.CreateUser(testUser);
            if (createdUser != null)
                Console.WriteLine("✓ Успешно сохранено.");
            else
                throw new Exception("Ошибка: Репозиторий вернул null при создании (возможно, дубликат).");

            // 3. ТЕСТ: GetByLogin
            Console.WriteLine("[TEST 2]: Поиск по логину...");
            var foundByLogin = await _userRepository.GetByLogin(login.LoginUser);
            if (foundByLogin != null && foundByLogin.Login.LoginUser == login.LoginUser)
                Console.WriteLine($"✓ Найдено! Имя: {foundByLogin.Login.FirstName} {foundByLogin.Login.SecondName}");
            else
                throw new Exception("Ошибка: Пользователь по логину не найден.");

            // 4. ТЕСТ: GetById
            Console.WriteLine("[TEST 3]: Поиск по ID...");
            var foundById = await _userRepository.GetById(userIdValue);
            if (foundById != null && foundById.Id.Value == userIdValue)
                Console.WriteLine($"✓ Найдено! ID совпадает: {foundById.Id.Value}");
            else
                throw new Exception("Ошибка: Пользователь по ID не найден.");

            // 5. ТЕСТ: Проверка пароля (Value Object)
            Console.WriteLine("[TEST 4]: Проверка целостности данных...");
            if (foundByLogin.PasswordHash.Value == passwordHash.Value)
                Console.WriteLine("✓ Хеш пароля совпадает.");
            else
                throw new Exception("Ошибка: Данные пароля искажены при сохранении/загрузке.");

            Console.WriteLine("\n>>> ВСЕ ТЕСТЫ UserMongoDB ПРОЙДЕНЫ УСПЕШНО <<<");
        }
        catch (Exception ex)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"\nОШИБКА ТЕСТЕРА: {ex.Message}");
            if (ex.InnerException != null) 
                Console.WriteLine($"Внутренняя ошибка: {ex.InnerException.Message}");
            Console.ResetColor();
        }
    }
}