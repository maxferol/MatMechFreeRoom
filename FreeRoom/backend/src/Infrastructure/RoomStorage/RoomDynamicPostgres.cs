using System.Reflection;
using FreeRoom.backend.src.Domain.Enities;
using FreeRoom.backend.src.Domain.Interfaces;
using FreeRoom.backend.src.Domain.Value_Object.RoomDynamic;
using FreeRoom.backend.src.Infrastructure.GetEntitiesId;
using Npgsql;
using NpgsqlTypes;

namespace FreeRoom.backend.src.Infrastructure.RoomStorage;

public class RoomDynamicPostgres : IRoomDynamicRepository
{
    private readonly string _connectionString;

    public RoomDynamicPostgres(string connectionString)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(connectionString);
        _connectionString = connectionString;
    }

    public async Task InitializeAsync()
    {
        const string sql = """
            CREATE TABLE IF NOT EXISTS room_dynamics (
                room_dynamic_id UUID PRIMARY KEY,
                room_static_id UUID NOT NULL,
                user_id UUID NOT NULL,
                lesson_number INTEGER NOT NULL,
                booking_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
                view_count INTEGER NOT NULL DEFAULT 0
            );
            """;

        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();
        await using var command = new NpgsqlCommand(sql, connection);
        await command.ExecuteNonQueryAsync();
    }

    public async Task<RoomDynamic> CreateRoomDynamic(RoomDynamic roomDynamic)
    {
        ArgumentNullException.ThrowIfNull(roomDynamic);

        const string sql = """
            INSERT INTO room_dynamics
                (room_dynamic_id, room_static_id, user_id, lesson_number, booking_date)
            VALUES
                (@room_dynamic_id, @room_static_id, @user_id, @lesson_number, @booking_date);
            """;

        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();
        await using var command = new NpgsqlCommand(sql, connection);
        AddRoomDynamicParameters(command, roomDynamic);
        await command.ExecuteNonQueryAsync();
        return roomDynamic;
    }

    public async Task<RoomDynamic?> GetByIdRoomDynamic(Guid id)
    {
        const string sql = """
            SELECT room_dynamic_id, room_static_id, user_id, lesson_number, booking_date
            FROM room_dynamics
            WHERE room_dynamic_id = @id;
            """;

        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();
        await using var command = new NpgsqlCommand(sql, connection);
        command.Parameters.AddWithValue("id", NpgsqlDbType.Uuid, id);
        await using var reader = await command.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapToRoomDynamic(reader) : null;
    }

    public Task<RoomDynamic?> GetByNumberRoomDynamic(string roomDynamicNumber) =>
        Task.FromResult<RoomDynamic?>(null);

    public Task<RoomDynamic?> UpdateRoomDynamic(RoomDynamic roomDynamic) =>
        Task.FromResult<RoomDynamic?>(null);

    public async Task<List<RoomDynamic>> GetAll()
    {
        const string sql = """
            SELECT room_dynamic_id, room_static_id, user_id, lesson_number, booking_date
            FROM room_dynamics;
            """;

        var result = new List<RoomDynamic>();
        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();
        await using var command = new NpgsqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            result.Add(MapToRoomDynamic(reader));

        return result;
    }

    public Task<RoomDynamic> Create(RoomDynamic roomDynamic) =>
        throw new NotImplementedException();

    public async Task<bool> DeleteRoomDynamic(Guid id)
    {
        const string sql = "DELETE FROM room_dynamics WHERE room_dynamic_id = @id;";

        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();
        await using var command = new NpgsqlCommand(sql, connection);
        command.Parameters.AddWithValue("id", NpgsqlDbType.Uuid, id);
        return await command.ExecuteNonQueryAsync() > 0;
    }

    public async Task<bool> IncrementViewCountAsync(Guid id)
    {
        const string sql = """
            UPDATE room_dynamics
            SET view_count = view_count + 1
            WHERE room_dynamic_id = @id;
            """;

        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();
        await using var command = new NpgsqlCommand(sql, connection);
        command.Parameters.AddWithValue("id", NpgsqlDbType.Uuid, id);
        return await command.ExecuteNonQueryAsync() > 0;
    }

    private static void AddRoomDynamicParameters(NpgsqlCommand command, RoomDynamic roomDynamic)
    {
        command.Parameters.AddWithValue("room_dynamic_id", NpgsqlDbType.Uuid, roomDynamic.Id.Value);
        command.Parameters.AddWithValue("room_static_id", NpgsqlDbType.Uuid, roomDynamic.RoomStaticId.Value);
        command.Parameters.AddWithValue("user_id", NpgsqlDbType.Uuid, roomDynamic.UserId.Value);
        command.Parameters.AddWithValue("lesson_number", NpgsqlDbType.Integer, roomDynamic.LessonNumber.Value);
        command.Parameters.AddWithValue("booking_date", NpgsqlDbType.Timestamp, roomDynamic.BookingDate.Value);
    }

    private static RoomDynamic MapToRoomDynamic(NpgsqlDataReader reader)
    {
        var roomStaticId = new RoomStaticId(reader.GetGuid(1));
        var userId = new UserId(reader.GetGuid(2));
        var lessonNumber = new LessonNumber(reader.GetInt32(3));
        var bookingDate = new BookingDate(reader.GetDateTime(4));

        var roomDynamic = (RoomDynamic)Activator.CreateInstance(
            typeof(RoomDynamic),
            BindingFlags.NonPublic | BindingFlags.Instance,
            null,
            new object[] { roomStaticId, userId, lessonNumber, bookingDate },
            null)!;

        typeof(RoomDynamic).GetProperty("Id")?.SetValue(
            roomDynamic,
            new RoomDynamicId(reader.GetGuid(0)));

        return roomDynamic;
    }
}
