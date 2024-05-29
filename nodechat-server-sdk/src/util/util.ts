import { v4 as uuid } from 'uuid'

export const repeatString = (str: string, length: number): string => {
    let result = ''
    while (result.length < length) {
        result += str
    }

    // Crop to length
    return result.slice(0, length)
}

export const isJson = (str: string) => {
    try {
        JSON.parse(str)
    } catch (e) {
        return false
    }
    return true
}

export const randomMessageHash = () => uuid().replaceAll('-', '')