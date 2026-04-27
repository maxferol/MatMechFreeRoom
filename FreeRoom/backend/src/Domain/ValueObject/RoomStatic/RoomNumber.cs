namespace FreeRoom.backend.src.Domain.Value_Object.RoomStatic;

public class RoomNumber
{
    readonly static int MinRoomNumber = 100; //потом поменяем
    readonly static int MaxRoomNumber = 300; //потом поменяем
    private static bool[] UsedRoomNumbers = new bool[MaxRoomNumber + 1];
    
    public int Value { get; }

    // private CountComputer() // для сериализации бд
    // {
    //     Count = 0;
    // }

    public RoomNumber(int value)
    {
        if (value < MinRoomNumber || value > MaxRoomNumber)
            throw new ArgumentOutOfRangeException($"Номер комнаты не входит в заданный диапазон [{MinRoomNumber},{MaxRoomNumber}]", nameof(value));
        if (UsedRoomNumbers[value])
            throw new ArgumentException("Аудитория с таким номером уже есть", nameof(value));
        Value = value;
    }
}