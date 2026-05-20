import byte from "./lib/byte";

const KB = 1024;
const WRAM_SIZE = 8 * KB;
const HRAM_SIZE = 127;
const VRAM_SIZE = 8 * KB;
const OAM_SIZE = 160;

// TODO: NEXT STEPS:
// IO regs
// basic ppu
// sync
// cartridge validation

export default class MemoryBus {
  constructor() {
    this.wramBank0 = new Uint8Array(WRAM_SIZE / 2);
    this.wramBank1 = new Uint8Array(WRAM_SIZE / 2);
    this.hram = new Uint8Array(HRAM_SIZE);

    this.vram = new Uint8Array(VRAM_SIZE);
    this.oam = new Uint8Array(OAM_SIZE);
  }

  onLoad(cpu, ppu, apu, cartridge, controller) {
    this.cpu = cpu;
    this.ppu = ppu;
    this.apu = apu;
    this.cartridge = cartridge;
    this.controller = controller;
  }

  read(address) {
    if (address >= 0x0000 && address < 0x8000) {
      // 32 KiB ROM
      // From cartridge, most carts do bank switching
      return this.cartridge.onRead(address);
    } else if (address >= 0x8000 && address < 0xa000) {
      // 8 KiB Video RAM (VRAM)
      // In CGB mode, switchable bank 0/1
      return this.vram[address - 0x8000];
    } else if (address >= 0xa000 && address < 0xc000) {
      // 8 KiB External RAM
      // From cartridge, switchable bank if any
      return this.cartridge.onRead(address);
    } else if (address >= 0xc000 && address < 0xd000) {
      // 4 KiB Work RAM (WRAM)
      return this.wramBank0[address - 0xc000];
    } else if (address >= 0xd000 && address < 0xe000) {
      // 4 KiB Work RAM (WRAM)
      // In CGB mode, switchable bank 1–7
      return this.wramBank1[address - 0xd000];
    } else if (address >= 0xe000 && address < 0xfe00) {
      // Echo RAM (mirror of C000–DDFF)
      // Use of this area is prohibited.
      return this.read(address - 0xe000 + 0xc000);
    } else if (address >= 0xfe00 && address < 0xfea0) {
      // Object attribute memory (OAM)
      return this.oam[address - 0xfe00];
    } else if (address >= 0xfea0 && address < 0xff00) {
      // Not Usable
      // Use of this area is prohibited.
      return 0;
    } else if ((address >= 0xff00 && address < 0xff80) || address === 0xffff) {
      // I/O Registers
      return this._ioRead(address);
    } else if (address >= 0xff00 && address < 0xff80) {
      // High RAM (HRAM)
      return this.hram[address - 0xff80];
    }

    return 0xff;
  }

  write(address, value) {
    if (address >= 0x0000 && address < 0x8000) {
      // 32 KiB ROM
      // From cartridge, most carts do bank switching
      return this.cartridge.onWrite(address, value);
    } else if (address >= 0x8000 && address < 0xa000) {
      // 8 KiB Video RAM (VRAM)
      // In CGB mode, switchable bank 0/1
      return (this.vram[address - 0x8000] = value);
    } else if (address >= 0xa000 && address < 0xc000) {
      // 8 KiB External RAM
      // From cartridge, switchable bank if any
      return this.cartridge.onWrite(address, value);
    } else if (address >= 0xc000 && address < 0xd000) {
      // 4 KiB Work RAM (WRAM)
      return (this.wramBank0[address - 0xc000] = value);
    } else if (address >= 0xd000 && address < 0xe000) {
      // 4 KiB Work RAM (WRAM)
      // In CGB mode, switchable bank 1–7
      return (this.wramBank1[address - 0xd000] = value);
    } else if (address >= 0xe000 && address < 0xfe00) {
      // Echo RAM (mirror of C000–DDFF)
      // Use of this area is prohibited.
      return this.write(address - 0xe000 + 0xc000, value);
    } else if (address >= 0xfe00 && address < 0xfea0) {
      // Object attribute memory (OAM)
      return (this.oam[address - 0xfe00] = value);
    } else if (address >= 0xfea0 && address < 0xff00) {
      // Not Usable
      // Use of this area is prohibited.
      return;
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

  _ioRead(address) {
    switch (address) {
      case 0xff00: {
        // Joypad input
        return this.controller.onRead();
      }
      case 0xff0f: {
        // IF: Interrupt flag
        return this.cpu.if;
      }
      case 0xff40: {
        // LCDC: LCD control
        // TODO: IMPLEMENT
        return 0x91;
      }
      case 0xffff: {
        // IE: Interrupt enable
        return this.cpu.ie;
      }
    }

    return 0xff;
  }

  _ioWrite(address, value) {
    switch (address) {
      case 0xff00: {
        // Joypad input
        return this.controller.onWrite(value);
      }
      case 0xff0f: {
        // IF: Interrupt flag
        return (this.cpu.if = value);
      }
      case 0xffff: {
        // IE: Interrupt enable
        return (this.cpu.ie = value);
      }
    }

    return 0xff;
  }
}
