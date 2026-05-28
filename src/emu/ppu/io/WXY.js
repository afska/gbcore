import InMemoryRegister from "../../lib/InMemoryRegister";

/**
 * WX/WY: Window X position plus 7, Y position
 */
export default class WXY extends InMemoryRegister.PPU {
  onRead() {
    return this.value;
  }

  onWrite(value) {
    this.setValue(value);
  }
}
