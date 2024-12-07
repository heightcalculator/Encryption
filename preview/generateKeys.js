
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

// Modular exponentiation: base^exp % mod
function modExp(base, exp, mod) {
    let result = 1n;
    base = base % mod;
    while (exp > 0n) {
        if (exp % 2n === 1n) result = (result * base) % mod;
        exp /= 2n;
        base = (base * base) % mod;
    }
    return result;
}

function isPrime(n, k = 7) { // `k` is the number of test iterations for accuracy
    if (n <= 1n) return false;
    if (n <= 3n) return true;
    if (n % 2n === 0n) return false;

    // Write n-1 as d * 2^r
    let r = 0n;
    let d = n - 1n;
    while (d % 2n === 0n) {
        d /= 2n;
        r++;
    }

    // Miller-Rabin test
    for (let i = 0; i < k; i++) {
        const a = BigInt(2 + Math.floor(Math.random() * (Number(n - 4n))));
        let x = modExp(a, d, n); // Compute a^d % n
        if (x === 1n || x === n - 1n) continue;

        let continueOuterLoop = false;
        for (let j = 0; j < r - 1n; j++) {
            x = modExp(x, 2n, n);
            if (x === n - 1n) {
                continueOuterLoop = true;
                break;
            }
        }
        if (continueOuterLoop) continue;

        return false; // Composite
    }
    return true; // Probably prime
}

function update() {
    if (!document.getElementById("keyP").value || !document.getElementById("keyQ").value) {
        const primes = generateTwoPrimes(154);
        document.getElementById("keyP").value = primes[0];
        document.getElementById("keyQ").value = primes[1];
    }
    if (!document.getElementById("keyE").value) {
        document.getElementById("keyE").value = Math.floor(Math.random() * 100000);
    }
    let p = BigInt(document.getElementById("keyP").value) > 0n ? BigInt(document.getElementById("keyP").value) : BigInt(document.getElementById("keyP").value) * -1n
    let q = BigInt(document.getElementById("keyQ").value) > 0n ? BigInt(document.getElementById("keyQ").value) : BigInt(document.getElementById("keyQ").value) * -1n
    let e = BigInt(document.getElementById("keyE").value) > 0n ? BigInt(document.getElementById("keyE").value) : BigInt(document.getElementById("keyE").value) * -1n
    if (!isPrime(p) || !isPrime(q)) {
        alert("Either p or q is not prime. Please try again")
        return;
    }
    let public = publicKey(p, q, e)
    let private = privateKey(p, q, e)
    document.getElementById("textInput").value = "n = " + public[0] + "\ne = " + public[1]
    document.getElementById("textOutput").value = "n = " + private[0] + "\nd = " + private[1]
    document.getElementById("publicKeyUrl").innerHTML = "<a href='index.html?n=" + public[0] + "&e=" + public[1] + "' target='_blank'>Use this public key to encrypt</a>"
    document.getElementById("privateKeyUrl").innerHTML = "<a href='decrypt.html?n=" + private[0] + "&d=" + private[1] + "' target='_blank'>Use this private key to decrypt</a>"
}

