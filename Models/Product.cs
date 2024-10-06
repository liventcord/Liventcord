namespace MyPostgresApp.Models {
public class Product
{
    public int id { get; set; }
    public string name { get; set; }
    public decimal price { get; set; }
    public string description { get; set; }
    public DateTime createdat { get; set; }
}

}
