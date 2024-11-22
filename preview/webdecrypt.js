    // Define functions to help get the Private Key
    function gcd(int1, int2) {
        int1 = BigInt(int1), int2 = BigInt(int2);
        return int1 % int2 == 0n ? int2 : gcd(int2, int1 % int2);
    }

    function bezout(a, b) {
        a = BigInt(a), b = BigInt(b);
        let reverse = false;
        if (a < b) {
            [a, b] = [b, a];
            reverse = true;
        }
        let s1 = 0n, s0 = 1n;
        let t1 = 1n, t0 = 0n;
        let r1 = b, r0 = a;
        while (r1 != 0n) {
            let q = r0 / r1;
            [r1, r0] = [r0 - q * r1, r1];
            [s1, s0] = [s0 - q * s1, s1];
            [t1, t0] = [t0 - q * t1, t1];
        }
        return reverse ? [t0, s0] : [s0, t0];
    }

    function privateKey(p, q, e) {
        p = BigInt(p), q = BigInt(q), e = BigInt(e);
        if (p * q < 355n) {
            return false;
        }
        let eulersFunction = (p - 1n) * (q - 1n);
        while (gcd(eulersFunction, e) != 1) {
            e++;
        }
        let d = bezout(e, eulersFunction)[0];
        d = d >= 0n ? d : eulersFunction + d;
        return [p * q, d];
    }

    // Define Helper Functions to help you do Modular Arithmetic and Base Conversions
    function modPow(base, expo, p) {
        let x = BigInt(base) % BigInt(p), res = expo & 1n ? x : 1n;
        do {
            x = x ** 2n % BigInt(p);
            if (expo & 2n) res = res * x % BigInt(p);
        } while (expo /= 2n);
        return res;
    }

    var Base64 = (function () {
        var ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        var Base64 = function () { };
        var _encode = function (value) {
            var result = '', mod;
            do {
                mod = value % 64n;
                result = ALPHA.charAt(Number(mod)) + result;
                value = value / 64n;
            } while (value > 0n);
            return result;
        };
        var _decode = function (value) {
            var result = 0n;
            for (var i = 0, len = value.length; i < len; i++) {
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

    //Script for Decrypting the message
    function decrypt(cipher) {
        var newString = "";
        const splitCipherText = cipher.split("#");
        for (let i = 0; i < splitCipherText.length; i++) {
            let eachAsInt = BigInt(b.decode(splitCipherText[i])); //Remember to convert the Base 64 back to Base 10
            relInt = modPow(eachAsInt, d, n);
            for (let j = 0; j < relInt.toString().length; j += 3) {
                let eachString = relInt.toString().substring(j, j + 3);
                newString += String.fromCharCode(parseInt(eachString) - 100);
            }
        }
        return newString;
    }


    function update() {
        console.log("Click")
        if (document.getElementById("keyN1").value != "" && document.getElementById("keyD1").value != "") {
            n = BigInt(document.getElementById("keyN1").value);
            d = BigInt(document.getElementById("keyD1").value);
        } else if (document.getElementById("keyP2").value != "" && document.getElementById("keyQ2").value != "" && document.getElementById("keyD2").value != "") {
            n = BigInt(document.getElementById("keyP2").value)*BigInt(document.getElementById("keyQ2").value);
            d = BigInt(document.getElementById("keyD2").value);
        } else {
            n = privateKey(document.getElementById("keyP3").value, document.getElementById("keyQ3").value, document.getElementById("keyE3").value)[0];
            d = privateKey(document.getElementById("keyP3").value, document.getElementById("keyQ3").value, document.getElementById("keyE3").value)[1];
        }
        if (n < 355n) {
            document.getElementById("textOutput").value = "Error: n must be greater than 355";
            return;
        }
        encryptedText = decrypt(document.getElementById("textInput").value);
        document.getElementById("textOutput").value = encryptedText;
    }
