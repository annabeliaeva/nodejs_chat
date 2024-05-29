export interface UserPanelInfoResponse {
    avatarUrl: string
    newMessages: number
    verified: boolean
    regDate?: Date
    lastActive?: Date
    balance?: {
        real: number
        bonus: number
    }
}

export interface UserPanelFinanceResponse {
    totalEarnings: number
    totalDeposit: number
    totalPurchases: number
    bonusAmount: number
}
