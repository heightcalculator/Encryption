//Function to create a random prime number of any given length (a length of up to 308)
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

        // Baillie-PSW Test (simplified). For efficiency
        if (!millerRabinBase2(candidate)) continue;

        // Miller Rabin Test. For accuracy
        if (isPrime(candidate)) return candidate;
    }
}
