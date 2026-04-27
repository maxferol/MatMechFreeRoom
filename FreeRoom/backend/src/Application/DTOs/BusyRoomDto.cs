namespace FreeRoom.backend.src.Application.DTOs;

public record BusyRoomDto(
    int RoomNumber,
    int LessonNumber,
    DateTime BookingDate
);