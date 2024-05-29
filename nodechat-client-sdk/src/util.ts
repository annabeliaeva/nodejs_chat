import { v4 as uuid } from 'uuid'

export const isJson = (str: string) => {
    try {
        JSON.parse(str)
    } catch (e) {
        return false
    }
    return true
}

export const randomMessageHash = () => uuid().replaceAll('-', '')