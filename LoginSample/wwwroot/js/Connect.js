const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
const EvmChains = window.evmChains;
 
// Web3modal instance
let web3Modal

// Chosen wallet provider given by the dialog window
let provider;
 

// Address of the selected account
let selectedAccount;
var web3;

var contractAddress = '0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7'; //'0xf6a22b0593df74f218027a2d8b7953c9b4542aa1'; // Production Contract  ---- //testnet Contract
var currentChain = "0x61"; //"0x31" BSC Mainnet

var activeChain = 97; // 56 BSC Mainnet
 




/**
 * Get the current active user account
 */
function GetAccount() {
    return selectedAccount;
}



function RequestChangeNetwork(id)
{
    ChangeNetwork();
}

/**
 * Forces the user to change network in case its on a different network then the system defined
 */
function ChangeNetwork() {
    if(web3 === undefined)
        return;
    
    web3.currentProvider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: currentChain }] }).catch(e => {
            (e.message.includes("Unrecognized chain ID"))
            {
               alert("Please setup the network in your wallet first");
            }
        });

   

} 


/**
 * Returns back the network session provider for external ETH requests.
 */
function GetProvider() {
    return provider;
}

/**
 * Setup the orchestra
 */
function init() {

    console.log("Initializing example");
    console.log("WalletConnectProvider is", WalletConnectProvider);
 
    // Tell Web3modal what providers we have available.
    // Built-in web browser provider (only one can exist as a time)
    // like MetaMask, Brave or Opera is added automatically by Web3modal
    const providerOptions = {
        walletconnect: {
            package: WalletConnectProvider,
            options: {
                infuraId: "24e067d0dc7847f78b5a99a82f1cc38e", //Replace with your own infura ID
            }
        },

    };

    web3Modal = new Web3Modal({

        cacheProvider: true, // optional
        providerOptions, // required
    });



}


/**
 * Kick in the UI action after Web3modal dialog has chosen a provider
 */
async function fetchAccountData() {

    // Get a Web3 instance for the wallet
    web3 = new Web3(provider);

    console.log("Web3 instance is", web3);

    // Get connected chain id from Ethereum node
    const chainId = activeChain;
    // Load chain information over an HTTP API
    const chainData = await EvmChains.getChain(chainId);

    // Get list of accounts of the connected wallet
    const accounts = await web3.eth.getAccounts();

    // MetaMask does not give you all accounts, only the selected account
    console.log("Got accounts", accounts);
    selectedAccount = accounts[0];

    localStorage.setItem('account', selectedAccount);

    if (!IsOnline()) {
      
        $.ajax({
            method: "GET",
            contentType: "application/json",
            url: "/Home/DisconnectSession",
        }).done(async function (session) {

            $.ajax({
                method: "GET",
                contentType: "application/json",
                url: "/Home/GetSignatureMessage",
            }).done(async function (msg) {
                var signatureData = await signMessage(msg);
                if (signatureData === null)
                    fetchAccountData();

                var volumeDTO = {
                    Phase: selectedAccount,
                    Signature: signatureData.signature,
                    SignedMessage: signatureData.message
                }

                $.ajax({
                    method: "POST",
                    contentType: "application/json",
                    url: "/Home/Login",
                    data: JSON.stringify(volumeDTO)
                }).done(function (msg) {
                    // SetAccount(selectedAccount);
                    if (msg) {
                    
                        window.location.reload();
                    }
                    else
                        alert("failed");
                });
            });
       
        });
    }
 

}


async function signMessage(message) {
    try {
        const from = selectedAccount;
        console.log('from : ' + from);
        const msg = `0x${bops.from(message, 'utf8').toString('hex')}`;
        console.log('msg : ' + msg);
        //const sign = await ethereum.request({
        //    method: 'personal_sign',
        //    params: [msg, from, 'Random text'],
        //});
        var sign = await web3.currentProvider
            .request({
                method: 'personal_sign',
                params: [msg, selectedAccount, 'Random text'],

            });
        console.log('sign : ' + sign);
        return {
            signature: sign,
            message: msg
        };
    } catch (err) {
        console.error(err);
        return null;
    }
}


/**
 * Fetch account data for UI when
 * - User switches accounts in wallet
 * - User switches networks in wallet
 * - User connects wallet initially
 */
async function refreshAccountData() {


    // Disable button while UI is loading.
    // fetchAccountData() will take a while as it communicates
    // with Ethereum node via JSON-RPC and loads chain data
    // over an API call.
    await fetchAccountData(provider);
 
}

function isHex(num) {
    var re = /[0-9A-Fa-f]{6}/g;
    var inputString = num.toString();

    if(inputString.includes("0x"))  
        return true;
    
    return  false;
}

/**
 * Connect wallet button pressed.
 */
async function onConnect() {

    console.log("Opening a dialog", web3Modal);
    try {
        provider = await web3Modal.connect();
    } catch (e) {
        console.log("Could not get a wallet connection", e);
        return;
    }
     currentChain = provider.chainId;
    if(isHex(currentChain))
        activeChain = parseInt(currentChain, 16);
    else
        activeChain = currentChain;



    // Subscribe to accounts change
    provider.on("accountsChanged", (accounts) => {
        fetchAccountData();
    });

    // Subscribe to chainId change
    provider.on("chainChanged", (chainId) => {
        currentChain = provider.chainId;
        activeChain = parseInt(currentChain, 16);
        RequestChangeNetwork(activeChain);
        fetchAccountData();
    });

   
    await refreshAccountData();
}

/**
 * Disconnect wallet button pressed.
 */
async function onDisconnect() {

    $.ajax({
        method: "GET",
        contentType: "application/json",
        url: "/Home/DisconnectSession",
    }).done(async function (session) {
        if (provider.close) {
            await provider.close();

            // If the cached provider is not cleared,
            // WalletConnect will default to the existing session
            // and does not allow to re-scan the QR code with a new wallet.
            // Depending on your use case you may want or want not his behavir.
            await web3Modal.clearCachedProvider();
            provider = null;

        }
        window.location.href = "/";

    });
     
}


 

var Networks = {};
var last;
$(document).ready(function () {
 

 
    init();

    if (IsOnline())
        onConnect();
    document.getElementById("ctnBtn").innerHTML = "CONNECT";
    document.getElementById("ctnBtn").onclick = onConnect;

});

 
function Disconnect() {
    localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");
    localStorage.removeItem("account");

    $.ajax({
        method: "GET",
        contentType: "application/json",
        url: "/Home/DisconnectSession",
    }).done(async function (session) {

        if (provider.close) {
            await provider.close();

            // If the cached provider is not cleared,
            // WalletConnect will default to the existing session
            // and does not allow to re-scan the QR code with a new wallet.
            // Depending on your use case you may want or want not his behavir.
            await web3Modal.clearCachedProvider();
            provider = null;

        }
        window.location.href = "/";

    });
}

 
 
  