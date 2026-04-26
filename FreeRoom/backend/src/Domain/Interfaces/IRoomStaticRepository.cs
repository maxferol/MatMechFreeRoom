// src/Domain/Interfaces/IRoomStaticRepository.cs
using FreeRoom.backend.src.Domain.Enities;
using FreeRoom.backend.src.Infrastructure.GetEntitiesId;

namespace FreeRoom.backend.src.Domain.Interfaces;

public interface IRoomStaticRepository
{
    Task<RoomStatic?> GetById(Guid id);
    Task<RoomStatic?> GetByRoomNumber(string roomNumber);
    Task<List<RoomStatic>> GetAll();
    Task<List<string>> GetRoomNumbersByIds(List<RoomStaticId> ids);
}