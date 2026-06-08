import InMemoryRegister from "../../lib/InMemoryRegister";

/**
 * AUDENA (aka NR52): Audio master control
 */
export default class AUDENA extends InMemoryRegister.APU {
  onLoad() {
    this.addField("enableAudio", 7);

    this.setValue(0b10000000);
  }

  onRead() {
    return this.value;
  }

  onWrite(value) {
    this.setValue(value);
  }
}
