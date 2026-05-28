import InMemoryRegister from "../../lib/InMemoryRegister";

/**
 * SCX/SCY: Background viewport X/Y position
 */
export default class SCXY extends InMemoryRegister.PPU {
  onRead() {
    return this.value;
  }

  onWrite(value) {
    this.setValue(value);
  }
}
