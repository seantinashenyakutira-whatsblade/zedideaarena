export const ADSENSE_PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || 'ca-pub-1087044286126919'
export const ADSENSE_AD_SLOT_BANNER = process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER || ''
export const ADSENSE_AD_SLOT_SIDEBAR = process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR || ''
export const ADSENSE_AD_SLOT_INFEED = process.env.NEXT_PUBLIC_ADSENSE_SLOT_INFEED || ''

export const adsEnabled = true

export const adConfig = {
  publisherId: ADSENSE_PUBLISHER_ID,
  slots: {
    banner: ADSENSE_AD_SLOT_BANNER,
    sidebar: ADSENSE_AD_SLOT_SIDEBAR,
    infeed: ADSENSE_AD_SLOT_INFEED,
  },
  infeedFrequency: 6,
}
