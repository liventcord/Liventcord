using YoutubeExplode.Common;
using MyPostgresApp.Data;
using Microsoft.EntityFrameworkCore;
using System.IO;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("LocalConnection")));
builder.Services.AddControllers();
var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();
app.Use(async (context, next) =>
{
    if (context.Request.Method == "OPTIONS")
    {
        context.Response.StatusCode = 204;
        return;
    }
    await next();
});
app.UseAuthorization();
app.UseStaticFiles(); 


void MapRoute(string path, string fileName, string contentType)
{
    app.MapGet(path, async context =>
    {
        var filePath = Path.Combine(app.Environment.WebRootPath, fileName);
        context.Response.ContentType = contentType;
        await context.Response.SendFileAsync(filePath);
    });
}

MapRoute("/", "newdc.html", "text/html");
MapRoute("/download", "download.html", "text/html");
MapRoute("/login", "login.html", "text/html");
MapRoute("/w/loader/loader.js", "static/js/loader.js", "application/javascript");



app.MapFallback(async context =>
{
    context.Response.ContentType = "text/html";
    var filePath = Path.Combine(app.Environment.WebRootPath, "404.html");
    await context.Response.SendFileAsync(filePath);
});


app.MapControllers();
app.Run();
