import byte from "./lib/byte";

const RAM_SIZE = 2048;

export default class CPUMemory {
  constructor() {
    this.ram = new Uint8Array(RAM_SIZE);
  }

  onLoad(ppu, apu, mapper, controllers) {
    this.ppu = ppu;
    this.apu = apu;
    this.mapper = mapper;
    this.controllers = controllers;
  }

  read(address) {
    // 2 KiB internal RAM
    if (address <= 0x07ff) return this.ram[address];

    // Mirrors of $0000-$07FF
    if (address >= 0x0800 && address <= 0x1fff)
      return this.read(0x0000 + ((address - 0x0800) % 0x0800));

    /* 🐒 The rest of the components are mapped in `GB` */

    return 0;
  }

  write(address, value) {
    // 2 KiB internal RAM
    if (address <= 0x07ff) return (this.ram[address] = value);

    // Mirrors of $0000-$07FF
    if (address >= 0x0800 && address <= 0x1fff)
      return this.write(0x0000 + ((address - 0x0800) % 0x0800), value);

    /* 🐒 The rest of the components are mapped in `GB` */
  }

  read16(address) {
    return byte.buildU16(this.read(address + 1), this.read(address));
  }
}
