using Microsoft.EntityFrameworkCore;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.DependencyInjection;
using LiventCord.Controllers;
using System;

public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlite("Data Source=Data/LiventCord.db"));
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        ConfigureDatabase(app.ApplicationServices);
    }

    public static void ConfigureDatabase(IServiceProvider services)
    {
        using (var scope = services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            context.Database.EnsureCreated();
        }
    }

}
