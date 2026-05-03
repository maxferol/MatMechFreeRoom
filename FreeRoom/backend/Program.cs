using FreeRoom.backend.src.Infrastructure;
using FreeRoom.backend.src.Infrastructure.RoomStorage;
using FreeRoom.backend.src.Infrastructure.UserStorage;
using FreeRoom.backend.src.Domain.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// 1. Сервисы
builder.Services.AddControllers();
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));

// Параметры БД
var connectionString = "mongodb://localhost:27017";
var databaseName = "FreeRoom";

// 2. Регистрация репозиториев
builder.Services.AddSingleton<IRoomDynamicRepository>(sp => 
    new RoomDynamicMongoDB(connectionString, databaseName));

// РАСКОММЕНТИРУЙТЕ И ИСПРАВЬТЕ регистрацию пользователей
builder.Services.AddSingleton<UserMongoDB>(sp => 
    new UserMongoDB(connectionString, databaseName));

// Если есть интерфейс IUserRepository, раскомментируйте и эту строку
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

// 4. Настройка middleware (ВАЖНЫЙ ПОРЯДОК!)
app.UseCors("AllowAll"); // CORS должен быть ПЕРЕД UseRouting в некоторых версиях, но после - в других
app.UseRouting();

// Отладочный middleware
app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/api/users/register"))
    {
        Console.WriteLine($"=== ПОЛУЧЕН ЗАПРОС К {context.Request.Path} ===");
        context.Request.EnableBuffering();
        var body = await new StreamReader(context.Request.Body).ReadToEndAsync();
        Console.WriteLine($"Body: {body}");
        context.Request.Body.Position = 0;
    }
    await next();
});

app.MapControllers();

Console.WriteLine("Сервер запущен на http://localhost:5000");

//5. Заполнение данными
string rawJson = "{\"509\": [3, 6, 5, 4], \"611\": [2, 3, 4, 5], \"601\": [4, 3, 1, 2, 5], \"628\": [4, 2, 7, 5], \"517\": [4, 3, 5, 2, 1], \"602\": [3, 4], \"526\": [3], \"528\": [2, 4, 3], \"625\": [4, 1, 2, 3, 5, 6], \"608\": [4, 1, 2, 5, 3], \"623\": [3, 4, 1, 2, 5], \"513\": [2, 3, 4], \"532\": [2, 3, 1], \"605\": [1, 2, 3, 5], \"622а\": [5, 3, 2, 4, 1], \"511\": [4, 2, 3, 1, 5], \"515\": [5, 3, 4, 1, 2], \"612\": [1, 4, 5, 2, 3], \"632\": [4, 3, 6], \"514\": [3, 1, 4, 2, 5], \"622\": [5, 3, 2], \"621\": [3, 4, 2, 6], \"518\": [6]}";
var tester = new RoomDynamicTester(connectionString, databaseName);
var date = DateTime.UtcNow.Date;
var normalDate = date.Date;
await tester.CreateRoomsFromJson(rawJson, normalDate);


// var tester = new UserMongoTester(connectionString, databaseName);
// await tester.RunUserTest();

app.Run();