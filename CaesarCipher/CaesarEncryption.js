function encrypt(encryptionKey, message){
    crypticMessage = "";
    for (let i = 0; i < message.length; i++) {
        crypticMessage += String.fromCharCode((message.charCodeAt(i)+encryptionKey) % 255);
    }
    return crypticMessage
}
