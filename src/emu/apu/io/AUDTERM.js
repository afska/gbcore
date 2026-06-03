import InMemoryRegister from "../../lib/InMemoryRegister";

/**
 * AUDTERM (aka NR51): Sound panning
 */
export default class AUDTERM extends InMemoryRegister.APU {
  onLoad() {
    this.addField("channel1Right", 0)
      .addField("channel2Right", 1)
      .addField("channel3Right", 2)
      .addField("channel4Right", 3)
      .addField("channel1Left", 4)
      .addField("channel2Left", 5)
      .addField("channel3Left", 6)
      .addField("channel4Left", 7);

    this.setValue(0b11111111);
  }

  onRead() {
    return this.value;
  }

  onWrite(value) {
    this.setValue(value);
  }
}
