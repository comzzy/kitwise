class KitwisePCMProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const inputRate =
      options.processorOptions?.inputSampleRate || sampleRate;
    const targetRate =
      options.processorOptions?.targetSampleRate || 24000;

    this.ratio = inputRate / targetRate;
    this.pending = [];
    this.pendingLength = 0;
    this.targetChunkLength = 1200; // 50 ms at 24 kHz
  }

  process(inputs) {
    const input = inputs[0]?.[0];
    if (!input?.length) return true;

    const outputLength = Math.max(1, Math.floor(input.length / this.ratio));
    const output = new Int16Array(outputLength);

    for (let i = 0; i < outputLength; i++) {
      const sourcePosition = i * this.ratio;
      const left = Math.floor(sourcePosition);
      const right = Math.min(left + 1, input.length - 1);
      const fraction = sourcePosition - left;
      const sample =
        (input[left] ?? 0) * (1 - fraction) +
        (input[right] ?? 0) * fraction;

      output[i] = Math.max(
        -32768,
        Math.min(32767, Math.round(sample * 32767))
      );
    }

    this.pending.push(output);
    this.pendingLength += output.length;

    if (this.pendingLength >= this.targetChunkLength) {
      const joined = new Int16Array(this.pendingLength);
      let offset = 0;
      for (const chunk of this.pending) {
        joined.set(chunk, offset);
        offset += chunk.length;
      }
      this.pending = [];
      this.pendingLength = 0;
      this.port.postMessage(joined.buffer, [joined.buffer]);
    }

    return true;
  }
}

registerProcessor("kitwise-pcm", KitwisePCMProcessor);