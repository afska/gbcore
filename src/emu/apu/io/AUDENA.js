import InMemoryRegister from "../../lib/InMemoryRegister";

const READ_ONLY_MASK = 0b1111; // TODO: "enable" fields shouldn't be "fields"

/**
 * AUDENA (aka NR52): Audio master control
 */
export default class AUDENA extends InMemoryRegister.APU {
  onLoad() {
    this.addWritableField("enableChannel1", 0) // TODO: these shouldn't be fields
      .addWritableField("enableChannel2", 1)
      .addWritableField("enableChannel3", 2)
      .addWritableField("enableChannel4", 3)
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
