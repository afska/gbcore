import Mapper from "../lib/Mapper";
import InMemoryRegister from "../lib/InMemoryRegister";

/**
 * It provides bank-switching for PRG and CHR ROM.
 * CPU $6000-$7FFF: 8 KB PRG RAM bank (optional)
 * CPU $8000-$9FFF (or $C000-$DFFF): 8 KB switchable PRG ROM bank
 * CPU $A000-$BFFF: 8 KB switchable PRG ROM bank
 * CPU $C000-$DFFF (or $8000-$9FFF): 8 KB PRG ROM bank, fixed to the second-last bank
 * CPU $E000-$FFFF: 8 KB PRG ROM bank, fixed to the last bank
 * PPU $0000-$07FF (or $1000-$17FF): 2 KB switchable CHR ROM bank
 * PPU $0800-$0FFF (or $1800-$1FFF): 2 KB switchable CHR ROM bank
 * PPU $1000-$13FF (or $0000-$03FF): 1 KB switchable CHR ROM bank
 * PPU $1400-$17FF (or $0400-$07FF): 1 KB switchable CHR ROM bank
 * PPU $1800-$1BFF (or $0800-$0BFF): 1 KB switchable CHR ROM bank
 * PPU $1C00-$1FFF (or $0C00-$0FFF): 1 KB switchable CHR ROM bank
 * This mapper allows even more PRG and CHR banks to be selected, but doesn’t have the
 * 5-write-quirk of MMC1. It does, though, have a scanline counter, which can trigger
 * an IRQ on decrementing.
 */
export default class MMC3 extends Mapper {
  prgRomPageSize() {
    return 8 * 1024;
  }

  chrRomPageSize() {
    return 1 * 1024;
  }

  onLoad() {
    this.prgRam = new Uint8Array(0x2000);
    this._prgRomBank0 = this.$getPrgPage(0);
    this._prgRomBank1 = this.$getPrgPage(0);
    this._prgRomBank2 = this.$getPrgPage(0);
    this._prgRomBank3 = this.$getPrgPage(this.prgPages.length - 1);
    this._chrRomBank0 = this.$getChrPage(0);
    this._chrRomBank1 = this.$getChrPage(0);
    this._chrRomBank2 = this.$getChrPage(0);
    this._chrRomBank3 = this.$getChrPage(0);
    this._chrRomBank4 = this.$getChrPage(0);
    this._chrRomBank5 = this.$getChrPage(0);
    this._chrRomBank6 = this.$getChrPage(0);
    this._chrRomBank7 = this.$getChrPage(0);

    this._state = {
      bankSelect: new BankSelectRegister(),
      bankData: [0, 0, 0, 0, 0, 0, 0, 0],
      irqEnabled: false,
      irqLatch: 0,
      irqCountdown: 0
    };

    this._loadPRGBanks();
    this._loadCHRBanks();
  }

  cpuRead(address) {
    if (address >= 0x4020 && address <= 0x5fff) {
      // Unused
      return 0;
    } else if (address >= 0x6000 && address <= 0x7fff) {
      // CPU $6000-$7FFF: 8 KB PRG RAM bank (optional)
      return this.prgRam[address - 0x6000];
    } else if (address >= 0x8000 && address <= 0x9fff) {
      // CPU $8000-$9FFF 8KB PRG ROM bank (switchable or fixed to second-last page)
      return this._prgRomBank0[address - 0x8000];
    } else if (address >= 0xa000 && address <= 0xbfff) {
      // CPU $A000-$BFFF: 8 KB switchable PRG ROM bank
      return this._prgRomBank1[address - 0xa000];
    } else if (address >= 0xc000 && address <= 0xdfff) {
      // CPU $C000-$DFFF 8KB PRG ROM bank (switchable or fixed to second-last page)
      return this._prgRomBank2[address - 0xc000];
    } else if (address >= 0xe000 && address <= 0xffff) {
      // CPU $E000-$FFFF: 8 KB PRG ROM bank, fixed to the last page
      return this._prgRomBank3[address - 0xe000];
    }
  }

