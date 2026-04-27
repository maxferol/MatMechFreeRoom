using FreeRoom.backend.src.Infrastructure;
using FreeRoom.backend.src.Infrastructure.RoomStorage;
using FreeRoom.backend.src.Domain.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// 1. Сервисы
builder.Services.AddControllers();
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));

// Параметры БД
var connectionString = "mongodb://localhost:27017";
var databaseName = "FreeRoomDB";

// 2. Регистрация репозиториев
builder.Services.AddSingleton<IRoomDynamicRepository>(sp => 
    new RoomDynamicMongoDB(connectionString, databaseName));

// // Добавляем репозиторий пользователей
// builder.Services.AddSingleton<IUserRepository>(sp => 
//     new UserMongoDB(connectionString, databaseName));

// 3. Настройка CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// 4. Настройка Middleware (ПОРЯДОК ВАЖЕН!)
app.UseRouting(); // Сначала роутинг

// CORS должен быть строго ПОСЛЕ UseRouting и ПЕРЕД MapControllers
app.UseCors("AllowAll"); 

app.UseAuthorization(); // Полезно добавить на будущее
app.MapControllers();

// 5. Заполнение данными
string rawJson = "{\"612\": [2, 3, 1, 7, 6], \"625\": [2, 3, 6, 4, 5], \"623\": [2, 1, 3, 4], \"632\": [3, 1, 2, 4, 7, 6, 5], \"621\": [1, 2, 5, 6, 3], \"622\": [3, 1, 2], \"628\": [3, 4, 5, 2], \"602\": [3, 2], \"608\": [3, 2, 6], \"622а\": [3, 2, 4], \"601\": [3, 2, 4], \"605\": [2, 3, 4, 6], \"611\": [4, 5, 3, 2, 1, 7, 6], \"614\": [3]}";
var tester = new RoomDynamicTester(connectionString, databaseName);
await tester.CreateRoomsFromJson(rawJson);

app.Run();