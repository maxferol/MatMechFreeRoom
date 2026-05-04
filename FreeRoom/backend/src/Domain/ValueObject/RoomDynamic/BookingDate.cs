public class BookingDate
{
    public DateTime Value { get; private set; }

    public BookingDate(DateTime value)
    {
        // Принимаем любую дату, просто сохраняем ее как DateTimeKind.Local
        if (value.Kind == DateTimeKind.Utc)
        {
            // Если пришла UTC, конвертируем в локальную
            Value = value.ToLocalTime().Date;
        }
        else
        {
            Value = value.Date;
        }
    }
    
    public override string ToString() => Value.ToString("yyyy-MM-dd");
}