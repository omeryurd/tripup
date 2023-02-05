export interface Activity {
    userId: string
    postId: string
    createdAt: string
    title: string
    description: string
    activityType: string
    attachmentUrl?: string
  }