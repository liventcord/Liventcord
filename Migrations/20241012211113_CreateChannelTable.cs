using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyPostgresApp.Migrations
{
    /// <inheritdoc />
    public partial class CreateChannelTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Channel_guilds_guild_id",
                table: "Channel");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Channel",
                table: "Channel");

            migrationBuilder.DropColumn(
                name: "first_channel_id",
                table: "guilds");

            migrationBuilder.RenameTable(
                name: "Channel",
                newName: "Channels");

            migrationBuilder.RenameIndex(
                name: "IX_Channel_guild_id",
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Channels_guilds_guild_id",
                table: "Channels");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Channels",
                table: "Channels");

            migrationBuilder.RenameTable(
                name: "Channels",
                newName: "Channel");

            migrationBuilder.RenameIndex(
                name: "IX_Channels_guild_id",
                table: "Channel",
                newName: "IX_Channel_guild_id");

            migrationBuilder.AddColumn<string>(
                name: "first_channel_id",
                table: "guilds",
                type: "text",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Channel",
                table: "Channel",
                column: "channel_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Channel_guilds_guild_id",
                table: "Channel",
                column: "guild_id",
                principalTable: "guilds",
                principalColumn: "guild_id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
