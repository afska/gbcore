const KB = 1024;

/**
 * As the Game Boy’s 16-bit address bus offers only limited space for ROM and RAM addressing, many games are using Memory Bank Controllers (MBCs) to expand the available address space by bank switching. These MBC chips are located in the game cartridge (that is, not in the Game Boy itself).
 * In each cartridge, the required (or preferred) MBC type should be specified in the byte at $0147 of the ROM, as described in the cartridge header.
 */
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

  getSaveState() {
    return {
      ram: Array.from(this.getRam())
    };
  }

  setSaveState(saveState) {
    this.setRam(saveState.ram);
  }

  setRam(bytes) {
    const pageSize = this.ramPageSize();

    for (let i = 0; i < bytes.length; i++) {
      const pageIndex = Math.floor(i / pageSize);
      const byteIndex = i % pageSize;

      const page = this.ramPages[pageIndex];
      if (page != null) page[byteIndex] = bytes[i];
    }
  }

  getRam() {
    const pageSize = this.ramPageSize();
    const totalRam = pageSize * this.ramPages.length;
    const bytes = new Uint8Array(totalRam);

    for (let i = 0; i < totalRam; i++) {
      const pageIndex = Math.floor(i / pageSize);
      const byteIndex = i % pageSize;

      const page = this.ramPages[pageIndex];
      bytes[i] = page[byteIndex];
    }

    return bytes;
  }

  get hasSaveFile() {
    return this.hasRam && this.options.batt;
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
