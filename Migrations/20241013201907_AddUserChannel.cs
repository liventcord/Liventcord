using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyPostgresApp.Migrations
{
    /// <inheritdoc />
    public partial class AddUserChannel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Channels_guilds_guild_id",
                table: "Channels");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Channels",
                table: "Channels");

            migrationBuilder.RenameTable(
                name: "Channels",
                newName: "channels");

            migrationBuilder.RenameColumn(
                name: "channel_type",
                table: "channels",
                newName: "is_text_channel");

            migrationBuilder.RenameIndex(
                name: "IX_Channels_guild_id",
                table: "channels",
                newName: "IX_channels_guild_id");

            migrationBuilder.AddColumn<DateTime>(
                name: "last_read_datetime",
                table: "channels",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_channels",
                table: "channels",
                column: "channel_id");

            migrationBuilder.CreateTable(
                name: "user_channels",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "text", nullable: false),
                    ChannelId = table.Column<string>(type: "text", nullable: false),
                    lastreaddatetime = table.Column<DateTime>(name: "last_read_datetime", type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_channels", x => new { x.UserId, x.ChannelId });
                    table.ForeignKey(
                        name: "FK_user_channels_channels_ChannelId",
                        column: x => x.ChannelId,
                        principalTable: "channels",
                        principalColumn: "channel_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_user_channels_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_user_channels_ChannelId",
                table: "user_channels",
                column: "ChannelId");

            migrationBuilder.AddForeignKey(
                name: "FK_channels_guilds_guild_id",
                table: "channels",
                column: "guild_id",
                principalTable: "guilds",
                principalColumn: "guild_id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_channels_guilds_guild_id",
                table: "channels");

            migrationBuilder.DropTable(
                name: "user_channels");

            migrationBuilder.DropPrimaryKey(
                name: "PK_channels",
                table: "channels");

            migrationBuilder.DropColumn(
                name: "last_read_datetime",
                table: "channels");

            migrationBuilder.RenameTable(
                name: "channels",
                newName: "Channels");

            migrationBuilder.RenameColumn(
                name: "is_text_channel",
                table: "Channels",
                newName: "channel_type");

            migrationBuilder.RenameIndex(
                name: "IX_channels_guild_id",
                table: "Channels",
                newName: "IX_Channels_guild_id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Channels",
                table: "Channels",
                column: "channel_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Channels_guilds_guild_id",
                table: "Channels",
                column: "guild_id",
                principalTable: "guilds",
                principalColumn: "guild_id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
