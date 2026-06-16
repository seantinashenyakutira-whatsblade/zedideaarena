const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const SOUNDS_DIR = path.join(__dirname, '..', 'frontend', 'public', 'sounds');

function writeWav(filepath, samples) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = SAMPLE_RATE * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const dataSize = samples.length * blockAlign;
  const headerSize = 44;

  const buffer = Buffer.alloc(headerSize + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    const val = sample < 0 ? sample * 32768 : sample * 32767;
    buffer.writeInt16LE(Math.round(val), headerSize + i * 2);
  }

  fs.writeFileSync(filepath, buffer);
}

function generateTone(freq, duration, sampleRate = SAMPLE_RATE, decayEnd = 0.1) {
  const n = Math.floor(sampleRate * duration);
  const samples = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    let envelope = 1;
    if (i < sampleRate * 0.005) envelope = i / (sampleRate * 0.005);
    if (i > n - sampleRate * decayEnd) envelope *= (n - i) / (sampleRate * decayEnd);
    samples[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.5;
  }
  return samples;
}

function mixSamples(...sampleArrays) {
  const maxLen = Math.max(...sampleArrays.map(s => s.length));
  const result = new Float64Array(maxLen);
  for (const samples of sampleArrays) {
    for (let i = 0; i < samples.length; i++) {
      result[i] += samples[i];
    }
  }
  for (let i = 0; i < maxLen; i++) {
    if (result[i] > 1) result[i] = 1;
    if (result[i] < -1) result[i] = -1;
  }
  return result;
}

function generateSilence(duration, sampleRate = SAMPLE_RATE) {
  return new Float64Array(Math.floor(sampleRate * duration));
}

// 1. chime.wav - pleasant two-tone ascending chime (default)
function generateChime() {
  const tone1 = generateTone(880, 0.15);
  const gap = generateSilence(0.05);
  const tone2 = generateTone(1320, 0.25);
  return mixSamples(tone1, gap, tone2);
}

// 2. pop.wav - short pop sound
function generatePop() {
  const n = Math.floor(SAMPLE_RATE * 0.08);
  const samples = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const envelope = Math.exp(-t * 60);
    samples[i] = Math.sin(2 * Math.PI * 600 * t * (1 - t * 5)) * envelope * 0.5;
  }
  return samples;
}

// 3. alert.wav - more urgent alert for high priority
function generateAlert() {
  const tone1 = generateTone(660, 0.12);
  const gap1 = generateSilence(0.06);
  const tone2 = generateTone(880, 0.12);
  const gap2 = generateSilence(0.06);
  const tone3 = generateTone(1100, 0.2);
  return mixSamples(tone1, gap1, tone2, gap2, tone3);
}

// 4. bell.wav - gentle bell
function generateBell() {
  const n = Math.floor(SAMPLE_RATE * 0.6);
  const samples = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const envelope = Math.exp(-t * 4);
    samples[i] = (
      Math.sin(2 * Math.PI * 1047 * t) * 0.4 +
      Math.sin(2 * Math.PI * 1568 * t) * 0.2 +
      Math.sin(2 * Math.PI * 2093 * t) * 0.1
    ) * envelope * 0.4;
  }
  return samples;
}

// 5. ping.wav - short ping
function generatePing() {
  const n = Math.floor(SAMPLE_RATE * 0.15);
  const samples = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const envelope = Math.exp(-t * 20);
    samples[i] = Math.sin(2 * Math.PI * 1200 * t) * envelope * 0.4;
  }
  return samples;
}

const sounds = {
  'chime.wav': generateChime,
  'pop.wav': generatePop,
  'alert.wav': generateAlert,
  'bell.wav': generateBell,
  'ping.wav': generatePing,
};

if (!fs.existsSync(SOUNDS_DIR)) {
  fs.mkdirSync(SOUNDS_DIR, { recursive: true });
}

for (const [name, gen] of Object.entries(sounds)) {
  const samples = gen();
  writeWav(path.join(SOUNDS_DIR, name), samples);
  console.log(`Generated ${name} (${samples.length} samples)`);
}

console.log(`\nAll sounds saved to ${SOUNDS_DIR}`);
