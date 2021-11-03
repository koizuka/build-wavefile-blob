import "./setupBlobForTest";
import { buildWaveFileBlob } from "./build-wavefile-blob";

async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}

test('buildWavefileBlob single channel 16bit', async () => {
  const samples = [[1, 0, -1]];
  const sampleRate = 44100;
  const bitDepth = 16;

  const shouldBe = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, // 'RIFF'
    0x2a, 0x00, 0x00, 0x00, // size
    0x57, 0x41, 0x56, 0x45, // 'WAVE'
    0x66, 0x6d, 0x74, 0x20, // 'fmt '
    0x10, 0x00, 0x00, 0x00, // size
    0x01, 0x00, // format
    0x01, 0x00, // channels
    0x44, 0xac, 0x00, 0x00, // sample rate (44100)
    0x88, 0x58, 0x01, 0x00, // byte rate (44100*2)
    0x02, 0x00, // block align
    0x10, 0x00, // bit depth (16)
    0x64, 0x61, 0x74, 0x61, // 'data'
    0x06, 0x00, 0x00, 0x00, // size
    0xff, 0x7f, // sample 1
    0x00, 0x00, // sample 0
    0x01, 0x80, // sample -1
  ]);

  const blob = buildWaveFileBlob(samples, { sampleRate, bitDepth });
  expect(blob.type).toBe('audio/wav');

  const got = await blobToUint8Array(blob);
  expect(got.length).toEqual(shouldBe.length);
  expect(got).toEqual(shouldBe);
});

test('buildWavefileBlob two channels 16bit', async () => {
  const samples = [[1, 0], [0, -1]];
  const sampleRate = 48000;
  const bitDepth = 16;

  const shouldBe = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, // 'RIFF'
    0x2c, 0x00, 0x00, 0x00, // size
    0x57, 0x41, 0x56, 0x45, // 'WAVE'
    0x66, 0x6d, 0x74, 0x20, // 'fmt '
    0x10, 0x00, 0x00, 0x00, // size
    0x01, 0x00, // format
    0x02, 0x00, // channels
    0x80, 0xbb, 0x00, 0x00, // sample rate (48000)
    0x00, 0xee, 0x02, 0x00, // byte rate (48000*2*2)
    0x04, 0x00, // block align
    0x10, 0x00, // bit depth (16)
    0x64, 0x61, 0x74, 0x61, // 'data'
    0x08, 0x00, 0x00, 0x00, // size
    0xff, 0x7f, // sample 1
    0x00, 0x00, // sample 0
    0x00, 0x00, // sample 0
    0x01, 0x80, // sample -1
  ]);

  const blob = buildWaveFileBlob(samples, { sampleRate, bitDepth });
  const got = await blobToUint8Array(blob);
  expect(got.length).toEqual(shouldBe.length);
  expect(got).toEqual(shouldBe);
});