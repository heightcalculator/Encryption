# Caesar Cipher
Caesar cipher, also known as the shift cipher, is one of the earliest known ciphers. It works by shifting the digits of the text up or down by a specific number to encrypt the message and then shifting the digits down or up by the same number to decrypt the message. This means that there is only one key and the same key is used to encrypt and decrypt the messages.

# Key
We can make the key any number and we can shift the letters up or down by that number and $\pmod{255}$ to make sure it is in the range of ASCII characters.

# To Encrypt
To encrypt a String, we can split the String by each character and then convert that character to its ASCII decimal value:
```js
let stringAsCharArray = [];
for (let i = 0; i < message.length; i++) {
    stringAsCharArray.push(message.charCodeAt(i));
}
```
While we split and push it to the array, we can encrypt the message by adding a number to each ASCII decimal value and $\pmod{255}$ to keep it in the ASCII range:
```js
let stringAsCharArray = [];
for (let i = 0; i < message.length; i++) {
    stringAsCharArray.push((message.charCodeAt(i)+encryptionKey) % 255);
}
```
## Performing the Encryption
Then we can take our new ASCII decimal values and convert them back into characters. Or instead of going to the whole hassel of putting them into Arrays, we can do this whole process in one step:
```js
crypticMessage = "";
for (let i = 0; i < message.length; i++) {
    crypticMessage += String.fromCharCode((message.charCodeAt(i)+encryptionKey) % 255);
}
```
## Full code for Encryption
The full encryption code is provided in [CaesarEncryption.js](https://github.com/heightcalculator/Encryption/blob/main/CaesarCipher/CaesarEncryption.js). The encrypt(key, message) function takes the Plain Text string as an input and outputs the String of ciphertext.

# To Decrypt
To decrypt ciphertext, we can split the ciphertext by each character and then convert that character to its ASCII decimal value:
```js
let stringAsCharArray = [];
for (let i = 0; i < message.length; i++) {
    stringAsCharArray.push(message.charCodeAt(i));
}
```
While we split and push it to the array, we can decrypt the message by subtracting a number we used to encrypt the message to each ASCII decimal value and $\pmod{255}$ to keep it in the ASCII range:
```js
let stringAsCharArray = [];
for (let i = 0; i < message.length; i++) {
    stringAsCharArray.push((message.charCodeAt(i)-encryptionKey) % 255);
}
```
## Performing the Decryption
Then we can take our new ASCII decimal values and convert them back into characters. Or instead of going to the whole hassel of putting them into Arrays, we can do this whole process in one step:
```js
plainText = "";
for (let i = 0; i < message.length; i++) {
    plainText += String.fromCharCode((message.charCodeAt(i)-encryptionKey) % 255);
}
```
## Full code for Decryption
The full encryption code is provided in [CaesarDecryption.js](https://github.com/heightcalculator/Encryption/blob/main/CaesarCipher/CaesarDecryption.js). The decrypt(key, cipher) function takes the ciphertext string as an input and outputs the String of plaintext.
