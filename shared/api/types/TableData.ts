export interface TableHistoryFinances {
    time: Date
    id: number
    type: 'WITHDRAW' | 'DEPOSIT' | 'TAKE'
    subject: number | string
    paySystem: 'SBER' | 'TINKOFF' | 'SBP' | 'USDT' | 'CARD'
    sum: number
    status: 'DONE' | 'PROCESSING' | 'ERROR'
}
export interface TableHistoryPurchases {
    id: number
    time: Date
    seller: string
    info: string
    url: string
    sum: number
    status: 'AWAIT_CONFIRMATION' | 'DONE'
    hasReview: boolean
}

export interface TableSales {
    categoryDescription: string
    category: string
    description: string
    sum: number
    date: string
}

export interface TableLots {
    name: string
    view: number
    favorites: number
    status: boolean
    date: string
    category: string
    product: string
    modal: string
}