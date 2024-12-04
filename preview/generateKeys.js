
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

function update() {
    let p = BigInt(document.getElementById("keyP").value)
    let q = BigInt(document.getElementById("keyQ").value)
    let e = BigInt(document.getElementById("keyE").value)
    let public = publicKey(p, q, e)
    let private = privateKey(p, q, e)
    document.getElementById("textInput").value = "n = " + public[0] + "\ne = " + public[1]
    document.getElementById("textOutput").value = "n = " + private[0] + "\nd = " + private[1]
    document.getElementById("publicKeyUrl").innerHTML = "<a href='index.html?n=" + public[0] + "&e=" + public[1] + "'>Use this public key to encrypt</a>"
    document.getElementById("privateKeyUrl").innerHTML = "<a href='decrypt.html?n=" + private[0] + "&d=" + private[1] + "'>Use this private key to decrypt</a>"
}

function getRandomPrime(length) {
    // Generate a random number of the specified length
    function getRandomNumber(length) {
        const min = BigInt('1' + '0'.repeat(length - 1)); // Smallest number with the given length
        const max = BigInt('9'.repeat(length)); // Largest number with the given length
        const range = max - min + 1n;
        return min + BigInt(Math.floor(Math.random() * Number(range)));
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

function randomKey(){
    const primes = generateTwoPrimes(154);
    document.getElementById("keyP").value = primes[0];
    document.getElementById("keyQ").value = primes[1];
    let randE = Math.floor(Math.random() * 1000000000);
    while (gcd(eulersFunction, randE) != 1) {
        randE++;
    }
    document.getElementById("keyE").value = randE;
    update();
}
