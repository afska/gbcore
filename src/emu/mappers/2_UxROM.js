import Mapper from "../lib/Mapper";

/**
 * It provides bank-switching capabilities, just by writing a byte to any address on PRG ROM space.
 * CPU $8000-$BFFF: 16 KB switchable PRG ROM bank
 * CPU $C000-$FFFF: 16 KB PRG ROM bank, fixed to the last page
 * The CHR memory is usually RAM, mapped at PPU addresses $0000-$1FFF.
 */
export default class UxROM extends Mapper {
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
      // CPU $8000-$BFFF: 16 KB switchable PRG ROM bank
      return this.$getPrgPage(this._state.page)[address - 0x8000];
    } else if (address >= 0xc000 && address <= 0xffff) {
      // CPU $C000-$FFFF: 16 KB PRG ROM bank, fixed to the last page
      return this.$getPrgPage(this.prgPages.length - 1)[address - 0xc000];
    }
  }

  cpuWrite(address, value) {
    if (address >= 0x8000) this._state.page = value;
  }

  ppuRead(address) {
    // PPU $0000-$1FFF: 8 KB of CHR RAM
    return this.$getChrPage(0)[address];
  }

  ppuWrite(address, value) {
    if (!this.cartridge.header.usesChrRam) {
      return; // (only CHR-RAM is writable)
    }

    // PPU $0000-$1FFF: 8 KB of CHR RAM
    this.$getChrPage(0)[address] = value;
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
