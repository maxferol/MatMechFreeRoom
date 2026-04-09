namespace FreeRoom.backend.src.Domain.Value_Object.RoomStatic;

public class CountComputer
{
    private readonly int MinCount = 0;
    private readonly int MaxCount = 30; //потом поменяем
    
    public int Value { get; }

    // private CountComputer() // для сериализации бд
    // {
    //     Count = 0;
    // }

    public CountComputer(int value)
    {
        if (value < MinCount || value > MaxCount)
            throw new ArgumentOutOfRangeException("value must be between MinCount and MaxCount", nameof(value));
        Value = value;
    }
}