import WBK from "./cpu/WBK";
import hardware from "./hardware";
import byte from "./lib/byte";
import TimerRegisters from "./timer/Timer";

const KB = 1024;
const WRAM_BANK_SIZE = 4 * KB;
const WRAM_BANKS = 8;
const HRAM_SIZE = 127;
const VRAM_BANK_SIZE = 8 * KB;
const OAM_SIZE = 160;
const PALETTE_RAM_SIZE = 64;
const WAVE_RAM_SIZE = 16;

// TODO: THROW INVALID OPCODES ON INVALID OPCODES INSTEAD OF RUNNING NOP

/**
 * The Game Boy has a 16-bit address bus, which is used to address ROM, RAM, and I/O.
 */
export default class MemoryBus {
  constructor() {
    this.wramBanks = new Array(WRAM_BANKS)
      .fill(null)
      .map((it) => new Uint8Array(WRAM_BANK_SIZE));
    this.hram = new Uint8Array(HRAM_SIZE);

    this.vramBank0 = new Uint8Array(VRAM_BANK_SIZE);
    this.vramBank1Cgb = new Uint8Array(VRAM_BANK_SIZE);
    this.oam = new Uint8Array(OAM_SIZE);
    this.paletteRamBackground = new Uint8Array(PALETTE_RAM_SIZE);
    this.paletteRamSprites = new Uint8Array(PALETTE_RAM_SIZE);

    this.waveRam = new Uint8Array(WAVE_RAM_SIZE);
  }

  onLoad(cpu, ppu, apu, cartridge, controller, hardwareMode) {
    this.cpu = cpu;
    this.ppu = ppu;
    this.apu = apu;
    this.cartridge = cartridge;
    this.controller = controller;
    this.hardwareMode = hardwareMode;

    this.timer = new TimerRegisters(cpu);
    this.wbk = new WBK(cpu);
  }

  read(address) {
    if (address >= 0x0000 && address < 0x8000) {
      // 32 KiB ROM
      // From cartridge, most carts do bank switching
      return this.cartridge.read(address);
    } else if (address >= 0x8000 && address < 0xa000) {
      // 8 KiB Video RAM (VRAM)
      if (this.ppu.isDrawing) return 0xff;

      // In CGB mode, switchable bank 0/1
      if (
        this.hardwareMode !== hardware.DMG &&
        this.ppu.registers.vbk.bank === 1
      ) {
        return this.vramBank1Cgb[address - 0x8000];
      } else {
        return this.vramBank0[address - 0x8000];
      }
    } else if (address >= 0xa000 && address < 0xc000) {
      // 8 KiB External RAM
      // From cartridge, switchable bank if any
      return this.cartridge.read(address);
    } else if (address >= 0xc000 && address < 0xd000) {
      // 4 KiB Work RAM (WRAM)
      return this.wramBanks[0][address - 0xc000];
    } else if (address >= 0xd000 && address < 0xe000) {
      // 4 KiB Work RAM (WRAM)
      // In CGB mode, switchable bank 1–7

      if (this.hardwareMode !== hardware.DMG) {
        return this.wramBanks[this.wbk.selectedBank][address - 0xd000];
      } else {
        return this.wramBanks[1][address - 0xd000];
      }
    } else if (address >= 0xe000 && address < 0xfe00) {
      // Echo RAM (mirror of C000–DDFF)
      // Use of this area is prohibited.
      return this.read(address - 0xe000 + 0xc000);
    } else if (address >= 0xfe00 && address < 0xfea0) {
      // Object attribute memory (OAM)
      if (this.ppu.isOamBlocked) return 0xff;

      return this.oam[address - 0xfe00];
    } else if (address >= 0xfea0 && address < 0xff00) {
      // Not Usable
      // Use of this area is prohibited.
      return 0;
    } else if (address >= 0xff30 && address < 0xff40) {
      // Wave RAM
      return this.waveRam[address - 0xff30];
    } else if ((address >= 0xff00 && address < 0xff80) || address === 0xffff) {
      // I/O Registers
      return this._ioRead(address);
    } else if (address >= 0xff80 && address < 0xffff) {
      // High RAM (HRAM)
      return this.hram[address - 0xff80];
    }

    return 0xff;
  }

