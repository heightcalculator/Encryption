# RSA Encryption
RSA Encryption is an encryption method that uses different Public and Private keys where the key used to encrypt the message is different from the key used to decrypt the message. "RSA" stands for the last initials of Ron Rivest, Adi Shamir and Leonard Adleman, who are the people usually credited for the creation of RSA in 1977, however, a very similar encryption algorithm was initially developed by Clifford Cocks in 1973 for the British Signals Intelligence Agency, but it was not declassified until 1997.

Preview the RSA Encryption Here: [https://rsa.aarushmagic.com/preview](https://rsa.aarushmagic.com/preview)

**Please note: This page only teaches you how to implement the very elementary level RSA algorithm and may be extremely prone to cyber attacks and should only be used for educational purpose and not to encrypt secure or classified data.**

# RSA's Encryption Keys

RSA uses different public and private keys that are [mathematically linked](https://github.com/heightcalculator/RSA-Encryption/blob/main/README.md#the-math-behind-it) but even by using modern day supercomputers, it could take billions of years to figure out the private key given the public key. However, using Shor's Algorithm, Quantum Computers can easily calculate the Private Key given a public key, so RSA is no longer one of the most secure encryption methods but it is still a standard method in a lot of applications.
## Public Key
We can define the public key as follows:
$$(n,e)$$

Where $n=pq$ where $p$ and $q$ are 2 prime numbers (usually very large, and $p*q$ must be greater than at least 355. The code provided in [random-prime.js](https://github.com/heightcalculator/Encryption/blob/main/random-prime.js) cam be used for this step) and $e$ is any integer greater than 1 that is relatively prime to the Euler's Totient Function, $\phi(n)$. $e$ is usually relatively small and is chosen to increase efficiency of the algorithm. To make sure $e$ and $\phi(n)$ are relatively prime, we can check their GCD using the Euclidean Algorithm and make sure it is equal to 1.

Because we may be dealing with large primes, we will use the JavaScript BigInt for all our calculations:
```js
function gcd(int1, int2) {
    int1 = BigInt(int1), int2 = BigInt(int2);
    return int1 % int2 == 0n ? int2 : gcd(int2, int1 % int2);
}

function publicKey(p, q, e) {
    p = BigInt(p), q = BigInt(q), e = BigInt(e);
    if (p * q < 355n) {
        return false;
    }
    let eulersFunction = (p - 1n) * (q - 1n);
    while (gcd(eulersFunction, e) != 1) {
        e++;
    }
    return [p * q, e];
}
```
Usually, the public key is not shared as just the n and e directly, but it is shared in the `PEM` format as a `.pem` file type. We can use the following `node.js` code to convert the n and e into a PEM public key and back.

First make sure to install node-forge using `npm install node-forge` in the terminal. Here is the code to convert n and e into PEM format:
```js
const forge = require('node-forge');
function toPublicPEM(n, e) {
    // Convert decimal modulus (n) to BigInteger
    n = new forge.jsbn.BigInteger(n.toString(), 10);
    // Convert decimal exponent (e) to BigInteger
    e = new forge.jsbn.BigInteger(e.toString(), 10);
    // Create the public key object
    const publicKey = forge.pki.setRsaPublicKey(n, e);
    // Convert the public key object to PEM format
    const pemKey = forge.pki.publicKeyToPem(publicKey);
    // Return the PEM-formatted key
    return pemKey;
}
```
Here is the code to extract the values for n and e from a public key in PEM format:
```js
const forge = require('node-forge');
function fromPublicPEM(pemKey) {
    // Use Forge to parse the public key
    const publicKey = forge.pki.publicKeyFromPem(pemKey);
    // Extract the modulus (n) and exponent (e)
    const n = publicKey.n.toString(10); // Modulus
    const e = publicKey.e.toString(10); // Exponent
    // Return the results ;
    return [n,e];
}
```
Since both of the above javascript codes require `node.js`, they can not run directly on a browser and are therefore not included in [encryption.js](https://github.com/heightcalculator/Encryption/blob/main/encryption.js). To do this step directly on the browser, the following script tag can be used in the HTML file in-place of `node-forge`: 
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/forge/0.8.2/forge.min.js" type="text/javascript"></script>
```

## Private Key
We can define the private key as follows:
$$(n,d)$$

Where $n$ is the same $n$ from the public key. $d$ is the inverse $e \pmod{\phi(n)}$. 
In other words, in order to find $d$, we need to solve the following:
$$ed \equiv 1 \pmod{\phi(n)}$$

We know this has a solution because $e$ and $\phi(n)$ are relatively prime. To find d, we can use the method of Bezout Coefficients:
```js
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
```
Here the output would be a list with 2 elements, first of which is the coefficient of a, second of which is the coefficient of b.

$d$ is the Bezout coefficient of $e$ in modular $\phi(n)$. This gives us:
```js
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
```
Usually, the private key is not stored as just the n and e directly, but it is stored in the `PEM` format as a `.key` or `.pem` file type. We can use the following `node.js` code to convert the p, q, e and d into a PEM private key and back.

First make sure to install node-forge using `npm install node-forge` in the terminal. Here is the code to convert n and e into PEM format:
```js
const forge = require('node-forge');
function toPrivatePEM(p, q, e, d) {
    // Convert inputs to BigIntegers
    p = new forge.jsbn.BigInteger(p.toString(), 10);
    q = new forge.jsbn.BigInteger(q.toString(), 10);
    e = new forge.jsbn.BigInteger(e.toString(), 10);
    d = new forge.jsbn.BigInteger(d.toString(), 10);
    // Calculate n (modulus)
    const n = p.multiply(q);
    // Calculate φ(n) = (p - 1) * (q - 1)
    const phi = p.subtract(forge.jsbn.BigInteger.ONE).multiply(q.subtract(forge.jsbn.BigInteger.ONE));
    // Calculate dp = d mod (p - 1)
    const dp = d.mod(p.subtract(forge.jsbn.BigInteger.ONE));
    // Calculate dq = d mod (q - 1)
    const dq = d.mod(q.subtract(forge.jsbn.BigInteger.ONE));
    // Calculate qInv = q^(-1) mod p
    const qInv = q.modInverse(p);
    // Create the private key object
    const privateKey = forge.pki.setRsaPrivateKey(n, e, d, p, q, dp, dq, qInv);
    // Convert the private key object to PEM format
    const pemKey = forge.pki.privateKeyToPem(privateKey);
    // Display the PEM-formatted private key
    return pemKey;
}
```
Here is the code to extract the values for n and e from a public key in PEM format:
```js
const forge = require('node-forge');
function fromPrivatePEM(pemKey) {
    // Use Forge to parse the private key
    const privateKey = forge.pki.privateKeyFromPem(pemKey);
    // Extract the modulus (n) and decryption exponent (d)
    const n = privateKey.n.toString(10); // Modulus
    const d = privateKey.d.toString(10); // Decryption Exponent
    // Return the results ;
    return [n,d];
}
```

Since both of the above javascript codes require `node.js`, they can not run directly on a browser and are therefore not included in [decryption.js](https://github.com/heightcalculator/Encryption/blob/main/decryption.js). To do this step directly on the browser, the following script tag can be used in the HTML file in-place of `node-forge`: 
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/forge/0.8.2/forge.min.js" type="text/javascript"></script>
```
# To Encrypt
## Modulus Algorithm
In both, encryption and decryption, we will need to take the modulus of very large numbers, so it is best to define an algorithm to do so early. The following algorithm gives the result to $base^{expo} \pmod{p}$:
```js
function modPow(base, expo, p) {
    let x = BigInt(base) % p, res = expo & 1n ? x : 1n;
    do {
        x = x ** 2n % p;
        if (expo & 2n) res = res * x % p;
    } while (expo /= 2n);
    return res;
}
```
## String to Numbers
To encrypt a string of characters, we will first need to convert the String into a Number, To do this, we will convert each character into its ASCII code and add 100 to it. By adding a 100, we ensure that each character corresponds to a 3 digit number so its length is preserved for later when we try to decrypt it. We will convert a string to an array of numbers where each index of the array represents to the corresponding index of the string:
```js
function messageToChar(message) {
    let messageArr = [];
    for (let i = 0; i < message.length; i++) {
        let eachChar = message.charCodeAt(i) + 100;
        messageArr.push(eachChar);
    }
    return messageArr;
}
```

We now need to break the String into the relevant lengths. We know the max number one of our characters can be converted into is 355. We need to find N, where N is the max number (maximum helps ensure greater security) of 355s that can be used to make the number 355355355... while the number still being less than $n$ (keeping it less than $n$ ensures a unique modulo $n$ when being decrypted):
```js
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
```
Now in order to convert our String into numbers and make sure it is of relevant length, so it can be decrypted later, we need to make sure we split the string every N digits and every section of the string has the same number of digits. If any of the string has less digits than the rest, then when we convert the String to a number array, we can add extra empty strings in our array which has an ASCII value of 0, so our value of 100. This means we need to rewrite the `messageToChar` function as follows:
```js
function messageToChar(message, n) {
    let messageArr = [];
    const Ns =  numberOfN(n);
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
```

## Performing the Encryption
Now to encrypt, we take the numbers corresponding to the strings (for example "A"=165, "B"=166, so "AB"=165166 and "AB" has a size of 2) of size $N$ (lets call these numbers $p$ for plaintext) and perform the following operation: $c = p^e \pmod{n}$ where $c$ is the ciphertext. Then we combine all of the ciphertext numbers with a delimiter (in our example, we used # as the delimiter) to create our encrypted message:
```js
let newString = "";
for (let i = 0; i < messageToChar(message, n).length; i += numberOfN(n)) {
    let toEncrypt = "";
    for (let j = 0; j < numberOfN(n); j++) {
        toEncrypt = toEncrypt + messageToChar(message, n)[i + j];
    }
    let relInt = (BigInt(toEncrypt) ** e) % n;
    newString += relInt;
    newString += "#";
}
newString = newString.substring(0, newString.length - 1);
```

## Base 64
Just to make our number in the final answer shorter, we are going to write it as Base 64 instead of Base 10. We can use the following JavaScript object to convert between the 2:
```js
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
```
## Full Code for Encryption
The full encryption code is provided in [encryption.js](https://github.com/heightcalculator/Encryption/blob/main/encryption.js). The `encrypt(message)` function takes the Plain Text string as an input and outputs the String of ciphertext numbers in Base 64

# To Decrypt

## Prepare Cipher Text
Our first task is to take our Cipher Text and split it at the given delimiter. In our case, we used # as the delimiter. Splitting will give us an Array of numbers where each number in the array is the individual encrypted cipher text from above.
```js
const splitCipherText = cipher.split("#");
```
## Performing the Decryption
We can now perform the Decryption. To decrypt, we need to perform the following operation: $p = c^d \pmod{n}$ where $p$ is our plaintext and $c$ is our single piece of ciphertext. 
```js
for (let i = 0; i < splitCipherText.length; i++) {
    let eachAsInt = BigInt(splitCipherText[i]);
    relInt = modPow(eachAsInt, d, n);
}
```
As we convert all individual ciphertext pieces to plaintext, note that our plain text here is still a string that is a Base 10 number rather than a String of characters. Here, we can count by every 3 digits, subtract 100 from every set of digits and convert that char/decimal value back to the relavent character and concatenate them to create our string that was encrypted!
```js
let newString = "";
for (let i = 0; i < splitCipherText.length; i++) {
    let eachAsInt = BigInt(splitCipherText[i]);
    let relInt = modPow(eachAsInt, d, n);
    for (let j = 0; j < relInt.toString().length; j += 3) {
        let eachString = relInt.toString().substring(j, j + 3);
        newString += String.fromCharCode(parseInt(eachString) - 100);
    }
}
```

## Full Code for Decryption
The full decryption code is provided in [decryption.js](https://github.com/heightcalculator/Encryption/blob/main/decryption.js). The `decrypt(message)` function takes the Cipher Text string which is a Base 64 number as the input and outputs the plaintext string in Base 64

# Why does RSA work?
## The math behind it
Anytime we want to encrypt a message, we can perform whatever operation so the ciphertext does not resemble the plaintext and can be converted back into plaintext using some operation. For RSA, the way we have defined our encryption process is $c = p^e \pmod{n}$ where p is the plaintext, c is the ciphertext, n is the product of primes and e is the exponent for encryption such that $e$ and the euler's totient function of n, $\phi(n)$, are relatively prime (they need to be relatively prime so we can solve  $ed \equiv 1 \pmod{\phi(n)}$ for $d$, which is our private key).

Now let's look at the following operation: $c^d \pmod{n}$.
```math
\begin{align} c^d \pmod{n} &= (p^e)^d \pmod{n} &\text{Given that we encrypted } c=p^e\pmod{n}\\ &= p^{ed} \pmod{n} &\text{Combining exponents}\\ &= p^{\phi(n) * z+1} \pmod{n} &\text{Given }ed\equiv 1 \pmod{\phi(n)} \text{ so } ed = \phi(n) * z+1 \text{ for some } z \in \mathbb{Z}\\ &= p^{\phi(n) * z} * p \pmod{n} &\text{Splitting the exponents}\\ &\equiv 1^{z} * p \pmod{n} &\text{Using the property: } a^{\phi(m)} \equiv 1 \pmod{m}\\ &= p \pmod{n} &\text{Given }1^x=1 \quad \forall x \in \mathbb{R}\\ &= p & p \text{ was defined such that } 0 \leq p < n \end{align}
```

Here, we have gotten that $c^d \pmod{n} = p$, so by doing the operation $c^d \pmod{n}$, we can convert the ciphertext back to our plaintext!
## Why is it secure?
The main reason it is secure is because the key used to encrypt the message is different from the key used to decrypt the message. So the public key can be given out, allowing anyone to encrypt the message, however no one would be able to decrypt the message without the private key which you never share so no one has access to. 

Although the public and private keys are mathematically linked, it is very hard to get from one to the other. The way we encrypt a message is $c = p^e \pmod{n}$ so we share e and n as our public key. However to decrypt the message, we use $p = c^d \pmod{n}$ where $d$ id part of the private key. To get d, we must solve $ed \equiv 1 \pmod{\phi(n)}$, but for that, we need to know what $\phi(n)$ is. To solve for that, we need the prime factorization of n. There does not exist an algorithm (ignoring Shor's Algorithm for quantum computers) that can efficiently solve for the prime factors of any number, so if $n$ is sufficiently large, then finding its prime factors of n could take thousands of years even with the best supercomputers if not more. Without the prime factors, you can not get the private key, and thus can not decrypt the message.
