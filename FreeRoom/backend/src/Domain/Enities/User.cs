using System;
using FreeRoom.backend.src.Domain.Value_Object.User;
using FreeRoom.backend.src.Domain.Enum;

namespace FreeRoom.backend.src.Domain.Enities;

public class User
{
    public Login Login { get; private set;}
    public PasswordHash PasswordHash { get; private set; }
    public UserRole Role { get; private set;}

    public User(Login login, PasswordHash password, UserRole role)
    {
        Login = login;
        PasswordHash = password;
        Role = role;
    }

    private User()
    {
        Login = null!;
        PasswordHash = null!;
        Role = UserRole.None!;
    }

    public void UpdatePassword(PasswordHash newPasswordHash) => PasswordHash = newPasswordHash;
}