  cpuWrite(address, input) {
    if (address >= 0x6000 && address <= 0x7fff) {
      // CPU $6000-$7FFF: 8 KB PRG RAM bank (optional)
      this.prgRam[address - 0x6000] = input;
    } else if (address >= 0x8000) {
      // (the writes are differentiated in even and odd, depending on `address`)
      const isEven = address % 2 === 0;

      if (address >= 0x8000 && address < 0x9fef) {
        const { bankSelect } = this._state;

        if (isEven) {
          // Writes to Bank select register
          bankSelect.setValue(input);
        } else {
          // Writes the page of the bank that was select with the even write before
          this._state.bankData[bankSelect.bankRegister] = input;
          this._loadPRGBanks();
          this._loadCHRBanks();
        }

        return;
      } else if (address >= 0xa000 && address < 0xbfff) {
        if (isEven) {
          // Mirroring
          // This changes the Name table mirroring type.
          this.ppu.memory?.changeNameTableMirroringTo?.(
            input & 1 ? "HORIZONTAL" : "VERTICAL"
          );
        }
        return;
      } else if (address >= 0xc000 && address < 0xe000) {
        if (isEven) {
          // IRQ latch
          // This register holds the value, that will be loaded into the actual
          // scanline counter when a reload is forced, or when the counter reached zero.
          this._state.irqLatch = input;
        } else {
          // IRQ reload
          // This register resets the actual scanline counter, and will push the
          // IRQ latch value to the counter in the next scanline.
          this._state.irqCountdown = 0;
        }
        return;
      } else if (address >= 0xe000) {
        if (isEven) {
          // IRQ disable
          // Writing to this register will disable the IRQ generation.
          this._state.irqEnabled = false;
        } else {
          // IRQ enable
          // Writing to this address area will enable IRQ generation again.
          this._state.irqEnabled = true;
        }
        return;
      }
    }
  }

  ppuRead(address) {
    if (address >= 0x0000 && address <= 0x03ff) {
      // PPU $0000-$03FF: 1 KB CHR ROM (switchable)
      return this._chrRomBank0[address];
    } else if (address >= 0x0400 && address <= 0x07ff) {
      // PPU $00400-$07FF: 1 KB CHR ROM (switchable)
      return this._chrRomBank1[address - 0x0400];
    } else if (address >= 0x0800 && address <= 0x0bff) {
      // PPU $0800-$0BFF: 1 KB CHR ROM (switchable)
      return this._chrRomBank2[address - 0x0800];
    } else if (address >= 0x0c00 && address <= 0x0fff) {
      // PPU $0C00-$0FFF: 1 KB CHR ROM (switchable)
      return this._chrRomBank3[address - 0x0c00];
    } else if (address >= 0x1000 && address <= 0x13ff) {
      // PPU $1000-$13FF: 1 KB CHR ROM (switchable)
      return this._chrRomBank4[address - 0x1000];
    } else if (address >= 0x1400 && address <= 0x17ff) {
      // PPU $1400-$17FF: 1 KB CHR ROM (switchable)
      return this._chrRomBank5[address - 0x1400];
    } else if (address >= 0x1800 && address <= 0x1bff) {
      // PPU $1800-$1BFF: 1 KB CHR ROM (switchable)
      return this._chrRomBank6[address - 0x1800];
    } else if (address >= 0x1c00 && address <= 0x1fff) {
      // PPU $1C00-$1FFF: 1 KB CHR ROM (switchable)
      return this._chrRomBank7[address - 0x1c00];
    }
  }

