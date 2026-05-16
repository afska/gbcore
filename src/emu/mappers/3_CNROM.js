import Mapper from "../lib/Mapper";

/**
 * It provides bank-switching for CHR ROM only.
 * CPU $8000-$BFFF: 16 KB PRG ROM, fixed to the first page
 * CPU $C000-$FFFF: 16 KB PRG ROM, fixed to the second page (or mirror)
 * PPU $0000-$1FFF: 8 KB switchable CHR ROM bank
 */
export default class CNROM extends Mapper {
  onLoad() {
    this._state = {
      page: 0
    };
  }

  cpuRead(address) {
    if (address >= 0x4020 && address <= 0x7fff) {
      // Unused
      return 0;
    } else if (address >= 0x8000 && address <= 0xbfff) {
      // CPU $8000-$BFFF: First 16 KB of PRG-ROM
      return this.$getPrgPage(0)[address - 0x8000];
    } else if (address >= 0xc000 && address <= 0xffff) {
      // CPU $C000-$FFFF: Last 16 KB of PRG-ROM (or mirror of $8000-$BFFF)
      return this.$getPrgPage(1)[address - 0xc000];
    }
  }

  cpuWrite(address, value) {
    if (address >= 0x8000) this._state.page = value;
  }

  ppuRead(address) {
    // PPU $0000-$1FFF: 8 KB switchable CHR ROM bank
    return this.$getChrPage(this._state.page)[address];
  }

  ppuWrite(address, value) {
    if (!this.cartridge.header.usesChrRam) {
      return; // (only CHR-RAM is writable)
    }

    // PPU $0000-$1FFF: 8 KB switchable CHR ROM bank
    this.$getChrPage(this._state.page)[address] = value;
  }

  /** Returns a snapshot of the current state. */
  getSaveState() {
    return { ...super.getSaveState(), page: this._state.page };
  }

  /** Restores state from a snapshot. */
  setSaveState(saveState) {
    super.setSaveState(saveState);

    this._state.page = saveState.page;
  }
}
