using FreeRoom.backend.src.Domain.Enities;

namespace FreeRoom.backend.src.Domain.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByLogin(string login, CancellationToken cancellationToken = default);
    Task<List<RoomDynamic>> GetByUserAndDate(string login, DateTime date);
    Task<User> CreateUser(User user);
    Task<User?> GetById(Guid id, CancellationToken cancellationToken = default);
    Task Update(User user, CancellationToken cancellationToken = default);
}