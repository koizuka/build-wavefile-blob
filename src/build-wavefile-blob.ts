
type ChunkId = 'RIFF' | 'WAVE' | 'fmt ' | 'data';

function uint32(value: number): Uint8Array {
  const data = new Uint8Array(4);
  const view = new DataView(data.buffer);
  view.setUint32(0, value, true);
  return data;
}

function uint16(value: number): Uint8Array {
  const data = new Uint8Array(2);
  const view = new DataView(data.buffer);
  view.setUint16(0, value, true);
  return data;
}

type BlobElement = Blob | Uint8Array | ChunkId;

function withSize(...contents: BlobElement[]): [Uint8Array, Blob] {
  const payload = (contents.length == 1 && contents[0] instanceof Blob) ? contents[0] : new Blob(contents);
  return [uint32(payload.size), payload];
}

type Fmt = {
  audioFormat: 1; // Linear PCM
  numChannels: number;
  sampleRate: number;
  byteRate: number;
  blockAlign: number;
  bitsPerSample: number;
};
function encodeFmt(fmt: Fmt): BlobElement[] {
  return [
    uint16(fmt.audioFormat),
    uint16(fmt.numChannels),
    uint32(fmt.sampleRate),
    uint32(fmt.byteRate),
    uint16(fmt.blockAlign),
    uint16(fmt.bitsPerSample),
  ];
}

function encode16bitPcm(samples: number[][]): Uint8Array {
  const numChannels = samples.length;
  const numSamples = samples[0].length;

  const size = numChannels * numSamples * 2;
  const a = new Uint8Array(size);
  const view = new DataView(a.buffer);

  let offset = 0;
  for (let i = 0; i < numSamples; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const s = Math.max(Math.min(samples[ch][i], 1), -1);
      view.setInt16(offset, s * 0x7fff, true);
      offset += 2;
    }
  }
  return a;
}

export type WaveFormat = {
  /** 44100, 48000, etc.*/
  sampleRate: number;
  /** must be 16 */
  bitDepth: 16;
}

/**
 * 
 * @param samples samples per channel, each value is -1 to 1 floating point number.
 * @param format specifies the format of the audio data.
 * @returns Blob containing a .wav file.
 */
export function buildWaveFileBlob(samples: number[][], format: WaveFormat): Blob {
  if (format.bitDepth != 16) {
    throw new Error('format.bitDepth must be 16');
  }
  if (format.sampleRate < 1) {
    throw new Error('format.sampleRate must be positive');
  }

  if (samples.length < 1) {
    throw new Error('samples.length must be positive');
  }
  samples.reduce((prev, cur) => {
    if (prev.length !== cur.length) {
      throw new Error('samples must be the same length');
    }
    return cur;
  })

  const numChannels = samples.length;

  const fmt: Fmt = {
    audioFormat: 1,
    numChannels,
    sampleRate: format.sampleRate,
    byteRate: format.sampleRate * numChannels * format.bitDepth / 8,
    blockAlign: format.bitDepth / 8 * numChannels,
    bitsPerSample: format.bitDepth,
  };

  return new Blob([
    'RIFF',
    ...withSize(
      'WAVE',
      'fmt ', ...withSize(...encodeFmt(fmt)),
      'data', ...withSize(encode16bitPcm(samples)),
    ),
  ], { type: 'audio/wav' });
}
