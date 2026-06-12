import InMemoryRegister from "../lib/InMemoryRegister";
import MBC from "./MBC";

export default (options = {}) => {
  /**
   * (max 2MByte ROM and/or 32 KiB RAM)
   * This is the first MBC chip for the Game Boy. Any newer MBC chips work similarly, so it is relatively easy to upgrade a program from one MBC chip to another — or to make it compatible with several types of MBCs.
   */
  return class MBC1 extends MBC {
    onLoad() {
      this.options = options;

      this._registers = {
        ramEnable: new RamEnable(),
        romBankSelect: new RomBankSelect(),
        secondaryBankSelect: new SecondaryBankSelect(),
        bankingMode: new BankingMode()
      };
    }

    read(address) {
      // 0000–3FFF — ROM Bank X0 [read-only]
      if (address >= 0x0000 && address < 0x4000) {
        const page = this._registers.bankingMode.isAdvanced
          ? this._buildPageId(this._registers.secondaryBankSelect.bankNumber, 0)
          : 0;
        return this.$getRomPage(page)[address];
      }

      // 4000–7FFF — ROM Bank 01-7F [read-only]
      if (address >= 0x4000 && address < 0x8000) {
        const page = this._buildPageId(
          this._registers.secondaryBankSelect.bankNumber,
          this._registers.romBankSelect.selectedBank
        );
        return this.$getRomPage(page)[address - 0x4000];
      }

      // A000–BFFF — RAM Bank 00–03, if any
      if (
        options.ram &&
        this.hasRam &&
        this._registers.ramEnable.isEnabled &&
        address >= 0xa000 &&
        address < 0xc000
      ) {
        const page = this._registers.bankingMode.isAdvanced
          ? this._registers.secondaryBankSelect.bankNumber
          : 0;
        return this.$getRamPage(page)[address - 0xa000];
      }

      return 0xff;
    }

    write(address, value) {
      // Registers
      if (address >= 0x0000 && address < 0x2000) {
        this._registers.ramEnable.setValue(value);
      } else if (address >= 0x2000 && address < 0x4000) {
        this._registers.romBankSelect.setValue(value);
      } else if (address >= 0x4000 && address < 0x6000) {
        this._registers.secondaryBankSelect.setValue(value);
      } else if (address >= 0x6000 && address < 0x8000) {
        this._registers.bankingMode.setValue(value);
      }

      // A000–BFFF — RAM Bank 00–03, if any
      if (
        options.ram &&
        this.hasRam &&
        this._registers.ramEnable.isEnabled &&
        address >= 0xa000 &&
        address < 0xc000
      ) {
        const page = this._registers.bankingMode.isAdvanced
          ? this._registers.secondaryBankSelect.bankNumber
          : 0;
        return (this.$getRamPage(page)[address - 0xa000] = value);
      }
    }

    _buildPageId(high, low = 0) {
      return (high << 5) | low;
    }
  };
};

/*
0000–1FFF — RAM Enable (Write Only)
Before external RAM can be read or written, it must be enabled by writing $A to anywhere in this address space.
Any value with $A in the lower 4 bits enables the RAM attached to the MBC, and any other value disables the RAM. It is unknown why $A is the value used to enable RAM.
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
2000–3FFF — ROM Bank Number (Write Only)
This 5-bit register (range $01-$1F) selects the ROM bank number for the 4000–7FFF region. Higher bits are discarded — writing $E1 (binary 11100001) to this register would select bank $01.
If this register is set to $00, it behaves as if it is set to $01. This means you cannot duplicate bank $00 into both the 0000–3FFF and 4000–7FFF ranges by setting this register to $00.
If the ROM Bank Number is set to a higher value than the number of banks in the cart, the bank number is masked to the required number of bits. e.g. a 256 KiB cart only needs a 4-bit bank number to address all of its 16 banks, so this register is masked to 4 bits. The upper bit would be ignored for bank selection.
Even with smaller ROMs that use less than 5 bits for bank selection, the full 5-bit register is still compared for the bank 00→01 translation logic. As a result if the ROM is 256 KiB or smaller, it is possible to map bank 0 to the 4000–7FFF region — by setting the 5th bit to 1 it will prevent the 00→01 translation (which looks at the full 5-bit register, and sees the value $10, not $00), while the bits actually used for bank selection (4, in this example) are all 0, so bank $00 is selected.
On larger carts which need a >5 bit bank number, the secondary banking register at 4000–5FFF is used to supply an additional 2 bits for the effective bank number: Selected ROM Bank = (Secondary Bank << 5) + ROM Bank.1
These additional two bits are ignored for the bank 00→01 translation. This causes a problem — attempting to access banks $20, $40, and $60 only set bits in the upper 2-bit register, with the lower 5-bit register set to 00. As a result, any attempt to address these ROM Banks will select Bank $21, $41 and $61 instead. The only way to access banks $20, $40 or $60 at all is to enter mode 1, which remaps the 0000–3FFF range. This has its own problems for game developers as that range contains interrupt handlers, so it’s usually only used in multi-game compilation carts (see below).
*/
class RomBankSelect extends InMemoryRegister {
  onLoad() {
    this.addField("bankNumber", 0, 5);
  }

  get selectedBank() {
    return this.bankNumber === 0 ? 1 : this.bankNumber;
  }
}

/*
4000–5FFF — RAM Bank Number — or — Upper Bits of ROM Bank Number (Write Only)
This second 2-bit register can be used to select a RAM Bank in range from $00–$03 (32 KiB ram carts only), or to specify the upper two bits (bits 5-6) of the ROM Bank number (1 MiB ROM or larger carts only). If neither ROM nor RAM is large enough, setting this register does nothing.
In 1MB MBC1 multi-carts (see below), this 2-bit register is instead applied to bits 4-5 of the ROM bank number and the top bit of the main 5-bit main ROM banking register is ignored.
*/
class SecondaryBankSelect extends InMemoryRegister {
  onLoad() {
    this.addField("bankNumber", 0, 2);
  }
}

/*
6000–7FFF — Banking Mode Select (Write Only)
This 1-bit register selects between the two MBC1 banking modes, controlling the behaviour of the secondary 2-bit banking register (above). If the cart is not large enough to use the 2-bit register (≤ 8 KiB RAM and ≤ 512 KiB ROM) this mode select has no observable effect. The program may freely switch between the two modes at any time.
*/
class BankingMode extends InMemoryRegister {
  onLoad() {
    this.addField("mode", 0, 1);
    /*
      0 = simple (default): 0000–3FFF and A000–BFFF are locked to bank 0 of ROM and SRAM respectively.
      1 = advanced: 0000–3FFF and A000-BFFF can be bank-switched via the 4000–5FFF register.
    */
  }

  get isAdvanced() {
    return this.mode === 1;
  }
}
