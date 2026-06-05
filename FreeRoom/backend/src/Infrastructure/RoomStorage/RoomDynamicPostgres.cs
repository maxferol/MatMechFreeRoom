using FreeRoom.backend.src.Domain.Enities;
using FreeRoom.backend.src.Domain.Interfaces;
using FreeRoom.backend.src.Infrastructure;
using FreeRoom.backend.src.Infrastructure.GetEntitiesId;
using Microsoft.EntityFrameworkCore;

namespace FreeRoom.backend.src.Infrastructure.RoomStorage;

public class RoomDynamicPostgres : IRoomDynamicRepository
{
    private readonly FreeRoomDbContext _context;

    public RoomDynamicPostgres(FreeRoomDbContext context)
    {
        _context = context;
    }

    public Task InitializeAsync() => _context.Database.EnsureCreatedAsync();

    public async Task<RoomDynamic> CreateRoomDynamic(RoomDynamic roomDynamic)
    {
        ArgumentNullException.ThrowIfNull(roomDynamic);

        await _context.RoomDynamics.AddAsync(roomDynamic);
        await _context.SaveChangesAsync();
        return roomDynamic;
    }

    public Task<RoomDynamic?> GetByIdRoomDynamic(Guid id) =>
        _context.RoomDynamics.FirstOrDefaultAsync(
            roomDynamic => roomDynamic.Id == new RoomDynamicId(id));

    public Task<RoomDynamic?> GetByNumberRoomDynamic(string roomDynamicNumber) =>
        Task.FromResult<RoomDynamic?>(null);

    public Task<RoomDynamic?> UpdateRoomDynamic(RoomDynamic roomDynamic) =>
        Task.FromResult<RoomDynamic?>(null);

    public Task<List<RoomDynamic>> GetAll() =>
        _context.RoomDynamics.ToListAsync();

    public Task<RoomDynamic> Create(RoomDynamic roomDynamic) =>
        throw new NotImplementedException();

    public async Task<bool> DeleteRoomDynamic(Guid id) =>
        await _context.RoomDynamics
            .Where(roomDynamic => roomDynamic.Id == new RoomDynamicId(id))
            .ExecuteDeleteAsync() > 0;

    public async Task<bool> IncrementViewCountAsync(Guid id) =>
        await _context.RoomDynamics
            .Where(roomDynamic => roomDynamic.Id == new RoomDynamicId(id))
            .ExecuteUpdateAsync(setters => setters.SetProperty(
                roomDynamic => EF.Property<int>(roomDynamic, "ViewCount"),
                roomDynamic => EF.Property<int>(roomDynamic, "ViewCount") + 1)) > 0;
}
