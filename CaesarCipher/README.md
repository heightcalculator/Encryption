# Caesar Cipher
Caesar cipher, also known as the shift cipher, is one of the earliest known ciphers. It works by shifting the digits of the text up or down by a specific number to encrypt the message and then shifting the digits down or up by the same number to decrypt the message. This means that there is only one key and the same key is used to encrypt and decrypt the messages.

# Key
We can make the key any number and we can shift the letters up or down by that number and $\pmod{255}$ to make sure it is in the range of ASCII characters.

# To Encrypt
To encrypt a String, we can split the String by each character and then convert that character to its ASCII decimal value:
```js
stringAsCharArray = []
for (let i = 0; i < message.length; i++) {
    stringAsCharArray.push(message.charCodeAt(i));
}
```
