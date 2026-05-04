using FreeRoom;
using FreeRoom.backend.src.Infrastructure;
using FreeRoom.backend.src.Infrastructure.RoomStorage;
using FreeRoom.backend.src.Infrastructure.UserStorage;
using FreeRoom.backend.src.Domain.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// 1. Сервисы
builder.Services.AddControllers();
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));

// Параметры БД
var connectionString = "mongodb+srv://pashathelooser:looserpassword@cluster0.wliy5xk.mongodb.net/?appName=Cluster0";
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

app.MapGet("/admin/load-schedule", async () =>
{
    try
    {
        
        var databaseName = "FreeRoom";
        
        var parser = new ScheduleParser(connectionString, databaseName);
        string scheduleJsonPath = Path.Combine(Directory.GetCurrentDirectory(), "schedule_week.json");
        
        if (!File.Exists(scheduleJsonPath))
        {
            return Results.NotFound("Файл schedule_week.json не найден");
        }
        
        await parser.LoadScheduleFromJsonFile(scheduleJsonPath);
        return Results.Ok("Расписание успешно загружено в MongoDB Atlas!");
    }
    catch (Exception ex)
    {
        return Results.Problem($"Ошибка: {ex.Message}");
    }
});

app.MapControllers();


// try
// {
//     var parser = new ScheduleParser(connectionString, databaseName);
//     
//     // Путь к файлу с расписанием
//     string scheduleJsonPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "schedule_week.json");
//     
//     // Альтернативный путь -从 корня проекта
//     if (!File.Exists(scheduleJsonPath))
//     {
//         scheduleJsonPath = Path.Combine(Directory.GetCurrentDirectory(), "schedule_week.json");
//     }
//     
//     if (File.Exists(scheduleJsonPath))
//     {
//         await parser.LoadScheduleFromJsonFile(scheduleJsonPath);
//     }
// }
// catch (Exception ex)
// {
//     Console.WriteLine($"❌ Ошибка при загрузке расписания: {ex.Message}");
// }


// var tester = new UserMongoTester(connectionString, databaseName);
// await tester.RunUserTest();

app.Run();