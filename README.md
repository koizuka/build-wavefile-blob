# build-wavefile-blob

create wave file (.WAV) image from floating point number samples.

## target environment
node(>= 15.7.0) or a browser which supports Blob.

## usage

```shell
npm install build-wavefile-blob
```

```typescript
import { buildWavefileBlob } from 'build-wavefile-blob';

const samples = [-1, 0, 1]; // sample value range is -1 to 1.

const monoWaveFileImage: Blob = buildWavefileBlob([samples], { sampleRate: 44100, bitDepth: 16 });

const stereoWaveFileImage: Blob = buildWavefileBlob([samples, samples], { sampleRate: 44100, bitDepth: 16 });

// write to a file(Node.js)
fs.writeFileSync('mono.wav', Buffer.from(await monoWaveFileImage.arrayBuffer()));
```

## limitation
* currently `bitDepth` must be 16.