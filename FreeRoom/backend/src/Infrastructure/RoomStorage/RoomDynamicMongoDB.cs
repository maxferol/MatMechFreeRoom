using FreeRoom.backend.src.Domain.Interfaces;
using FreeRoom.backend.src.Domain.Enities;
using MongoDB.Driver;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;

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
            
            var bsonDocument = new BsonDocument
            {
                { "roomDynamicId", roomDynamic.Id.Value.ToString() },
                { "subjectId", roomDynamic.SubjectId.Value.ToString() },
                { "userId", roomDynamic.UserId.Value.ToString() },
                { "name", roomDynamic.Name.Value },
                { "year", roomDynamic.Year.Value },
                { "semester", roomDynamic.Semester.Value },
                { "description", roomDynamic.Description },
                { "size", roomDynamic.Size.Size },
                { "roomDynamicType", roomDynamic.roomDynamicType.ToString() },
                { "filePath", roomDynamic.FilePath.Value },
                { "uploadedAt", roomDynamic.UploadedAt },
                { "viewCount", roomDynamic.ViewCount },
                { "downloadCount", roomDynamic.DownloadCount }
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

    public async Task<RoomDynamic?> GetByIdRoomDynamic(Guid id)
    {
        try
        {
            var filter = Builders<BsonDocument>.Filter.Eq("roomDynamicId", id.ToString());
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
    
    public async Task<RoomDynamic?> GetByNameRoomDynamic(string RoomDynamicName)
    {
        try
        {
            var filter = Builders<BsonDocument>.Filter.Eq("name", RoomDynamicName);
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

    public async Task<List<RoomDynamic>> GetBySubjectId(Guid subjectId)
    {
        try
        {
            var filter = Builders<BsonDocument>.Filter.Eq("subjectId", subjectId.ToString());
            var documents = await CollectionRoomDynamic.Find(filter).ToListAsync();
            return documents.Select(MapToRoomDynamic).ToList();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Ошибка при получении материалов по subjectId: {ex.Message}");
            return new List<RoomDynamic>();
        }
    }

    public async Task<RoomDynamic?> UpdateRoomDynamic(RoomDynamic roomDynamic)
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
            Console.WriteLine($"Ошибка при получении всех материалов: {ex.Message}");
        }
        return result;
    }

    public async Task<List<RoomDynamic>> SearchAsync(string searchText)
    {
        var result = new List<RoomDynamic>();
        try
        {
            var filter = Builders<BsonDocument>.Filter.Regex("name", new BsonRegularExpression(searchText, "i")) |
                         Builders<BsonDocument>.Filter.Regex("description", new BsonRegularExpression(searchText, "i"));

            var documents = await CollectionRoomDynamic.Find(filter).ToListAsync();
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
            Console.WriteLine($"Ошибка при поиске материалов: {ex.Message}");
        }
        return result;
    }

    public Task<RoomDynamic> Create(RoomDynamic roomDynamic)
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
            throw new Exception($"Ошибка при удалении материала: {ex.Message}", ex);
        }
    }

    private static RoomDynamic MapToRoomDynamic(BsonDocument document)
    {
        var name = new roomDynamicName(document["name"].AsString);
        var subjectId = new SubjectId(Guid.Parse(document["subjectId"].AsString));
        var userId = new UserId(Guid.Parse(document["userId"].AsString));
        var year = new StudyYear(document["year"].AsInt32);
        var size = new roomDynamicSize(document["size"].AsInt64);
        var roomDynamicType = Enum.Parse<roomDynamicType>(document["roomDynamicType"].AsString, ignoreCase: true);
        var filePath = new ResourceLocation(document["filePath"].AsString);
        var filePathIcon = new ResourceLocation(document["filePathIcon"].AsString);
        
        var semester = new Semester(document.Contains("semester") ? document["semester"].AsInt32 : 1);
        var description = document.Contains("description") ? document["description"].AsString : string.Empty;

        var roomDynamic = new RoomDynamic(name, subjectId, userId, year, semester, description, size, roomDynamicType, filePath, filePathIcon);
        
        var idProperty = typeof(RoomDynamic).GetProperty("Id");
        var uploadedAtProperty = typeof(RoomDynamic).GetProperty("UploadedAt");
        
        idProperty?.SetValue(roomDynamic, new RoomDynamicId(Guid.Parse(document["roomDynamicId"].AsString)));
        uploadedAtProperty?.SetValue(roomDynamic, document["uploadedAt"].ToUniversalTime());
        
        var viewCountProperty = typeof(RoomDynamic).GetProperty("ViewCount");
        var downloadCountProperty = typeof(RoomDynamic).GetProperty("DownloadCount");
        viewCountProperty?.SetValue(roomDynamic, document.Contains("viewCount") ? document["viewCount"].AsInt32 : 0);
        downloadCountProperty?.SetValue(roomDynamic, document.Contains("downloadCount") ? document["downloadCount"].AsInt32 : 0);

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
            Console.WriteLine($"Ошибка при увеличении счетчика просмотров: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> IncrementDownloadCountAsync(Guid id)
    {
        try
        {
            var filter = Builders<BsonDocument>.Filter.Eq("roomDynamicId", id.ToString());
            var update = Builders<BsonDocument>.Update.Inc("downloadCount", 1);
            var result = await CollectionRoomDynamic.UpdateOneAsync(filter, update);
            return result.ModifiedCount > 0;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Ошибка при увеличении счетчика скачиваний: {ex.Message}");
            return false;
        }
    }
}