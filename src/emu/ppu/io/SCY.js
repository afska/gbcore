import InMemoryRegister from "../../lib/InMemoryRegister";

/**
 * SCY: Background viewport Y position
 */
export default class SCY extends InMemoryRegister.PPU {
  onRead() {
    return this.value;
  }

  onWrite(value) {
    this.setValue(value);
  }
}
