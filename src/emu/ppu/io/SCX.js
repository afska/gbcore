import InMemoryRegister from "../../lib/InMemoryRegister";

/**
 * SCX: Background viewport X position
 */
export default class SCX extends InMemoryRegister.PPU {
  onRead() {
    return this.value;
  }

  onWrite(value) {
    this.setValue(value);
  }
}
