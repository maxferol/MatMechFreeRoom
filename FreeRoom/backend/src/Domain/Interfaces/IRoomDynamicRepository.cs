using FreeRoom.backend.src.Domain.Enities;

namespace FreeRoom.backend.src.Domain.Interfaces;

public interface IRoomDynamicRepository
{
    Task<RoomDynamic> CreateRoomDynamic(RoomDynamic roomDynamic);
    Task<RoomDynamic?> GetByIdRoomDynamic(Guid id);
    Task<RoomDynamic?> GetByNumberRoomDynamic(string RoomDynamicNumber);
    Task<RoomDynamic?> UpdateRoomDynamic(RoomDynamic roomDynamic);
    Task<List<RoomDynamic>> GetAll();
    Task<RoomDynamic> Create(RoomDynamic roomDynamic);
    Task<bool> DeleteRoomDynamic(Guid id);
    Task<bool> IncrementViewCountAsync(Guid id);

}