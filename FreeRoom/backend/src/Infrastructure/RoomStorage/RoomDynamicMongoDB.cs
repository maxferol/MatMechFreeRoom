using FreeRoom.backend.src.Domain.Interfaces;
using FreeRoom.backend.src.Domain.Enities;
using MongoDB.Driver;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using FreeRoom.backend.src.Domain.Value_Object.RoomDynamic;
using FreeRoom.backend.src.Infrastructure.GetEntitiesId;
using FreeRoom.backend.src.Domain.Value_Object.RoomStatic;

namespace FreeRoom.backend.src.Infrastructure.RoomStorage;

public class RoomDynamicMongoDB : IRoomDynamicRepository
{
    private readonly IMongoCollection<BsonDocument> CollectionRoomDynamic;
    public RoomDynamicMongoDB(string connectionString, string databaseName)
    {
        var client = new MongoClient(connectionString);
        var database = client.GetDatabase(databaseName);
        CollectionRoomDynamic = database.GetCollection<BsonDocument>("RoomDynamics");
        Console.WriteLine($"MongoDB подключен: {databaseName}");
        
        //CreateIndexes();
    }
    
    //public async Task<RoomDynamic> CreateMaterial(RoomDynamic material)
    // private void CreateIndexes()
    // {
    //     try
    //     {
    //         var idIndex = Builders<RoomDynamic>.IndexKeys.Ascending(m => m.Id);
    //         RoomDynamics.Indexes.CreateOne(new CreateIndexModel<RoomDynamic>
    //             (idIndex, new CreateIndexOptions { Unique = true })
    //         );
    //         Console.WriteLine("Создан уникальный индекс по Id");
    //         
    //         var subjectIdIndex = Builders<RoomDynamic>.IndexKeys.Ascending(m => m.SubjectId);
    //         RoomDynamics.Indexes.CreateOne(
    //             new CreateIndexModel<RoomDynamic>(subjectIdIndex)
    //         );
    //         Console.WriteLine("Создан индекс по SubjectId");
    //         
    //         var userIdIndex = Builders<RoomDynamic>.IndexKeys.Ascending(m => m.UserId);
    //         RoomDynamics.Indexes.CreateOne(
    //             new CreateIndexModel<RoomDynamic>(userIdIndex)
    //         );
    //         Console.WriteLine("Создан индекс по UserId");
    //     }
    //     
    //     catch (Exception ex)
    //     {
    //         Console.WriteLine($"Ошибка создания индексов");
    //         Console.WriteLine($"Тип ошибки: {ex.GetType().Name}");
    //         
    //     }
    // }

    public async Task<RoomDynamic> CreateRoomDynamic(RoomDynamic roomDynamic)
    {
        try
        {
            if (roomDynamic == null)
                throw new ArgumentNullException(nameof(roomDynamic), "RoomDynamic не должен быть null");
            if (await GetByEqualsRoom(roomDynamic) != null)
            {
                Console.WriteLine("Такая аудитория уже есть!");
                return null;
            }

            var bsonDocument = new BsonDocument
            {
                { "roomDynamicId", roomDynamic.Id.Value.ToString() },
                { "roomStaticId", roomDynamic.RoomStaticId.Value.ToString() },
                { "userId", roomDynamic.UserId.Value.ToString() },
                { "lessonNumber", roomDynamic.LessonNumber.Value },
                { "bookingDate", roomDynamic.BookingDate.Value }
            };
            
            await CollectionRoomDynamic.InsertOneAsync(bsonDocument);
            Console.WriteLine($"Аудитория сохранена в MongoDB!");
            return roomDynamic;
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
            Console.WriteLine(ex.GetType().Name);
            throw;
        }
    }

    public async Task<RoomDynamic?> GetByRoomStaticId(string idRoomStatic)
    {
        try
        {
            var filter = Builders<BsonDocument>.Filter.Eq("roomStaticId", idRoomStatic);
            var document = await CollectionRoomDynamic.Find(filter).FirstOrDefaultAsync();
            if (document == null)
                return null;
            return MapToRoomDynamic(document);
        }
        catch (Exception ex)
        {
            throw new Exception($"Ошибка при получении аудитории: {ex.Message}", ex);
        }
    }

    public async Task<RoomDynamic?> GetByEqualsRoom(RoomDynamic roomDynamic)
    {
        try
        {
            var filterBuilder = Builders<BsonDocument>.Filter;
            var filter = filterBuilder.And(
                filterBuilder.Eq("bookingDate", roomDynamic.BookingDate.Value),
                filterBuilder.Eq("roomStaticId", roomDynamic.RoomStaticId.ToString()),
                filterBuilder.Eq("lessonNumber", roomDynamic.LessonNumber.Value)
            );

            var document = await CollectionRoomDynamic.Find(filter).FirstOrDefaultAsync();
            if (document == null)
                return null;
            return MapToRoomDynamic(document);
        }
        catch (Exception ex)
        {
            throw new Exception($"Ошибка при получении аудитории: {ex.Message}", ex);
        }
    }
    
    public async Task<RoomDynamic?> GetByNumberRoomDynamic(string RoomDynamicNumber)
    {
        try
        {
            var filter = Builders<BsonDocument>.Filter.Eq("name", RoomDynamicNumber);
            var document = await CollectionRoomDynamic.Find(filter).FirstOrDefaultAsync();
            if (document == null)
                return null;
            return MapToRoomDynamic(document);
        }
        catch (Exception ex)
        {
            throw new Exception($"Ошибка при получении аудитории по номеру: {ex.Message}", ex);
        }
    }

