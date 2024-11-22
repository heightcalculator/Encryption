function decrypt(encryptionKey, cipher){
    message = "";
    for (let i = 0; i < cipher.length; i++) {
        message += String.fromCharCode((cipher.charCodeAt(i)-encryptionKey) % 255);
    }
    return message;
}
