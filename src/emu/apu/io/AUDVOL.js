import InMemoryRegister from "../../lib/InMemoryRegister";

/**
 * AUDVOL (aka NR50): Master volume
 */
export default class AUDVOL extends InMemoryRegister.APU {
  onLoad() {
    this.addField("rightVolume", 0, 3).addField("leftVolume", 4, 3);

    this.setValue(0b11111111);
  }

  onRead() {
    return this.value;
  }

  onWrite(value) {
    this.setValue(value);
  }
}
