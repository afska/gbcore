import Mapper from "../lib/Mapper";
import InMemoryRegister from "../lib/InMemoryRegister";

/**
 * It provides bank-switching for PRG and CHR ROM.
 * CPU $6000-$7FFF: 8 KB PRG RAM bank (optional)
 * CPU $8000-$BFFF: 16 KB PRG ROM bank, either switchable or fixed to the first bank
 * CPU $C000-$FFFF: 16 KB PRG ROM bank, either fixed to the last bank or switchable
 * PPU $0000-$0FFF: 4 KB switchable CHR ROM bank
 * PPU $1000-$1FFF: 4 KB switchable CHR ROM bank
 * Through writes to the MMC1 control register, it is possible for the program to
 * swap the fixed and switchable PRG ROM banks or to set up 32 KB PRG bankswitching.
 */
export default class MMC1 extends Mapper {
  chrRomPageSize() {
    return 4 * 1024;
  }

  onLoad() {
    this.prgRam = new Uint8Array(0x2000);
    this._prgRomBank0 = this.$getPrgPage(0);
    this._prgRomBank1 = this.$getPrgPage(this.prgPages.length - 1);
    this._chrRomBank0 = this.$getChrPage(0);
    this._chrRomBank1 = this.$getChrPage(0);

    this._state = {
      load: new LoadRegister(),
      control: new ControlRegister(),
      chrBank0: new CHRBank0Register(),
      chrBank1: new CHRBank1Register(),
      prgBank: new PRGBankRegister()
    };
  }

  cpuRead(address) {
    if (address >= 0x4020 && address <= 0x5fff) {
      // Unused
      return 0;
    } else if (address >= 0x6000 && address <= 0x7fff) {
      // CPU $6000-$7FFF: 8 KB PRG RAM bank (optional)
      return this.prgRam[address - 0x6000];
    } else if (address >= 0x8000 && address <= 0xbfff) {
      // CPU $8000-$BFFF: 16 KB PRG ROM bank, either switchable or fixed to the first bank
      return this._prgRomBank0[address - 0x8000];
    } else if (address >= 0xc000 && address <= 0xffff) {
      // CPU $C000-$FFFF: 16 KB PRG ROM bank, either fixed to the last bank or switchable
      return this._prgRomBank1[address - 0xc000];
    }
  }

  cpuWrite(address, input) {
    if (address >= 0x6000 && address <= 0x7fff) {
      // CPU $6000-$7FFF: 8 KB PRG RAM bank (optional)
      this.prgRam[address - 0x6000] = input;
    } else if (address >= 0x8000) {
      // Load
      if (input & 0b10000000) {
        this._state.control.setValue(this._state.control.value | 0x0c);
        this._loadBanks();
        return;
      }
      const value = this._state.load.write(input);
      if (value == null) return;

      if (address >= 0x8000 && address < 0xa000) {
        // Control
        this._state.control.setValue(value);
        this.ppu.memory?.changeNameTableMirroringTo?.(
          this._state.control.mirroring
        );
      } else if (address >= 0xa000 && address < 0xc000) {
        // CHR bank 0
        this._state.chrBank0.setValue(value);
      } else if (address >= 0xc000 && address < 0xe000) {
        // CHR bank 1
        this._state.chrBank1.setValue(value);
      } else {
        // PRG bank
        this._state.prgBank.setValue(value);
      }

      this._loadBanks();
    }
  }

  ppuRead(address) {
    if (address >= 0x0000 && address <= 0x0fff) {
      // PPU $0000-$0FFF: 4 KB switchable CHR ROM bank
      return this._chrRomBank0[address];
    } else if (address >= 0x1000 && address <= 0x1fff) {
      // PPU $1000-$1FFF: 4 KB switchable CHR ROM bank
      return this._chrRomBank1[address - 0x1000];
    }
  }

  ppuWrite(address, value) {
    if (!this.cartridge.header.usesChrRam) {
      return; // (only CHR-RAM is writable)
    }

    if (address >= 0x0000 && address <= 0x0fff) {
      // PPU $0000-$0FFF: 4 KB switchable CHR RAM bank
      this._chrRomBank0[address] = value;
    } else if (address >= 0x1000 && address <= 0x1fff) {
      // PPU $1000-$1FFF: 4 KB switchable CHR RAM bank
      this._chrRomBank1[address - 0x1000] = value;
    }
  }

  /** Returns a snapshot of the current state. */
  getSaveState() {
    return {
      ...super.getSaveState(),
      loadShiftRegister: this._state.load.shiftRegister,
      loadWriteCounter: this._state.load.writeCounter,
      control: this._state.control.value,
      chrBank0: this._state.chrBank0.value,
      chrBank1: this._state.chrBank1.value,
      prgBank: this._state.prgBank.value
    };
  }

  /** Restores state from a snapshot. */
  setSaveState(saveState) {
    super.setSaveState(saveState);

    this._state.load.shiftRegister = saveState.loadShiftRegister;
    this._state.load.writeCounter = saveState.loadWriteCounter;
    this._state.control.setValue(saveState.control);
    this._state.chrBank0.setValue(saveState.chrBank0);
    this._state.chrBank1.setValue(saveState.chrBank1);
    this._state.prgBank.setValue(saveState.prgBank);
    this._loadBanks();
  }

