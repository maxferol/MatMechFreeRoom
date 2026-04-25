using FreeRoom.backend.src.Domain.Enities;

namespace FreeRoom.backend.src.Domain.Interfaces;

public interface IRoomDynamicRepository
{
    Task<List<RoomDynamic>> GetBySubjectId(Guid subjectId);
    Task<List<RoomDynamic>> GetAll();
    Task<RoomDynamic?> GetByNameRoomDynamic(string nameRoomDynamic);
    Task<bool> DeleteRoomDynamic(Guid id);
    Task<RoomDynamic?> GetByIdRoomDynamic(Guid id);
    Task<RoomDynamic> CreateRoomDynamic(RoomDynamic material);
    
    Task<RoomDynamic?> UpdateRoomDynamic(RoomDynamic material);
    Task<List<RoomDynamic>> SearchAsync(string searchText);
    
    Task<bool> IncrementViewCountAsync(Guid id);
    Task<bool> IncrementDownloadCountAsync(Guid id);
}