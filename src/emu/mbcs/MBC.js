const KB = 1024;

export default class MBC {
  constructor(cartridge) {
    this.cartridge = cartridge;

    const romLength = cartridge.header.romBanks16KiB * 16 * KB;
    const totalRomPages = Math.floor(romLength / this.romPageSize());
    this.romPages = [];
    for (let i = 0; i < totalRomPages; i++)
      this.romPages.push(
        this._buildPage(cartridge.bytes, this.romPageSize(), i)
      );

    const ramLength = cartridge.header.ramBanks8KiB * 8 * KB;
    const totalRamPages = Math.floor(ramLength / this.ramPageSize());
    this.ramPages = new Array(totalRamPages)
      .fill(null)
      .map((it) => new Uint8Array(this.ramPageSize()));

    this.options = {};

    this.onLoad();
  }

  romPageSize() {
    return 16 * 1024;
  }

  ramPageSize() {
    return 8 * 1024;
  }

  onLoad() {}

  read(/*address*/) {
    throw new Error("not_implemented");
  }

  write(/*address, value*/) {
    throw new Error("not_implemented");
  }

  setRam(bytes) {
    const ramPageSize = this.ramPageSize();

    for (let i = 0; i < bytes.length; i++) {
      const page = Math.floor(i / ramPageSize);
      const byteIndex = i % ramPageSize;

      this.ramPages[page]?.[byteIndex] = bytes[i];
    }
  }

  getRam() {
    const ramPageSize = this.ramPageSize();
    const totalRam = ramPageSize * this.ramPages.length;
    const bytes = new Uint8Array(totalRam);

    for (let i = 0; i < totalRam; i++) {
      const page = Math.floor(i / ramPageSize);
      const byteIndex = i % ramPageSize;

      bytes[i] = this.ramPages[page][byteIndex];
    }

    return bytes;
  }

  get hasSaveFile() {
    return this.hasRam && this.options.ram && this.options.batt;
  }

  get hasRam() {
    return this.ramPages.length > 0;
  }

  $getRomPage(page) {
    return this.romPages[Math.max(0, page % this.romPages.length)];
  }

  $getRamPage(page) {
    return this.ramPages[Math.max(0, page % this.ramPages.length)];
  }

  _buildPage(memory, pageSize, page) {
    const offset = page * pageSize;
    return memory.subarray(offset, offset + pageSize);
  }
}
