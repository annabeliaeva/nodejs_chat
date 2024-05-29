import { DateTime } from 'luxon'

export const formatDate = (date: Date, format: 'DATE' | 'DATETIME' | 'DATETIME_TEXT') => {
    // TODO LOCALE FORMATTING
    switch(format) {
        case 'DATETIME': return DateTime.fromJSDate(date).toFormat('dd.MM.yyyy HH:mm:ss')
        case 'DATETIME_TEXT': return DateTime.fromJSDate(date).toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS)
        case 'DATE': return DateTime.fromJSDate(date).toFormat('dd.MM.yyyy')
    }
}