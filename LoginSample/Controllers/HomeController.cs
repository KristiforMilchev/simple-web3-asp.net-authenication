using System.Diagnostics;
using LoginSample.Handlers;
using Microsoft.AspNetCore.Mvc;
using LoginSample.Models;
using Nethereum.Web3;

namespace LoginSample.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;
    private  IAuthentication Authentication { get; set; }
    
    public HomeController(ILogger<HomeController> logger, IAuthentication authentication)
    {
        _logger = logger;
        Authentication = authentication;
    }

    public IActionResult Index()
    {
        var account = Authentication.IsAuthenticated(User);

        ViewData["FullAddress"] = account;

        return View();
    }

    public IActionResult Privacy()
    {
        var account = Authentication.IsAuthenticated(User);
        if (string.IsNullOrEmpty(account))
            return Redirect("/home/Error");

        
        return View();
    }

    [HttpGet]
    public string GetSignatureMessage()
    {
        return Authentication.GenerateSignatureRequest();
    }

    [HttpGet]
    public async Task<bool> DisconnectSession()
    {
        return await Authentication.Disconnect(HttpContext);
    }
    
    [HttpPost]
    public async Task<bool> Login([FromBody] IncomingDto dto)
    {
        var Account = new Nethereum.Web3.Accounts.Account(dto.Signature, 97);
        return await Authentication.Authenicate(dto, User, HttpContext, new Web3(Account, "https://data-seed-prebsc-1-s1.binance.org:8545"));
    }
    
    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}