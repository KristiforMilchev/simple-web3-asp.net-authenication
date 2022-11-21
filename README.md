# simple-web3-asp.net-authenication
The purpose of this repository is to have a simple boilerplate web3 authenication with .net using walletconnect and the built in .net authorization middleware.


# suggestion

Since it's still based on cookies which can be stolen it's a good idea to call GetSignatureMessage() -> Login before critical actions to ensure that the logged user hasn't stolen the cookies. It will prompt the user to sign the message either on their computer or a phone, each signature is unique and ensures the sender matches the logged user.
