import InMemoryRegister from "../../lib/InMemoryRegister";

const READ_ONLY_MASK = 0b1111;

/**
 * AUDENA (aka NR52): Audio master control
 */
export default class AUDENA extends InMemoryRegister.APU {
  onLoad() {
    this.addWritableField("enableChannel0", 0)
      .addWritableField("enableChannel1", 1)
      .addWritableField("enableChannel2", 2)
      .addWritableField("enableChannel3", 3)
      .addField("enableAudio", 7);

    this.setValue(0b10000000);
  }

  onRead() {
    return this.value;
  }

  onWrite(value) {
    const wasEnabled = this.enableAudio;

    this.setValue((value & ~READ_ONLY_MASK) | (this.value & READ_ONLY_MASK));

    if (wasEnabled && !this.enableAudio) this.apu.reset();
  }
}
