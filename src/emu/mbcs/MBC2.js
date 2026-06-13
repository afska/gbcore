import InMemoryRegister from "../lib/InMemoryRegister";
import byte from "../lib/byte";
import MBC from "./MBC";

const RAM_SIZE = 512;

export default (options = {}) => {
  /**
   * (max 256 KiB ROM and 512×4 bits RAM)
   */
  return class MBC2 extends MBC {
    onLoad() {
      this.options = options;

      this.internalRam = new Uint8Array(RAM_SIZE); // half-bytes, only use low nybble!

      this._registers = {
        ramEnable: new RamEnable(),
        romBankSelect: new RomBankSelect()
      };
    }

    read(address) {
      // 0000–3FFF — ROM Bank X0 [read-only]
      if (address >= 0x0000 && address < 0x4000)
        return this.$getRomPage(0)[address];

      // 4000–7FFF — ROM Bank 01-0F [read-only]
      if (address >= 0x4000 && address < 0x8000) {
        const page = this._registers.romBankSelect.selectedBank;
        return this.$getRomPage(page)[address - 0x4000];
      }

      // A000–A1FF — Built-in RAM, A200-BFFF mirrors
      if (
        this._registers.ramEnable.isEnabled &&
        address >= 0xa000 &&
        address < 0xc000
      )
        return byte.lowNybbleOf(
          this.internalRam[(address - 0xa000) % RAM_SIZE]
        );

      return 0xff;
    }

    write(address, value) {
      // 0000–3FFF — RAM Enable, ROM Bank Number [write-only]
      if (address >= 0x0000 && address < 0x4000) {
        // This address range is responsible for both enabling/disabling the RAM and for controlling the ROM bank number.
        // Bit 8 of the address (the least significant bit of the upper address byte) determines whether to control the RAM enable flag or the ROM bank number.

        if (!byte.getFlag(address, 8)) {
          // When bit 8 is clear

          this._registers.ramEnable.setValue(value);
        } else {
          // When bit 8 is set

          this._registers.romBankSelect.setValue(value);
        }
      }

      // A000–A1FF — Built-in RAM, A200-BFFF mirrors
      if (
        this._registers.ramEnable.isEnabled &&
        address >= 0xa000 &&
        address < 0xc000
      )
        return (this.internalRam[(address - 0xa000) % RAM_SIZE] =
          byte.lowNybbleOf(value));
    }

    setRam(bytes) {
      for (let i = 0; i < RAM_SIZE; i++) this.internalRam[i] = bytes[i];
    }

    getRam() {
      return this.internalRam.slice();
    }

    getSaveState() {
      return {
        ...super.getSaveState(),
        registers: {
          ramEnable: this._registers.ramEnable.getSaveState(),
          romBankSelect: this._registers.romBankSelect.getSaveState()
        }
      };
    }

    setSaveState(saveState) {
      super.setSaveState(saveState);

      this._registers.ramEnable.setSaveState(saveState.registers.ramEnable);
      this._registers.romBankSelect.setSaveState(
        saveState.registers.romBankSelect
      );
    }

    get hasRam() {
      return true;
    }
  };
};

/*
The value that is written controls whether the RAM is enabled. Save RAM will be enabled if and only if the lower 4 bits of the value written here are $A. If any other value is written, RAM is disabled.
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
The value that is written controls the selected ROM bank at 4000–7FFF.
Specifically, the lower 4 bits of the value written to this address range specify the ROM bank number.
If bank 0 is written, the resulting bank will be bank 1 instead.
*/
class RomBankSelect extends InMemoryRegister {
  onLoad() {
    this.addField("bankNumber", 0, 4);
  }

  get selectedBank() {
    return this.bankNumber === 0 ? 1 : this.bankNumber;
  }
}
