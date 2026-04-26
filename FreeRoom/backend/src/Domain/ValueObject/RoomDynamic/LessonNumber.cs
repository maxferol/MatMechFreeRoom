namespace FreeRoom.backend.src.Domain.Value_Object.RoomDynamic;

public class LessonNumber
{
    readonly static int MinLessonNumber = 1;
    readonly static int MaxLessonNumber = 10;
    public int Value { get; }
    
    //private LessonNumber() { }

    public LessonNumber(int value)
    {
        if (value < MinLessonNumber || value > MaxLessonNumber)
            throw new ArgumentOutOfRangeException($"Номер пары не попадает в заданный диапазон: [{MinLessonNumber},{MaxLessonNumber}]",nameof(value));
        Value = value;
    }
}