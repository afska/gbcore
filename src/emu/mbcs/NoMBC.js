import MBC from "./MBC";

const KB = 1024;

export default class NoMBC extends MBC {
  onLoad() {
    this.ram = new Uint8Array(8 * KB);
  }

  read(address) {
    if (address >= 0x0000 && address < 0x8000)
      return this.cartridge.bytes[address] ?? 0xff;

    if (this._hasRAM() && address >= 0xa000 && address < 0xc000)
      return this.ram[address - 0xa000];

    return 0xff;
  }

  write(address, value) {
    if (this._hasRAM() && address >= 0xa000 && address < 0xc000)
      return (this.ram[address - 0xa000] = value);
  }

  _hasRAM() {
    return this.cartridge.header.ramBanks8KiB === 1;
  }
}
