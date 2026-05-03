namespace FreeRoom.backend.src.Domain.Value_Object.RoomDynamic;

public class BookingDate
{
    readonly static DateTime MinDateBooking = DateTime.Now.Date;
    readonly static DateTime MaxDateBooking = MinDateBooking + TimeSpan.FromDays(3);
    public DateTime Value { get; }
    
    //private BookingDate() { }

    public BookingDate(DateTime value)
    {
        if (value < MinDateBooking || value > MaxDateBooking)
            throw new ArgumentOutOfRangeException($"Время бронирования не попадает в заданный диапазон: [{MinDateBooking},{MaxDateBooking}]",nameof(value));
        Value = value;
    }
}