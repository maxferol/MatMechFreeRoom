namespace FreeRoom.backend.src.Application.DTOs;

public record BusyRoomDto(
    string RoomNumber,
    int LessonNumber,
    DateTime BookingDate
);