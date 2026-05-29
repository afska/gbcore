import MBC from "./MBC";

const KB = 1024;

export default (options = {}) => {
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
