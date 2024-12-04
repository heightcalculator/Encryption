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
