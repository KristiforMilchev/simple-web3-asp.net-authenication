using System.Security.Claims;
using LoginSample.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Nethereum.Signer;
using Nethereum.Web3;

namespace LoginSample.Handlers.Implementation;

public class Authentication : IAuthentication
{
    public async Task<bool> Authenicate(IncomingDto signData, ClaimsPrincipal User, HttpContext httpContext, Web3 web3)
    {
        if (User.Claims.FirstOrDefault() == null)
        {

            var signer1 = new EthereumMessageSigner();
            var verify = signer1.EncodeUTF8AndEcRecover(signData.SignedMessage, signData.Signature);

            //Verify that the requester owns the acccount.
            if (verify != signData.Phase)
                return false;

           
            //Save vital login detail for later authenication 
            var identity = new ClaimsIdentity(CookieAuthenticationDefaults.AuthenticationScheme, ClaimTypes.Name, ClaimTypes.Role);
            identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()));
            identity.AddClaim(new Claim(ClaimTypes.Name, signData.Phase));
            identity.AddClaim(new Claim(ClaimTypes.Name, signData.Signature));
            identity.AddClaim(new Claim(ClaimTypes.Name, signData.SignedMessage));
             

            //Register the principal and authorize the user to use the system.
            var principal = new ClaimsPrincipal(identity);
            var authProperties = new AuthenticationProperties
            {
                AllowRefresh = true,
                ExpiresUtc = DateTimeOffset.Now.AddDays(1),
                IsPersistent = true,
            };

            await httpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(principal), authProperties);
            return true;
        }

        return false;
    }
    
    public async Task<bool> Disconnect(HttpContext httpContext)
    {
        await httpContext.SignOutAsync();
        return true;
    }

    public string GenerateSignatureRequest()
    {
        return $"Signature request: {Guid.NewGuid().ToString()}"; // Generates a message to be signed by web3 account.
    }

    public string IsAuthenticated(ClaimsPrincipal user)
    {
        if (user.Claims.FirstOrDefault() == null)
            return null;

        return user.Claims.ElementAt(1).Value;
         
    }

        
}