  write(address, value) {
    if (address >= 0x0000 && address < 0x8000) {
      // 32 KiB ROM
      // From cartridge, most carts do bank switching
      return this.cartridge.write(address, value);
    } else if (address >= 0x8000 && address < 0xa000) {
      // 8 KiB Video RAM (VRAM)
      if (this.ppu.isDrawing) return;

      // In CGB mode, switchable bank 0/1
      if (
        this.hardwareMode !== hardware.DMG &&
        this.ppu.registers.vbk.bank === 1
      ) {
        return (this.vramBank1Cgb[address - 0x8000] = value);
      } else {
        return (this.vramBank0[address - 0x8000] = value);
      }
    } else if (address >= 0xa000 && address < 0xc000) {
      // 8 KiB External RAM
      // From cartridge, switchable bank if any
      return this.cartridge.write(address, value);
    } else if (address >= 0xc000 && address < 0xd000) {
      // 4 KiB Work RAM (WRAM)
      return (this.wramBanks[0][address - 0xc000] = value);
    } else if (address >= 0xd000 && address < 0xe000) {
      // 4 KiB Work RAM (WRAM)
      // In CGB mode, switchable bank 1–7

      if (this.hardwareMode !== hardware.DMG) {
        return (this.wramBanks[this.wbk.selectedBank][address - 0xd000] =
          value);
      } else {
        return (this.wramBanks[1][address - 0xd000] = value);
      }
    } else if (address >= 0xe000 && address < 0xfe00) {
      // Echo RAM (mirror of C000–DDFF)
      // Use of this area is prohibited.
      return this.write(address - 0xe000 + 0xc000, value);
    } else if (address >= 0xfe00 && address < 0xfea0) {
      // Object attribute memory (OAM)
      if (this.ppu.isOamBlocked) return;

      return (this.oam[address - 0xfe00] = value);
    } else if (address >= 0xfea0 && address < 0xff00) {
      // Not Usable
      // Use of this area is prohibited.
      return;
    } else if (address >= 0xff30 && address < 0xff40) {
      // Wave RAM
      return (this.waveRam[address - 0xff30] = value);
    } else if ((address >= 0xff00 && address < 0xff80) || address === 0xffff) {
      // I/O Registers
      return this._ioWrite(address, value);
    } else if (address >= 0xff80 && address < 0xffff) {
      // High RAM (HRAM)
      return (this.hram[address - 0xff80] = value);
    }

    return 0xff;
  }

  read16(address) {
    return byte.buildU16(this.read(address + 1), this.read(address));
  }

  readVram(address, bank = 0) {
    const offset = address - 0x8000;
    return bank === 1 ? this.vramBank1Cgb[offset] : this.vramBank0[offset];
  }

  getSaveState() {
    return {
      wramBanks: this.wramBanks.map((it) => Array.from(it)),
      hram: Array.from(this.hram),
      vramBank0: Array.from(this.vramBank0),
      vramBank1Cgb: Array.from(this.vramBank1Cgb),
      oam: Array.from(this.oam),
      paletteRamBackground: Array.from(this.paletteRamBackground),
      paletteRamSprites: Array.from(this.paletteRamSprites),
      waveRam: Array.from(this.waveRam),
      timer: this.timer.getSaveState(),
      wbk: this.wbk.getSaveState(),
      hardwareMode: this.hardwareMode
    };
  }

  setSaveState(saveState) {
    for (let i = 0; i < WRAM_BANKS; i++) {
      this.wramBanks[i].set(saveState.wramBanks[i]);
    }
    this.hram.set(saveState.hram);
    this.vramBank0.set(saveState.vramBank0);
    this.vramBank1Cgb.set(saveState.vramBank1Cgb);
    this.oam.set(saveState.oam);
    this.paletteRamBackground.set(saveState.paletteRamBackground);
    this.paletteRamSprites.set(saveState.paletteRamSprites);
    this.waveRam.set(saveState.waveRam);
    this.timer.setSaveState(saveState.timer);
    this.wbk.setSaveState(saveState.wbk);
    this.hardwareMode = saveState.hardwareMode;
  }

  _ioRead(address) {
    if (address === 0xff00) {
      // Joypad input
      return this.controller.onRead();
    } else if (address >= 0xff04 && address < 0xff08) {
      return this.timer.read(address);
    } else if (address === 0xff0f) {
      // IF: Interrupt flag
      return this.cpu.if;
    } else if (address >= 0xff10 && address < 0xff27) {
      // Audio registers
      return this.apu.registers.read(address);
    } else if (
      (address >= 0xff40 && address < 0xff4c) ||
      address === 0xff4f ||
      (address >= 0xff51 && address <= 0xff55) ||
      (address >= 0xff68 && address <= 0xff6b)
    ) {
      // Video registers
      return this.ppu.registers.read(address);
    } else if (address === 0xff70) {
      // (CGB) WRAM Bank Select
      return this.wbk.onRead();
    } else if (address === 0xffff) {
      // IE: Interrupt enable
      return this.cpu.ie;
    }

    return 0xff;
  }

  _ioWrite(address, value) {
    if (address === 0xff00) {
      // Joypad input
      return this.controller.onWrite(value);
    } else if (address >= 0xff04 && address < 0xff08) {
      return this.timer.write(address, value);
    } else if (address === 0xff0f) {
      // IF: Interrupt flag
      return (this.cpu.if = value);
    } else if (address >= 0xff10 && address < 0xff27) {
      // Audio registers
      return this.apu.registers.write(address, value);
    } else if (
      (address >= 0xff40 && address < 0xff4c) ||
      address === 0xff4f ||
      (address >= 0xff51 && address <= 0xff55) ||
      (address >= 0xff68 && address <= 0xff6b)
    ) {
      // Video registers
      return this.ppu.registers.write(address, value);
    } else if (address === 0xff70) {
      // (CGB) WRAM Bank Select
      return this.wbk.onWrite(value);
    } else if (address === 0xffff) {
      // IE: Interrupt enable
      return (this.cpu.ie = value);
    }
  }
}