  _loadBanks() {
    const { control, chrBank0, chrBank1, prgBank } = this._state;

    if (control.isPrgRom32Kb) {
      // 32KB PRG
      const page = prgBank.prgRomBankId & 0b1110;
      this._prgRomBank0 = this.$getPrgPage(page);
      this._prgRomBank1 = this.$getPrgPage(page + 1);
    } else {
      // 16KB PRG
      this._prgRomBank0 = this.$getPrgPage(
        control.isFirstPrgAreaSwitchable ? prgBank.prgRomBankId : 0
      );
      this._prgRomBank1 = this.$getPrgPage(
        control.isSecondPrgAreaSwitchable
          ? prgBank.prgRomBankId
          : this.prgPages.length - 1
      );
    }

    if (control.isChrRom8Kb) {
      // 8KB CHR
      const page = chrBank0.value & 0b11110;
      this._chrRomBank0 = this.$getChrPage(page);
      this._chrRomBank1 = this.$getChrPage(page + 1);
    } else {
      // 4KB CHR
      this._chrRomBank0 = this.$getChrPage(chrBank0.value);
      this._chrRomBank1 = this.$getChrPage(chrBank1.value);
    }
  }
}

/**
 * Load Register ($8000-$FFFF)
 * MMC1 has a quirk, where it will take 5 writes to collect all the bits for the actual write
 * that sets a bank. These 5 writes all are made to the Load register ($8000-$FFFF) that
 * consists of a shift register. Each write to the load register shifts the rightmost bit onto
 * said shift register, and on the 5th write, the whole shift register is evaluated.
 */
class LoadRegister {
  constructor() {
    this.shiftRegister = 0;
    this.writeCounter = 0;
  }

  /** Writes a bit. Returns null 4 times, then the full value. */
  write(value) {
    if (value & 0b10000000) {
      // reset
      this.shiftRegister = 0b10000;
      this.writeCounter = 0;

      return null;
    } else {
      // shift 4 times, writing on the 5th

      const bit = value & 1;
      this.shiftRegister = ((this.shiftRegister >> 1) | (bit << 4)) & 0b11111;
      this.writeCounter++;

      if (this.writeCounter === 5) {
        const value = this.shiftRegister;
        this.shiftRegister = 0;
        this.writeCounter = 0;
        return value;
      }

      return null;
    }
  }
}

/**
 * Control ($8000-$9FFF)
 * -----
 * CPPMM
 * |||||
 * |||++- Mirroring (0: one-screen, lower bank; 1: one-screen, upper bank;
 * |||               2: vertical; 3: horizontal)
 * |++--- PRG ROM bank mode (0, 1: switch 32 KB at $8000, ignoring low bit of bank number;
 * |                         2: fix first bank at $8000 and switch 16 KB bank at $C000;
 * |                         3: fix last bank at $C000 and switch 16 KB bank at $8000)
 * +----- CHR ROM bank mode (0: switch 8 KB at a time; 1: switch two separate 4 KB banks)
 */
class ControlRegister extends InMemoryRegister {
  onLoad() {
    this.addField("mirroringId", 0, 2)
      .addField("prgRomBankMode", 2, 2)
      .addField("chrRomBankMode", 4);
  }

  /** Returns the mirroring type. */
  get mirroring() {
    switch (this.mirroringId) {
      case 0:
        return "ONE_SCREEN_LOWER_BANK";
      case 1:
        return "ONE_SCREEN_UPPER_BANK";
      case 2:
        return "VERTICAL";
      case 3:
      default:
        return "HORIZONTAL";
    }
  }

  /** Returns whether the PRG ROM area is 32KB or not (16KB otherwise). */
  get isPrgRom32Kb() {
    return this.prgRomBankMode <= 1;
  }

  /** Returns whether the CHR ROM area is 8KB or not (4KB otherwise). */
  get isChrRom8Kb() {
    return this.chrRomBankMode === 0;
  }

  /** Returns true if the first PRG ROM area ($8000-$BFFF) is switchable. Otherwise, it's fixed to first bank. */
  get isFirstPrgAreaSwitchable() {
    return this.prgRomBankMode !== 2;
  }

  /** Returns true if the second PRG ROM area ($C000-$FFFF) is switchable. Otherwise, it's fixed to last bank. */
  get isSecondPrgAreaSwitchable() {
    return this.prgRomBankMode !== 3;
  }
}

/**
 * CHR bank 0 ($A000-$BFFF)
 * -----
 * CCCCC
 * |||||
 * +++++- Select 4 KB or 8 KB CHR bank at PPU $0000 (low bit ignored in 8 KB mode)
 */
class CHRBank0Register extends InMemoryRegister {}

/**
 * CHR bank 1 ($C000-$DFFF)
 * -----
 * CCCCC
 * |||||
 * +++++- Select 4 KB CHR bank at PPU $1000 (ignored in 8 KB mode)
 */
class CHRBank1Register extends InMemoryRegister {}

/**
 * PRG bank ($E000-$FFFF)
 * -----
 * RPPPP
 * |||||
 * |++++- Select 16 KB PRG ROM bank (low bit ignored in 32 KB mode)
 * +----- PRG RAM chip enable (0: enabled; 1: disabled) (unused on this emulator)
 */
class PRGBankRegister extends InMemoryRegister {
  onLoad() {
    this.addField("prgRomBankId", 0, 4);
  }
}
