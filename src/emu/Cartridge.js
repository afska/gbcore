export default class Cartridge {
  constructor(bytes) {
    this.rom = bytes;
  }

  onRead(address) {
    if (address >= 0x0000 && address < 0x8000) {
      return this.rom[address] ?? 0xff;
    }

    return 0xff;
  }

  onWrite(address, value) {
    // TODO: IMPLEMENT
  }
}
