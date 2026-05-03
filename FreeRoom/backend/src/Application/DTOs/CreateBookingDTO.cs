namespace FreeRoom.backend.src.Application.DTOs;

public record CreateBookingDto(
    string Login,
    string RoomNumber,
    DateTime Date,
    int LessonNumber
);