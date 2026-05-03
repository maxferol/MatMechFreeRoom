using MediatR;
using FreeRoom.backend.src.Application.DTOs;

namespace FreeRoom.backend.src.Application.Users.Commands.CreateUser;

// Возвращаем Guid нового пользователя или null в случае неудачи
public record CreateUserCommand(CreateUserRequest Data) : IRequest<Guid?>;