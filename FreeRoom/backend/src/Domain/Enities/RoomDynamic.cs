using FreeRoom.backend.src.Domain.Value_Object.RoomDynamic;
using FreeRoom.backend.src.Infrastructure.GetEntitiesId;

namespace FreeRoom.backend.src.Domain.Enities;

public class RoomDynamic
{
    public RoomStaticId RoomStaticId { get; private set; }
    public RoomDynamicId Id { get; private set; } = default!;
    public UserId UserId { get; private set; }
    public LessonNumber LessonNumber { get; private set; }
    public BookingDate BookingDate { get; private set; }

    public static List<RoomDynamic> BookingRoomList { get; private set; } = new List<RoomDynamic>();

    private RoomDynamic(RoomStaticId roomStaticId, UserId userId, LessonNumber lessonNumber, BookingDate bookingDate)
    {
        LessonNumber = lessonNumber;
        BookingDate = bookingDate;
        RoomStaticId = roomStaticId;
        UserId = userId;
    }

    private RoomDynamic()
    {
        LessonNumber = null!;
        BookingDate = null!;
    }

    public static RoomDynamic BookARoom(RoomStaticId roomStaticId, UserId userId, LessonNumber lessonNumber, BookingDate bookingDate) //забронить нужную аудиторию
    {
        var newRoomDynamic = new RoomDynamic(roomStaticId, userId, lessonNumber, bookingDate);
        if (!BookingRoomList.Any(x => x.RoomStaticId == roomStaticId && x.LessonNumber == lessonNumber && x.BookingDate == bookingDate))
        {
            BookingRoomList.Add(newRoomDynamic);
            return newRoomDynamic;
        }

        throw new Exception("Такая аудитория уже забронирована!");
    }
}