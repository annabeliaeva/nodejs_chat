import { RedisClientType, createClient } from 'redis'


const client = createClient({
    url: process.env.REDIS_URL
})
client.on('error', err => console.log('Redis connection error', err))
client.connect()

export const Redis = client