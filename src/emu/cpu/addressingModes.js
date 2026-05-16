import byte from "../lib/byte";

const unsupported = () => {
  throw new Error("Unsupported.");
};
function read(cpu, argument, hasPageCrossPenalty) {
  return cpu.memory.read(this.getAddress(cpu, argument, hasPageCrossPenalty));
}

const addressingModes = {
  IMPLICIT: {
    inputSize: 0,
    getAddress: () => null,
    getValue: unsupported
  },

  IMMEDIATE: {
    inputSize: 1,
    getAddress: unsupported,
    getValue: (cpu, value) => value
  },

  ABSOLUTE: {
    inputSize: 2,
    getAddress: (cpu, address) => address,
    getValue: read
  },

  ZERO_PAGE: {
    inputSize: 1,
    getAddress: (cpu, zeroPageAddress) => zeroPageAddress,
    getValue: read
  },

  RELATIVE: {
    inputSize: 1,
    getAddress: (cpu, offset, hasPageCrossPenalty) => {
      const address = cpu.pc.getValue();
      const newAddress = address + byte.toS8(offset);
      const pageCrossed =
        byte.highByteOf(address) !== byte.highByteOf(newAddress);

      if (pageCrossed && hasPageCrossPenalty) cpu.extraCycles++;

      return byte.toU16(newAddress);
    },
    getValue: unsupported
  },

  INDIRECT: {
    inputSize: 2,
    getAddress: (cpu, absoluteAddress) => {
      const msb = byte.highByteOf(absoluteAddress);
      const lsb = byte.lowByteOf(absoluteAddress);
      const low = cpu.memory.read(absoluteAddress);
      const high = cpu.memory.read(
        lsb === 0xff ? byte.buildU16(msb, 0x00) : absoluteAddress + 1
      );

      return byte.buildU16(high, low);
    },
    getValue: unsupported
  },

  INDEXED_ZERO_PAGE_X: {
    inputSize: 1,
    getAddress: (cpu, zeroPageAddress) => {
      return byte.toU8(zeroPageAddress + cpu.x.getValue());
    },
    getValue: read
  },

  INDEXED_ZERO_PAGE_Y: {
    inputSize: 1,
    getAddress: (cpu, zeroPageAddress) => {
      return byte.toU8(zeroPageAddress + cpu.y.getValue());
    },
    getValue: read
  },

  INDEXED_ABSOLUTE_X: {
    inputSize: 2,
    getAddress: (cpu, absoluteAddress, hasPageCrossPenalty) => {
      const address = absoluteAddress;
      const newAddress = address + cpu.x.getValue();
      const pageCrossed =
        byte.highByteOf(address) !== byte.highByteOf(newAddress);

      if (pageCrossed && hasPageCrossPenalty) cpu.extraCycles += 1;

      return byte.toU16(newAddress);
    },
    getValue: read
  },

  INDEXED_ABSOLUTE_Y: {
    inputSize: 2,
    getAddress: (cpu, absoluteAddress, hasPageCrossPenalty) => {
      const address = absoluteAddress;
      const newAddress = address + cpu.y.getValue();
      const pageCrossed =
        byte.highByteOf(address) !== byte.highByteOf(newAddress);

      if (pageCrossed && hasPageCrossPenalty) cpu.extraCycles += 1;

      return byte.toU16(newAddress);
    },
    getValue: read
  },

  INDEXED_INDIRECT: {
    inputSize: 1,
    getAddress: (cpu, zeroPageAddress) => {
      const start = byte.toU8(zeroPageAddress + cpu.x.getValue());
      const end = byte.toU8(start + 1);

      return byte.buildU16(cpu.memory.read(end), cpu.memory.read(start));
    },
    getValue: read
  },

  INDIRECT_INDEXED: {
    inputSize: 1,
    getAddress: (cpu, zeroPageAddress, hasPageCrossPenalty) => {
      const start = byte.toU8(zeroPageAddress);
      const end = byte.toU8(start + 1);
      const address = byte.buildU16(
        cpu.memory.read(end),
        cpu.memory.read(start)
      );

      const newAddress = address + cpu.y.getValue();
      const pageCrossed =
        byte.highByteOf(address) !== byte.highByteOf(newAddress);

      if (pageCrossed && hasPageCrossPenalty) cpu.extraCycles += 1;

      return byte.toU16(newAddress);
    },
    getValue: read
  }
};

for (let key in addressingModes) {
  addressingModes[key].id = key;
}

export default addressingModes;
