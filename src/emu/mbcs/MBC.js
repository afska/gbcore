const KB = 1024;

export default class MBC {
  constructor(cartridge) {
    this.cartridge = cartridge;

    const romLength = cartridge.header.romBanks16KiB * 16 * KB;
    const totalPages = Math.floor(romLength / this.pageSize());

    this.pages = [];
    for (let i = 0; i < totalPages; i++)
      this.pages.push(this._getPage(cartridge.bytes, this.pageSize(), i));

    this.onLoad();
  }

  pageSize() {
    return 16 * 1024;
  }

  onLoad() {}

  read(/*address*/) {
    throw new Error("not_implemented");
  }

  write(/*address, value*/) {
    throw new Error("not_implemented");
  }

  $getPage(page) {
    return this.pages[Math.max(0, page % this.pages.length)];
  }

  _getPage(memory, pageSize, page) {
    const offset = page * pageSize;
    return memory.subarray(offset, offset + pageSize);
  }
}
