public class BookingDate
{
    private static DateTime MinDateBooking => DateTime.UtcNow.Date; 
    private static DateTime MaxDateBooking => MinDateBooking.AddDays(7);

    public DateTime Value { get; }

    public BookingDate(DateTime value)
    {
        var dateToCheck = value.ToUniversalTime().Date;

        if (dateToCheck < MinDateBooking || dateToCheck > MaxDateBooking)
            throw new ArgumentOutOfRangeException(nameof(value), 
                $"Время бронирования {dateToCheck} не попадает в диапазон: [{MinDateBooking}, {MaxDateBooking}]");
        
        Value = dateToCheck;
    }
}