  ppuWrite(address, value) {
    if (!this.cartridge.header.usesChrRam) {
      return; // (only CHR-RAM is writable)
    }

    if (address >= 0x0000 && address <= 0x03ff) {
      // PPU $0000-$03FF: 1 KB CHR RAM (switchable)
      this._chrRomBank0[address] = value;
    } else if (address >= 0x0400 && address <= 0x07ff) {
      // PPU $00400-$07FF: 1 KB CHR RAM (switchable)
      this._chrRomBank1[address - 0x0400] = value;
    } else if (address >= 0x0800 && address <= 0x0bff) {
      // PPU $0800-$0BFF: 1 KB CHR RAM (switchable)
      this._chrRomBank2[address - 0x0800] = value;
    } else if (address >= 0x0c00 && address <= 0x0fff) {
      // PPU $0C00-$0FFF: 1 KB CHR RAM (switchable)
      this._chrRomBank3[address - 0x0c00] = value;
    } else if (address >= 0x1000 && address <= 0x13ff) {
      // PPU $1000-$13FF: 1 KB CHR RAM (switchable)
      this._chrRomBank4[address - 0x1000] = value;
    } else if (address >= 0x1400 && address <= 0x17ff) {
      // PPU $1400-$17FF: 1 KB CHR RAM (switchable)
      this._chrRomBank5[address - 0x1400] = value;
    } else if (address >= 0x1800 && address <= 0x1bff) {
      // PPU $1800-$1BFF: 1 KB CHR RAM (switchable)
      this._chrRomBank6[address - 0x1800] = value;
    } else if (address >= 0x1c00 && address <= 0x1fff) {
      // PPU $1C00-$1FFF: 1 KB CHR RAM (switchable)
      this._chrRomBank7[address - 0x1c00] = value;
    }
  }

  /**
   * Runs at cycle 260 of every scanline (including preline).
   */
  tick() {
    if (this._state.irqCountdown === 0) {
      this._state.irqCountdown = this._state.irqLatch;
    } else {
      this._state.irqCountdown--;

      if (this._state.irqCountdown === 0 && this._state.irqEnabled) {
        this.cpu.interrupt({
          id: "IRQ",
          vector: 0xfffe
        });
      }
    }
  }

  /** Returns a snapshot of the current state. */
  getSaveState() {
    return {
      ...super.getSaveState(),
      bankSelect: this._state.bankSelect.value,
      bankData: Array.from(this._state.bankData),
      irqEnabled: this._state.irqEnabled,
      irqLatch: this._state.irqLatch,
      irqCountdown: this._state.irqCountdown
    };
  }

  /** Restores state from a snapshot. */
  setSaveState(saveState) {
    super.setSaveState(saveState);

    this._state.bankSelect.setValue(saveState.bankSelect);
    this._state.bankData = Array.from(saveState.bankData);
    this._state.irqEnabled = saveState.irqEnabled;
    this._state.irqLatch = saveState.irqLatch;
    this._state.irqCountdown = saveState.irqCountdown;
    this._loadPRGBanks();
    this._loadCHRBanks();
  }

  _loadPRGBanks() {
    const { bankSelect, bankData } = this._state;

    if (bankSelect.prgRomBankMode === 0) {
      this._prgRomBank0 = this.$getPrgPage(bankData[6]);
      this._prgRomBank1 = this.$getPrgPage(bankData[7]);
      this._prgRomBank2 = this.$getPrgPage(this.prgPages.length - 2);
    } else {
      this._prgRomBank0 = this.$getPrgPage(this.prgPages.length - 2);
      this._prgRomBank1 = this.$getPrgPage(bankData[7]);
      this._prgRomBank2 = this.$getPrgPage(bankData[6]);
    }

    /**
     * PRG map mode | $8000.D6 = 0 | $8000.D6 = 1
     * ------------------------------------------
     * CPU Bank     | Value of MMC3 register
     * ------------------------------------------
     * $8000-$9FFF  | R6           | (-2)
     * $A000-$BFFF  | R7           | R7
     * $C000-$DFFF  | (-2)         | R6
     * $E000-$FFFF  | (-1)         | (-1)
     *
     * (-1) : the last bank
     * (-2) : the second last bank
     */
  }

