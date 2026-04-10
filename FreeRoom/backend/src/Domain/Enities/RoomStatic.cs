namespace FreeRoom.backend.src.Domain.Enities;

using FreeRoom.backend.src.Domain.Value_Object.RoomStatic;

public class RoomStatic
{
    public RoomNumber RoomNumber { get; private set; }
    public CountComputer CountComputer { get; private set; }
    public bool OpenWindow { get; private set; }

    public RoomStatic(RoomNumber roomNumber, CountComputer countComputer, bool openWindow)
    {
        RoomNumber = roomNumber;
        CountComputer = countComputer;
        OpenWindow = openWindow;
    }

    private RoomStatic()
    {
        RoomNumber = null!;
        CountComputer = null!;
        OpenWindow = false;
    }
}