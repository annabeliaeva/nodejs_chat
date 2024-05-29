
import CryptoJS from 'crypto-js'

export const encrypt = (text: string, key: string) => {
    const keyHex = CryptoJS.enc.Hex.parse(key)
    const iv = CryptoJS.lib.WordArray.random(16)
    const encrypted = CryptoJS.AES.encrypt(text, keyHex, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    })
    return iv.toString() + ':' + encrypted.toString()
}

export const decrypt = (ciphertext: string, key: string) => {
    const ciphertextParts = ciphertext.split(':');
    const iv = CryptoJS.enc.Hex.parse(ciphertextParts.shift() as string);
    // Прямое использование зашифрованного текста в шестнадцатеричном формате, без преобразования в Base64
    const encryptedText = ciphertextParts.join(':');
    const keyHex = CryptoJS.enc.Hex.parse(key);

    // Используйте зашифрованный текст напрямую, указав, что он в шестнадцатеричном формате
    const decrypted = CryptoJS.AES.decrypt(CryptoJS.enc.Hex.parse(encryptedText).toString(CryptoJS.enc.Base64), keyHex, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
}