  _loadCHRBanks() {
    const { bankSelect, bankData } = this._state;

    const r0 = bankData[0] & 0b11111110;
    const r1 = bankData[1] & 0b11111110;

    if (bankSelect.chrRomA12Inversion === 0) {
      this._chrRomBank0 = this.$getChrPage(r0);
      this._chrRomBank1 = this.$getChrPage(r0 + 1);
      this._chrRomBank2 = this.$getChrPage(r1);
      this._chrRomBank3 = this.$getChrPage(r1 + 1);
      this._chrRomBank4 = this.$getChrPage(bankData[2]);
      this._chrRomBank5 = this.$getChrPage(bankData[3]);
      this._chrRomBank6 = this.$getChrPage(bankData[4]);
      this._chrRomBank7 = this.$getChrPage(bankData[5]);
    } else {
      this._chrRomBank0 = this.$getChrPage(bankData[2]);
      this._chrRomBank1 = this.$getChrPage(bankData[3]);
      this._chrRomBank2 = this.$getChrPage(bankData[4]);
      this._chrRomBank3 = this.$getChrPage(bankData[5]);
      this._chrRomBank4 = this.$getChrPage(r0);
      this._chrRomBank5 = this.$getChrPage(r0 + 1);
      this._chrRomBank6 = this.$getChrPage(r1);
      this._chrRomBank7 = this.$getChrPage(r1 + 1);
    }

    /**
     * CHR map mode | $8000.D7 = 0 | $8000.D7 = 1
     * ------------------------------------------
     * PPU Bank	    | Value of MMC3 register
     * ------------------------------------------
     * $0000-$03FF  | R0           | R2
     * $0400-$07FF  | ^^           | R3
     * $0800-$0BFF  | R1           | R4
     * $0C00-$0FFF  | ^^           | R5
     * $1000-$13FF  | R2           | R0
     * $1400-$17FF  | R3           | ^^
     * $1800-$1BFF  | R4           | R1
     * $1C00-$1FFF  | R5           | ^^
     */
  }
}

/**
 * Bank select ($8000-$9FEE, even address)
 * ---- ----
 * CPMx xRRR
 * |||   |||
 * |||   +++- Specify which bank register to update on next write to Bank Data register
 * |||          000: R0: Select 2 KB CHR bank at PPU $0000-$07FF (or $1000-$17FF)
 * |||          001: R1: Select 2 KB CHR bank at PPU $0800-$0FFF (or $1800-$1FFF)
 * |||          010: R2: Select 1 KB CHR bank at PPU $1000-$13FF (or $0000-$03FF)
 * |||          011: R3: Select 1 KB CHR bank at PPU $1400-$17FF (or $0400-$07FF)
 * |||          100: R4: Select 1 KB CHR bank at PPU $1800-$1BFF (or $0800-$0BFF)
 * |||          101: R5: Select 1 KB CHR bank at PPU $1C00-$1FFF (or $0C00-$0FFF)
 * |||          110: R6: Select 8 KB PRG ROM bank at $8000-$9FFF (or $C000-$DFFF)
 * |||          111: R7: Select 8 KB PRG ROM bank at $A000-$BFFF
 * ||+------- Nothing on the MMC3, see MMC6
 * |+-------- PRG ROM bank mode (0: $8000-$9FFF swappable,
 * |                                $C000-$DFFF fixed to second-last bank;
 * |                             1: $C000-$DFFF swappable,
 * |                                $8000-$9FFF fixed to second-last bank)
 * +--------- CHR A12 inversion (0: two 2 KB banks at $0000-$0FFF,
                                 four 1 KB banks at $1000-$1FFF;
                                 1: two 2 KB banks at $1000-$1FFF,
                                 four 1 KB banks at $0000-$0FFF)
 */
class BankSelectRegister extends InMemoryRegister {
  onLoad() {
    this.addField("bankRegister", 0, 3)
      .addField("prgRomBankMode", 6)
      .addField("chrRomA12Inversion", 7);
  }
}
