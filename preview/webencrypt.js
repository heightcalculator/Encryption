    // Define Helper Functions to help you do Modular Arithmetic and Base Conversions
    function modPow(base, expo, p) {
        let x = BigInt(base) % BigInt(p), res = expo & 1n ? x : 1n;
        do {
            x = x ** 2n % BigInt(p);
            if (expo & 2n) res = res * x % BigInt(p);
        } while (expo /= 2n);
        return res;
    }

    let Base64 = (function () {
        let ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        let Base64 = function () { };
        let _encode = function (value) {
            let result = '', mod;
            do {
                mod = value % 64n;
                result = ALPHA.charAt(Number(mod)) + result;
                value = value / 64n;
            } while (value > 0n);
            return result;
        };
        let _decode = function (value) {
            let result = 0n;
            for (let i = 0, len = value.length; i < len; i++) {
                result *= 64n;
                result += BigInt(ALPHA.indexOf(value[i]));
            }
            return result;
        };
        Base64.prototype = {
            constructor: Base64,
            encode: _encode,
            decode: _decode
        };
        return Base64;
    })();

    let b = new Base64(); //Initialize the base 64 object

    //Define the Helper Functions to convert String into an Array of Numbers of the right length
    function numberOfN(n) {
        n = BigInt(n);
        let N = 0;
        let number = "355";
        while (BigInt(number) < n) {
            number += 355;
            N++;
        }
        return N;
    }

    function messageToChar(message, n) {
        let messageArr = [];
        const Ns = numberOfN(n);
        for (let i = 0; i < message.length; i++) {
            let eachChar = message.charCodeAt(i) + 100;
            messageArr.push(eachChar);
        }
        if (message.length % Ns != 0) {
            for (let i = 0; i < Ns - (message.length % Ns); i++) {
                messageArr.push(100);
            }
        }
        return messageArr;
    }

    //Script for encrypting the message
    function encrypt(message) {
        let newString = "";
        const messageArr = messageToChar(message, n);
        const Ns = numberOfN(n);
        for (let i = 0; i < messageArr.length; i += Ns) {
            let toEncrypt = "";
            for (let j = 0; j < Ns; j++) {
                toEncrypt = toEncrypt + messageArr[i + j];
            }
            let relInt = (BigInt(toEncrypt) ** e) % n;
            let relInt64 = b.encode(relInt); //Converting Ciphertext number from Base 10 to Base 64
            newString += relInt64;
            newString += "#";
        }
        newString = newString.substring(0, newString.length - 1);
        return newString;
    }

    function update() {
        console.log("Click")
        n = BigInt(document.getElementById("keyN").value);
        e = BigInt(document.getElementById("keyE").value);
        if (BigInt(document.getElementById("keyN").value) < 355n) {
            document.getElementById("textOutput").value = "n must be greater than 355";
            return;
        }
        encryptedText = encrypt(document.getElementById("textInput").value);
        document.getElementById("textOutput").value = encryptedText;
    }