function getRandomPrime(length) {
    // Generate a random number of the specified length
    function getRandomNumber(length) {
        const arrayLength = Math.ceil((length * Math.log2(10)) / 8); // Approx. bits required
        const randomBytes = new Uint8Array(arrayLength);
        crypto.getRandomValues(randomBytes);

        // Convert bytes to a big integer string
        let randomNum = Array.from(randomBytes)
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join('');
        randomNum = BigInt('0x' + randomNum);

        const min = BigInt('1' + '0'.repeat(length - 1)); // Minimum value with desired length
        const max = BigInt('9'.repeat(length)); // Maximum value with desired length
        return min + (randomNum % (max - min + 1n)); // Ensure within range
    }
    // Sieve of Eratosthenes to generate small primes up to a limit
    function generateSmallPrimes(limit) {
        const sieve = Array(limit + 1).fill(true);
        sieve[0] = sieve[1] = false;

        for (let p = 2; p * p <= limit; p++) {
            if (sieve[p]) {
                for (let i = p * p; i <= limit; i += p) sieve[i] = false;
            }
        }

        return sieve.reduce((primes, isPrime, number) => {
            if (isPrime) primes.push(BigInt(number));
            return primes;
        }, []);
    }

    const smallPrimes = generateSmallPrimes(1000);

    // Check divisibility by small primes
    function isDivisibleBySmallPrimes(n) {
        for (const prime of smallPrimes) {
            if (prime * prime > n) break;
            if (n % prime === 0n) return true;
        }
        return false;
    }

    // Miller-Rabin test with one base (base 2)
    function millerRabinBase2(n) {
        if (n <= 1n || n % 2n === 0n) return false;

        let r = 0n;
        let d = n - 1n;
        while (d % 2n === 0n) {
            d /= 2n;
            r++;
        }

        let x = modExp(2n, d, n); // Compute 2^d % n
        if (x === 1n || x === n - 1n) return true;

        while (r > 1n) {
            x = modExp(x, 2n, n);
            if (x === n - 1n) return true;
            r--;
        }
        return false;
    }

    // Generate a random prime number of the given length
    while (true) {
        let candidate = getRandomNumber(length);
        candidate |= 1n; // Ensure the candidate is odd

        // Quick filter with small primes
        if (isDivisibleBySmallPrimes(candidate)) continue;

        // Baillie-PSW Test (simplified)
        if (!millerRabinBase2(candidate)) continue;

        if (isPrime(candidate)) return candidate;
    }
}

// Generate two random prime numbers of a specified length
function generateTwoPrimes(length) {
    const prime1 = getRandomPrime(length);
    let prime2;

    do {
        prime2 = getRandomPrime(length);
    } while (prime1 === prime2); // Ensure the primes are distinct

    return [prime1, prime2];
}

function rsaPubKey() {
    let p = BigInt(document.getElementById("keyP").value)
    let q = BigInt(document.getElementById("keyQ").value)
    let olde = BigInt(document.getElementById("keyE").value);
    if (p * q < 355n) {
        return false;
    }
    let eulersFunction = (p - 1n) * (q - 1n);
    while (gcd(eulersFunction, olde) != 1) {
        olde++;
    }
    let nDec = (p * q).toString()
    let eDec = olde.toString()

    // Convert decimal modulus (n) to BigInteger
    const n = new forge.jsbn.BigInteger(nDec, 10);

    // Convert decimal exponent (e) to BigInteger
    const e = new forge.jsbn.BigInteger(eDec, 10);

    // Create the public key object
    const publicKey = forge.pki.setRsaPublicKey(n, e);

    // Convert the public key object to PEM format
    const pemKey = forge.pki.publicKeyToPem(publicKey);

    // Display the PEM-formatted key
    document.getElementById("textInput").value = pemKey
}

function rsaPrivKey() {
    // Given RSA parameters
    const pDec = BigInt(document.getElementById("keyP").value); // First prime factor
    const qDec = BigInt(document.getElementById("keyQ").value); // Second prime factor
    let eDec = BigInt(document.getElementById("keyE").value); // Public exponent
    if (pDec * qDec < 355n) {
        return false;
    }
    let eulersFunction = (pDec - 1n) * (qDec - 1n);
    while (gcd(eulersFunction, eDec) != 1) {
        eDec++;
    }
    let dold = bezout(eDec, eulersFunction)[0];
    const dDec = dold >= 0n ? dold : eulersFunction + dold;

    // Convert inputs to BigIntegers
    const p = new forge.jsbn.BigInteger(pDec.toString(), 10);
    const q = new forge.jsbn.BigInteger(qDec.toString(), 10);
    const e = new forge.jsbn.BigInteger(eDec.toString(), 10);
    const d = new forge.jsbn.BigInteger(dDec.toString(), 10);

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
    document.getElementById('textOutput').value = pemKey;
}
var RSABool = false;
function switchStyle() {
    if (!RSABool) {
        document.getElementById("textInput").style.fontSize = "15px"
        document.getElementById("textOutput").style.fontSize = "15px"
        rsaPubKey()
        rsaPrivKey()
        RSABool = true;
    } else {
        document.getElementById("textInput").style.fontSize = "16px"
        document.getElementById("textOutput").style.fontSize = "16px"
        update()
        RSABool = false;
    }
}
