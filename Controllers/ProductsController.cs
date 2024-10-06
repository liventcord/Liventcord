using Microsoft.AspNetCore.Mvc;
using MyPostgresApp.Data;
using MyPostgresApp.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace MyPostgresApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/products
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            var products = await _context.Products.ToListAsync();
            return Ok(products); // Returns a 200 OK response with the list of products
        }

        // POST: api/products
        [HttpPost]
        public async Task<ActionResult<Product>> InsertProduct(Product product)
        {
            if (ModelState.IsValid)
            {
                product.createdat = DateTime.UtcNow; // Set createdat to UTC time
                _context.Products.Add(product);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetProducts), new { id = product.id }, product); // Returns a 201 Created response
            }
            return BadRequest(ModelState); // Returns a 400 Bad Request if model state is invalid
        }
    }
}
