namespace FreeRoom.backend.src.Application.DTOs;

public record UserBookingDto(
    string RoomNumber,
    int LessonNumber
);