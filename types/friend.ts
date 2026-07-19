// types/friend.ts

export interface Friend {
    id: number
    title: string
    slug: string
    description?: string
    thumbnail?: string
    thumbnail_url?: string
    link?: string
    sort_order: number
}

export interface FriendsResponse {
    success: boolean
    data: Friend[]
}