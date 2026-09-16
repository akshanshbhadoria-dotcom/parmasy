using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Infrastructure;
using UserService.Data;

#nullable disable

namespace UserService.Migrations;

[Migration("20260912000000_ConvertRoleToString")]
[DbContext(typeof(UserDbContext))]
public partial class ConvertRoleToString : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<string>(
            name: "Role",
            table: "Users",
            type: "nvarchar(max)",
            nullable: false,
            oldClrType: typeof(int),
            oldType: "int");

        migrationBuilder.Sql("""
            UPDATE [Users]
            SET [Role] = CASE [Role]
                WHEN '1' THEN 'Admin'
                WHEN '2' THEN 'Doctor'
                ELSE [Role]
            END;
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            UPDATE [Users]
            SET [Role] = CASE [Role]
                WHEN 'Admin' THEN '1'
                WHEN 'Doctor' THEN '2'
                ELSE [Role]
            END;
            """);

        migrationBuilder.AlterColumn<int>(
            name: "Role",
            table: "Users",
            type: "int",
            nullable: false,
            oldClrType: typeof(string),
            oldType: "nvarchar(max)");
    }
}