using FreeRoom.backend.src.Infrastructure;
using FreeRoom.backend.src.Infrastructure.RoomStorage;
using FreeRoom.backend.src.Domain.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Добавляем контроллеры
builder.Services.AddControllers();

// Добавляем MediatR (сканирует все обработчики в проекте)
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));

// Регистрируем репозитории
var connectionString = "mongodb://localhost:27017";
var databaseName = "FreeRoomDB";

builder.Services.AddSingleton<IRoomDynamicRepository>(sp => 
    new RoomDynamicMongoDB(connectionString, databaseName));

// Добавляем CORS (важно для фронтенда)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()
                .AllowAnyMethod()
                .AllowAnyHeader();
        });
});

var app = builder.Build();

// Настройка middleware
app.UseCors("AllowAll");
app.UseRouting();
app.MapControllers();

// Заполнение тестовыми данными (опционально)
string rawJson = "{\"612\": [2, 3, 1, 7, 6], \"625\": [2, 3, 6, 4, 5], \"623\": [2, 1, 3, 4], \"632\": [3, 1, 2, 4, 7, 6, 5], \"621\": [1, 2, 5, 6, 3], \"622\": [3, 1, 2], \"628\": [3, 4, 5, 2], \"602\": [3, 2], \"608\": [3, 2, 6], \"622а\": [3, 2, 4], \"601\": [3, 2, 4], \"605\": [2, 3, 4, 6], \"611\": [4, 5, 3, 2, 1, 7, 6], \"614\": [3]}";
var tester = new RoomDynamicTester(connectionString, databaseName);
await tester.CreateRoomsFromJson(rawJson);

app.Run();