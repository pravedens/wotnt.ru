export interface Comment {
    id: number
    post_id: number
    user_id: number
    parent_id: number | null
    content: string
    likes_count: number
    is_approved: boolean
    created_at: string
    updated_at: string
    user?: {
        id: number
        name: string
        avatar?: string
        full_name?: string
    }
    replies?: Comment[]
    is_liked?: boolean
}

export interface CommentForm {
    content: string
    parent_id?: number | null
}