import { randomBytes, createCipheriv, createDecipheriv } from 'crypto'
class AesEncryptor {
  private secretKey: Buffer

  constructor(secretKey: string) {
    this.secretKey = Buffer.from(secretKey, 'hex')
    if (this.secretKey.length !== 32) {
      throw new Error('Secret key must be 32 bytes for AES-256.')
    }
  }

  encrypt(data: string): string {
    const iv = randomBytes(16) // Генерация случайного IV
    const cipher = createCipheriv('aes-256-cbc', this.secretKey, iv)
    let encrypted = cipher.update(data)
    encrypted = Buffer.concat([encrypted, cipher.final()])
    return iv.toString('hex') + ':' + encrypted.toString('hex')
  }

  decrypt(data: string): string {
    const textParts = data.split(':')
    const iv = Buffer.from(textParts.shift() as string, 'hex')
    const encryptedText = Buffer.from(textParts.join(':'), 'base64')
    const decipher = createDecipheriv('aes-256-cbc', this.secretKey, iv)
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString()
  }

  static getRandomKey(): string {
    return randomBytes(32).toString('hex')
  }
}

export { AesEncryptor }
