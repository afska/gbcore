import byte from "./lib/byte";

export default class MemoryBus {
  constructor() {
    this.ram = new Uint8Array(0xffff);
  }

  read(address) {
    return this.ram[address];
  }

  write(address, value) {
    this.ram[address] = value;
  }

  read16(address) {
    return byte.buildU16(this.read(address + 1), this.read(address));
  }
}
