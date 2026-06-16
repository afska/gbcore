import InMemoryRegister from "../lib/InMemoryRegister";
import byte from "../lib/byte";
import MBC from "./MBC";

export default (options = {}) => {
  /**
   * It can map up to 64 Mbits (8 MiB) of ROM.
   * MBC5 (Memory Bank Controller 5) is the 5th generation MBC (MBC4 was not used in any released cartridges). It is the first MBC that is guaranteed to work properly with GBC Double Speed mode.
   */
  return class MBC5 extends MBC {
    onLoad() {
      this.options = options;

      this._registers = {
        ramEnable: new RamEnable(),
        romBankSelectLow: new RomBankSelectLow(),
        romBankSelectHigh: new RomBankSelectHigh(),
        ramBankSelect: new RamBankSelect(options)
      };
    }

    read(address) {
      // 0000-3FFF - ROM Bank 00 (Read Only)
      if (address >= 0x0000 && address < 0x4000)
        return this.$getRomPage(0)[address];

      // 4000-7FFF - ROM bank 00-1FF (Read Only)
      if (address >= 0x4000 && address < 0x8000) {
        const page = this._buildPageId(
          this._registers.romBankSelectHigh.bankNumberLastBit,
          this._registers.romBankSelectLow.bankNumberLow
        );
        return this.$getRomPage(page)[address - 0x4000];
      }

      // A000-BFFF - RAM bank 00-0F, if any (Read/Write)
      if (
        options.ram &&
        this.hasRam &&
        this._registers.ramEnable.isEnabled &&
        address >= 0xa000 &&
        address < 0xc000
      ) {
        const page = this._registers.ramBankSelect.ramBank;
        return this.$getRamPage(page)[address - 0xa000];
      }

      return 0xff;
    }

    write(address, value) {
      // Registers
      if (address >= 0x0000 && address < 0x2000) {
        this._registers.ramEnable.setValue(value);
      } else if (address >= 0x2000 && address < 0x3000) {
        this._registers.romBankSelectLow.setValue(value);
      } else if (address >= 0x3000 && address < 0x4000) {
        this._registers.romBankSelectHigh.setValue(value);
      } else if (address >= 0x4000 && address < 0x6000) {
        this._registers.ramBankSelect.setValue(value);
      }

      // A000-BFFF - RAM bank 00-0F, if any (Read/Write)
      if (
        options.ram &&
        this.hasRam &&
        this._registers.ramEnable.isEnabled &&
        address >= 0xa000 &&
        address < 0xc000
      ) {
        const page = this._registers.ramBankSelect.ramBank;
        return (this.$getRamPage(page)[address - 0xa000] = value);
      }
    }

    getSaveState() {
      return {
        ...super.getSaveState(),
        registers: {
          ramEnable: this._registers.ramEnable.getSaveState(),
          romBankSelectLow: this._registers.romBankSelectLow.getSaveState(),
          romBankSelectHigh: this._registers.romBankSelectHigh.getSaveState(),
          ramBankSelect: this._registers.ramBankSelect.getSaveState()
        }
      };
    }

    setSaveState(saveState) {
      super.setSaveState(saveState);

      this._registers.ramEnable.setSaveState(saveState.registers.ramEnable);
      this._registers.romBankSelectLow.setSaveState(
        saveState.registers.romBankSelectLow
      );
      this._registers.romBankSelectHigh.setSaveState(
        saveState.registers.romBankSelectHigh
      );
      this._registers.ramBankSelect.setSaveState(
        saveState.registers.ramBankSelect
      );
    }

    _buildPageId(high, low) {
      return byte.buildU16(high, low);
    }
  };
};

/*
  0000-1FFF - RAM Enable (Write Only)
  Mostly the same as for MBC1. Writing $0A will enable reading and writing to external RAM. Writing $00 will disable it.
  Actual MBCs actually enable RAM when writing any value whose bottom 4 bits equal $A (so $0A, $1A, and so on), and disable it when writing anything else. Relying on this behavior is not recommended for compatibility reasons.
  */
class RamEnable extends InMemoryRegister {
  onLoad() {
    this.addField("enableRamWith0xA", 0, 4);
  }

  get isEnabled() {
    return this.enableRamWith0xA === 0xa;
  }
}

/*
  2000-2FFF - 8 least significant bits of ROM bank number (Write Only)
  The 8 least significant bits of the ROM bank number go here. Writing 0 will indeed give bank 0 on MBC5, unlike other MBCs.
  */
class RomBankSelectLow extends InMemoryRegister {
  onLoad() {
    this.bankNumberLow = 0;
  }

  setValue(value) {
    this.bankNumberLow = value;
  }

  getSaveState() {
    return {
      ...super.getSaveState(),
      bankNumberLow: this.bankNumberLow
    };
  }

  setSaveState(saveState) {
    super.setSaveState(saveState);

    this.bankNumberLow = saveState.bankNumberLow;
  }
}

/*
  3000-3FFF - 9th bit of ROM bank number (Write Only)
  The 9th bit of the ROM bank number goes here.
  */
class RomBankSelectHigh extends InMemoryRegister {
  onLoad() {
    this.addField("bankNumberLastBit", 0, 1);
  }
}

/*
4000-5FFF - RAM bank number (Write Only)
As for the MBC1s RAM Banking Mode, writing a value in the range $00-$0F maps the corresponding external RAM bank (if any) into the memory area at A000-BFFF.
*/
class RamBankSelect extends InMemoryRegister {
  constructor(options) {
    super();
    this.options = options;
  }

  onLoad() {
    this.ramBank = 0;
  }

  setValue(value) {
    // UNIMPLEMENTED: RUMBLE SUPPORT
    if (this.options.rumble) value = byte.setBit(value, 3, 0);
    if (value >= 0 && value <= 0x0f) this.ramBank = value;
  }

  getSaveState() {
    return {
      ...super.getSaveState(),
      ramBank: this.ramBank
    };
  }

  setSaveState(saveState) {
    super.setSaveState(saveState);

    this.ramBank = saveState.ramBank;
  }
}
