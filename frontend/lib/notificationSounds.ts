const SOUNDS = {
  chime: '/sounds/chime.wav',
  pop: '/sounds/pop.wav',
  alert: '/sounds/alert.wav',
  bell: '/sounds/bell.wav',
  ping: '/sounds/ping.wav',
}

type SoundName = keyof typeof SOUNDS

class NotificationSoundManager {
  private audioContext: AudioContext | null = null
  private buffers: Map<string, AudioBuffer> = new Map()
  private volume = 0.7
  private enabled = true
  private loaded = false

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return this.audioContext
  }

  async preload() {
    if (this.loaded || typeof window === 'undefined') return
    this.loaded = true
    const ctx = this.getContext()
    if (ctx.state === 'suspended') await ctx.resume()

    for (const [name, url] of Object.entries(SOUNDS)) {
      try {
        const res = await fetch(url)
        const arrayBuffer = await res.arrayBuffer()
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
        this.buffers.set(name, audioBuffer)
      } catch (e) {
        console.warn(`Failed to load sound: ${name}`, e)
      }
    }
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v))
  }

  setEnabled(e: boolean) {
    this.enabled = e
  }

  isLoaded(name: SoundName): boolean {
    return this.buffers.has(name)
  }

  play(name: SoundName = 'chime') {
    if (!this.enabled || typeof window === 'undefined') return

    const buffer = this.buffers.get(name)
    if (!buffer) return

    try {
      const ctx = this.getContext()
      if (ctx.state === 'suspended') ctx.resume()

      const source = ctx.createBufferSource()
      const gain = ctx.createGain()
      gain.gain.value = this.volume
      source.buffer = buffer
      source.connect(gain)
      gain.connect(ctx.destination)
      source.start(0)
    } catch (e) {
      console.warn('Failed to play sound:', e)
    }
  }
}

export const notificationSounds = new NotificationSoundManager()
export type { SoundName }
export { SOUNDS }
