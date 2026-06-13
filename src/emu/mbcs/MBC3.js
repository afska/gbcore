import InMemoryRegister from "../lib/InMemoryRegister";
import MBC from "./MBC";

export default (options = {}) => {
  /**
   * (max 2MByte ROM and/or 32KByte RAM and Timer)
   * Beside for the ability to access up to 2MB ROM (128 banks), and 32KB RAM (4 banks), the MBC3 also includes a built-in Real Time Clock (RTC).
   * The RTC requires an external 32.768 kHz Quartz Oscillator, and an external battery (if it should continue to tick when the Game Boy is turned off).
   */
  return class MBC3 extends MBC {
    onLoad() {
      this.options = options;

      this._registers = {
        ramAndRtcEnable: new RamAndRtcEnable(),
        romBankSelect: new RomBankSelect(),
        secondaryBankSelect: new SecondaryBankSelect()
      };
    }

    read(address) {
      // 0000-3FFF - ROM Bank 00 (Read Only)
      if (address >= 0x0000 && address < 0x4000)
        return this.$getRomPage(0)[address];

      // 4000-7FFF - ROM Bank 01-7F (Read Only)
      if (address >= 0x4000 && address < 0x8000) {
        const page = this._registers.romBankSelect.selectedBank;
        return this.$getRomPage(page)[address - 0x4000];
      }

      // TODO: RTC if options.timer
      // A000-BFFF - RAM Bank 00-07 or RTC register (Read/Write)
      if (
        options.ram &&
        this.hasRam &&
        this._registers.ramAndRtcEnable.isEnabled &&
        address >= 0xa000 &&
        address < 0xc000
      ) {
        const page = this._registers.secondaryBankSelect.ramBank;
        return this.$getRamPage(page)[address - 0xa000];
      }

      return 0xff;
    }

    write(address, value) {
      // Registers
      if (address >= 0x0000 && address < 0x2000) {
        this._registers.ramAndRtcEnable.setValue(value);
      } else if (address >= 0x2000 && address < 0x4000) {
        this._registers.romBankSelect.setValue(value);
      } else if (address >= 0x4000 && address < 0x6000) {
        this._registers.secondaryBankSelect.setValue(value);
      } else if (address >= 0x6000 && address < 0x8000) {
      }

      // TODO: RTC
      // A000-BFFF - RAM Bank 00-07 or RTC register (Read/Write)
      if (
        options.ram &&
        this.hasRam &&
        this._registers.ramAndRtcEnable.isEnabled &&
        address >= 0xa000 &&
        address < 0xc000
      ) {
        const page = this._registers.secondaryBankSelect.ramBank;
        return (this.$getRamPage(page)[address - 0xa000] = value);
      }
    }
  };
};

/*
0000-1FFF - RAM and Timer Enable (Write Only)
Mostly the same as for MBC1, a value of $0A will enable reading and writing to external RAM - and to the RTC Registers!
A value of $00 will disable either.
*/
class RamAndRtcEnable extends InMemoryRegister {
  onLoad() {
    this.addField("enableRamWith0xA", 0, 4);
  }

  get isEnabled() {
    return this.enableRamWith0xA === 0xa;
  }
}

/*
2000-3FFF - ROM Bank Number (Write Only)
Same as for MBC1, except that the whole 7 bits of the ROM Bank Number are written directly to this address.
As with the MBC1, writing a value of $00 will select Bank $01 instead. All other values $01-$7F select the corresponding ROM Banks.
*/
class RomBankSelect extends InMemoryRegister {
  onLoad() {
    this.addField("bankNumber", 0, 7);
  }

  get selectedBank() {
    return this.bankNumber === 0 ? 1 : this.bankNumber;
  }
}

/*
4000-5FFF - RAM Bank Number - or - RTC Register Select (Write Only)
Controls what is mapped into memory at A000-BFFF.
*/
class SecondaryBankSelect extends InMemoryRegister {
  onLoad() {
    this.ramBank = 0;
  }

  setValue(value) {
    if (value >= 0 && value <= 0x07) this.ramBank = value;
  }
}
