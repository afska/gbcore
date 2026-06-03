import InMemoryRegister from "../../lib/InMemoryRegister";

const TRIGGER_BIT = 7;

/**
 * AUD1HIGH (aka NR14): Channel 1 period high & control
 */
export default class AUD1HIGH extends InMemoryRegister.APU {
  onLoad() {
    this.addWritableField("period", 0, 2)
      .addWritableField("enableLength", 6)
      .addWritableField("trigger", TRIGGER_BIT);
  }

  onRead() {
    return this.value & ~(1 << TRIGGER_BIT);
  }

  onWrite(value) {
    const wasEnabled = this.enableAudio;

    this.setValue((value & ~READ_ONLY_MASK) | (this.value & READ_ONLY_MASK));

    if (wasEnabled && !this.enableAudio) this.apu.reset();
  }
}
