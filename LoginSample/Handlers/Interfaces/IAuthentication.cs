using System.Security.Claims;
using LoginSample.Models;
using Nethereum.Web3;

namespace LoginSample.Handlers;

public interface IAuthentication
{
    public string IsAuthenticated(ClaimsPrincipal claims);
    public Task<bool> Authenicate(IncomingDto signData, ClaimsPrincipal User, HttpContext httpContext, Web3 web3);
    public Task<bool> Disconnect(HttpContext httpContext);
    public string GenerateSignatureRequest();
}