const ADSENSE_PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || ''
const ADSENSE_AD_SLOT_BANNER = process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER || ''
const ADSENSE_AD_SLOT_SIDEBAR = process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR || ''
const ADSENSE_AD_SLOT_INFEED = process.env.NEXT_PUBLIC_ADSENSE_SLOT_INFEED || ''

export const adsEnabled = !!ADSENSE_PUBLISHER_ID

export const adConfig = {
  publisherId: ADSENSE_PUBLISHER_ID,
  slots: {
    banner: ADSENSE_AD_SLOT_BANNER,
    sidebar: ADSENSE_AD_SLOT_SIDEBAR,
    infeed: ADSENSE_AD_SLOT_INFEED,
  },
  // Placement frequency: show an ad card every N items in grids
  infeedFrequency: 6,
}
