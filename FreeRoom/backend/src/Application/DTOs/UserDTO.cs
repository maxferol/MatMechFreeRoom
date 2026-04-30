namespace FreeRoom.backend.src.Application.DTOs;

public record CreateUserRequest(
    string FirstName,
    string SecondName,
    string Login,
    string Password,
    string Role
);