import RingBuffer from "ringbufferjs";

const CHANNELS = 2;
const AUDIO_BUFFER_SIZE = 4096 * CHANNELS;

class PlayerWorklet extends AudioWorkletProcessor {
  constructor() {
    super();

    this.buffer = new RingBuffer(AUDIO_BUFFER_SIZE);

    this.port.onmessage = (event) => {
      for (let sample of event.data) this.buffer.enq(sample);
    };
  }

  process(inputs, outputs) {
    const left = outputs[0][0];
    const right = outputs[0][1];
    const size = left.length;

    try {
      const samples = this.buffer.deqN(size * CHANNELS);
      for (let i = 0; i < size; i++) {
        left[i] = samples[i * CHANNELS];
        right[i] = samples[i * CHANNELS + 1];
      }
    } catch (e) {
      // buffer underrun (needed {size}, got {this.buffer.size()})
      // ignore empty buffers... assume audio has just stopped
      for (let i = 0; i < size; i++) left[i] = right[i] = 0;
    }

    // request new samples
    this.port.postMessage({
      need: size,
      have: this.buffer.size() / CHANNELS,
      target: AUDIO_BUFFER_SIZE / CHANNELS / 2
    });

    return true;
  }
}

registerProcessor("player-worklet", PlayerWorklet);
