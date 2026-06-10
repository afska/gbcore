import MBC from "./MBC";

const KB = 1024;

export default (options = {}) => {
  /**
   * Small games of not more than 32 KiB ROM do not require a MBC chip for ROM banking. The ROM is directly mapped to memory at $0000-7FFF. Optionally up to 8 KiB of RAM could be connected at $A000-BFFF, using a discrete logic decoder in place of a full MBC chip.
   */
  return class NoMBC extends MBC {
    onLoad() {
      this.options = options;
    }

    romPageSize() {
      return 32 * KB;
    }

    read(address) {
      if (address >= 0x0000 && address < 0x8000)
        return this.$getRomPage(0)[address] ?? 0xff;

      if (this.hasRam && address >= 0xa000 && address < 0xc000)
        return this.$getRamPage(0)[address - 0xa000];

      return 0xff;
    }

    write(address, value) {
      if (this.hasRam && address >= 0xa000 && address < 0xc000)
        return (this.$getRamPage(0)[address - 0xa000] = value);
    }
  };
};