    // public async Task<List<RoomDynamic>> GetBySubjectId(Guid subjectId)
    // {
    //     try
    //     {
    //         var filter = Builders<BsonDocument>.Filter.Eq("subjectId", subjectId.ToString());
    //         var documents = await CollectionRoomDynamic.Find(filter).ToListAsync();
    //         return documents.Select(MapToRoomDynamic).ToList();
    //     }
    //     catch (Exception ex)
    //     {
    //         Console.WriteLine($"Ошибка при получении материалов по subjectId: {ex.Message}");
    //         return new List<RoomDynamic>();
    //     }
    // }

    public async Task<RoomDynamic?> UpdateRoomDynamic(RoomDynamic roomDynamic) //пока херня
    {
        try
        {
            return null;
        }
        catch (Exception ex)
        {
            throw new Exception($"Ошибка при получении аудитории: {ex.Message}", ex);
        }
    }

    public async Task<List<RoomDynamic>> GetAll()
    {
        var result = new List<RoomDynamic>();
        try
        {
            var documents = await CollectionRoomDynamic.Find(new BsonDocument()).ToListAsync();
            foreach (var doc in documents)
            {
                try
                {
                    result.Add(MapToRoomDynamic(doc));
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Ошибка маппинга документа {doc.GetValue("_id", "unknown")}: {ex.Message}");
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Ошибка при получении всех аудиторий: {ex.Message}");
        }
        return result;
    }

    // public async Task<List<RoomDynamic>> SearchAsync(string searchText)
    // {
    //     var result = new List<RoomDynamic>();
    //     try
    //     {
    //         var filter = Builders<BsonDocument>.Filter.Regex("name", new BsonRegularExpression(searchText, "i")) |
    //                      Builders<BsonDocument>.Filter.Regex("description", new BsonRegularExpression(searchText, "i"));
    //
    //         var documents = await CollectionRoomDynamic.Find(filter).ToListAsync();
    //         foreach (var doc in documents)
    //         {
    //             try
    //             {
    //                 result.Add(MapToRoomDynamic(doc));
    //             }
    //             catch (Exception ex)
    //             {
    //                 Console.WriteLine($"Ошибка маппинга документа {doc.GetValue("_id", "unknown")}: {ex.Message}");
    //             }
    //         }
    //     }
    //     catch (Exception ex)
    //     {
    //         Console.WriteLine($"Ошибка при поиске материалов: {ex.Message}");
    //     }
    //     return result;
    // }

    public Task<RoomDynamic> Create(RoomDynamic roomDynamic) // пока херня
    {
        throw new NotImplementedException();
    }

    public async Task<bool> DeleteRoomDynamic(Guid id)
    {
        try
        {
            var filter = Builders<BsonDocument>.Filter.Eq("roomDynamicId", id.ToString());
            var result = await CollectionRoomDynamic.DeleteOneAsync(filter);
            return result.DeletedCount > 0;
        }
        catch (Exception ex)
        {
            throw new Exception($"Ошибка при удалении аудитории: {ex.Message}", ex);
        }
    }

    private static RoomDynamic MapToRoomDynamic(BsonDocument document)
    {
        // 1. Создаем необходимые Value Objects из документа
        var roomStaticId = new RoomStaticId(document["roomStaticId"].AsString);
        var userId = new UserId(Guid.Parse(document["userId"].AsString));
        var lessonNumber = new LessonNumber(document["lessonNumber"].AsInt32);
        var bookingDate = new BookingDate(document["bookingDate"].ToUniversalTime());

        // 2. Вызываем приватный конструктор через рефлексию
        var roomDynamic = (RoomDynamic)Activator.CreateInstance(
            typeof(RoomDynamic), 
            System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance, 
            null, 
            new object[] { roomStaticId, userId, lessonNumber, bookingDate }, 
            null)!;

        // 3. Устанавливаем Id (так как он не в конструкторе, а инициализируется отдельно)
        var idProperty = typeof(RoomDynamic).GetProperty("Id");
        if (document.Contains("roomDynamicId"))
        {
            var idValue = new RoomDynamicId(Guid.Parse(document["roomDynamicId"].AsString));
            idProperty?.SetValue(roomDynamic, idValue);
        }

        return roomDynamic;
    }

    public async Task<bool> IncrementViewCountAsync(Guid id)
    {
        try
        {
            var filter = Builders<BsonDocument>.Filter.Eq("roomDynamicId", id.ToString());
            var update = Builders<BsonDocument>.Update.Inc("viewCount", 1);
            var result = await CollectionRoomDynamic.UpdateOneAsync(filter, update);
            return result.ModifiedCount > 0;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Ошибка при увеличении счетчика бронирований: {ex.Message}");
            return false;
        }
    }

    // public async Task<bool> IncrementDownloadCountAsync(Guid id)
    // {
    //     try
    //     {
    //         var filter = Builders<BsonDocument>.Filter.Eq("roomDynamicId", id.ToString());
    //         var update = Builders<BsonDocument>.Update.Inc("downloadCount", 1);
    //         var result = await CollectionRoomDynamic.UpdateOneAsync(filter, update);
    //         return result.ModifiedCount > 0;
    //     }
    //     catch (Exception ex)
    //     {
    //         Console.WriteLine($"Ошибка при увеличении счетчика скачиваний: {ex.Message}");
    //         return false;
    //     }
    // }
}