namespace LoginSample.Models;

public class IncomingDto
{
    public string Phase { get; set; }
    public int Id { get; set; }
    public string Signature { get; set; }
    public string SignedMessage { get; set; }
}