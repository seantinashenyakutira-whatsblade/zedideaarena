export const social = {
  x: { url: 'https://x.com/WhatsbladeLLC', label: 'X (Twitter)', color: '#000', icon: 'twitter' },
  youtube: { url: 'https://www.youtube.com/@Zedideaarena?sub_confirmation=1', label: 'YouTube', color: '#FF0000', icon: 'youtube' },
  instagram: { url: 'https://instagram.com/zedideaarena', label: 'Instagram', color: '#E4405F', icon: 'instagram' },
  facebook: { url: 'https://www.facebook.com/profile.php?id=61573631967617', label: 'Facebook', color: '#1877F2', icon: 'facebook' },
  tiktok: { url: 'https://tiktok.com/@zedideaarena', label: 'TikTok', color: '#000', icon: 'music' },
  email: { url: 'mailto:support@zedideaarena.com', label: 'Email', color: '#6366F1', icon: 'mail' },
}

export type SocialPlatform = keyof typeof social
