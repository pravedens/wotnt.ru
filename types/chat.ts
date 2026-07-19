export interface Conversation {
    id: number
    type: 'private' | 'teacher_student' | 'group'
    other_user?: {
        id: number
        full_name: string
        avatar_url: string
    }
    last_message?: Message
    last_message_at?: string
    unread_count: number
    party_id?: number
}

export interface Message {
    id: number
    conversation_id: number
    sender_id: number
    sender_name: string
    sender_avatar?: string
    receiver_id: number
    message: string
    type: 'text' | 'image' | 'file' | 'system'
    attachments?: any[]
    is_mine: boolean
    is_read: boolean
    created_at: string
}