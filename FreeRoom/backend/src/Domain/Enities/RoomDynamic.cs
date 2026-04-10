using FreeRoom.backend.src.Domain.Value_Object.RoomDynamic;
using FreeRoom.backend.src.Domain.Value_Object.RoomDynamic;

namespace FreeRoom.backend.src.Domain.Enities;

public class RoomDynamic
{
    public RoomStatic RoomStatic { get; private set; }
    
    public User User { get; private set; }
    public LessonNumber LessonNumber { get; private set; }
    public BookingDate BookingDate { get; private set; }

    public static List<RoomDynamic> BookingRoomList { get; private set; } = new List<RoomDynamic>();

    private RoomDynamic(RoomStatic roomStatic, User user ,LessonNumber lessonNumber, BookingDate bookingDate)
    {
        LessonNumber = lessonNumber;
        BookingDate = bookingDate;
        RoomStatic = roomStatic;
        User = user;
    }

    private RoomDynamic()
    {
        LessonNumber = null!;
        BookingDate = null!;
    }

    public static RoomDynamic BookARoom(RoomStatic roomStatic, User user, LessonNumber lessonNumber, BookingDate bookingDate) //забронить нужную аудиторию
    {
        var newRoomDynamic = new RoomDynamic(roomStatic, user, lessonNumber, bookingDate);
        if (!BookingRoomList.Any(x => x.RoomStatic == roomStatic && x.LessonNumber == lessonNumber && x.BookingDate == bookingDate))
        {
            BookingRoomList.Add(newRoomDynamic);
            return newRoomDynamic;
        }

        throw new Exception("Такая аудитория уже забронирована!");
    }
}