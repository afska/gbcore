import byte from "../../lib/byte";
import { ADD16 } from "./opcodes_arithmetic_16bit";

/**
 * PUSH AF
 * Push the contents of register pair AF into the stack.
 * This is roughly equivalent to the following imaginary instructions:
 *   DEC SP
 *   LD [SP], A
 *   DEC SP
 *   LD [SP], F.Z << 7 | F.N << 6 | F.H << 5 | F.C << 4
 */
function PUSH_AF(cpu) {
  cpu.stack.push(cpu.registers.a.getValue());
  cpu.stack.push(cpu.registers.flags.getValue());
}

/**
 * POP AF
 * Pop register AF from the stack.
 * This is roughly equivalent to the following imaginary instructions:
 *   LD F, [SP]
 *   INC SP
 *   LD A, [SP]
 *   INC SP
 */
function POP_AF(cpu) {
  cpu.registers.flags.setValue(cpu.stack.pop());
  cpu.registers.a.setValue(cpu.stack.pop());
}

/**
 * ADD \target, \s8
 * Add the contents of the 8-bit signed \s8 and the stack pointer SP and store the results in \target.
 *
 * Z: 0.
 * N: 0.
 * H: Set if overflow from bit 3.
 * C: Set if overflow from bit 7.
 */
function ADD_SP(cpu, addend, target) {
  const currentValue = cpu.registers.sp.getValue();
  const s8 = byte.toS8(addend);
  const result = currentValue + s8;

  target.setValue(result);

  cpu.registers.flags.zero = false;
  cpu.registers.flags.subtraction = false;
  cpu.registers.flags.halfCarry =
    byte.lowNybbleOf(currentValue) + byte.lowNybbleOf(addend) > 0b1111;
  cpu.registers.flags.carry = byte.lowByteOf(currentValue) + addend > 0xff;
}

/**
 * LD (\a16), SP
 * Store the lower byte of stack pointer SP at the address \a16, and store the upper byte of SP at address \a16 + 1.
 */
function LD_addr_SP(cpu, a16) {
  const sp = cpu.registers.sp.getValue();

  cpu.memory.write(a16, byte.lowByteOf(sp));
  cpu.memory.write(byte.toU16(a16 + 1), byte.highByteOf(sp));
}

export default [
  // LD (a16), SP
  {
    id: 0x08,
    run: (cpu) => {
      const a16 = cpu.fetchProgramHalfword();
      LD_addr_SP(cpu, a16);
    },
    cycles: 5
  },

  // LD SP, d16
  {
    id: 0x31,
    run: (cpu) => {
      const d16 = cpu.fetchProgramHalfword();
      cpu.registers.sp.setValue(d16);
    },
    cycles: 3
  },

  // INC SP
  {
    id: 0x33,
    run: (cpu) => {
      cpu.registers.sp.increment();
    },
    cycles: 2
  },

  // ADD HL, SP
  {
    id: 0x39,
    run: (cpu) => {
      const sp = cpu.registers.sp.getValue();
      ADD16(cpu, sp, cpu.registers.hl);
    },
    cycles: 2
  },

  // DEC SP
  {
    id: 0x3b,
    run: (cpu) => {
      cpu.registers.sp.decrement();
    },
    cycles: 2
  },

  // POP BC
  {
    id: 0xc1,
    run: (cpu) => {
      const value = cpu.stack.pop16();
      cpu.registers.bc.setValue(value);
    },
    cycles: 3
  },

  // PUSH BC
  {
    id: 0xc5,
    run: (cpu) => {
      const bc = cpu.registers.bc.getValue();
      cpu.stack.push16(bc);
    },
    cycles: 4
  },

  // POP DE
  {
    id: 0xd1,
    run: (cpu) => {
      const value = cpu.stack.pop16();
      cpu.registers.de.setValue(value);
    },
    cycles: 3
  },

  // PUSH DE
  {
    id: 0xd5,
    run: (cpu) => {
      const de = cpu.registers.de.getValue();
      cpu.stack.push16(de);
    },
    cycles: 4
  },

  // POP HL
  {
    id: 0xe1,
    run: (cpu) => {
      const value = cpu.stack.pop16();
      cpu.registers.hl.setValue(value);
    },
    cycles: 3
  },

  // PUSH HL
  {
    id: 0xe5,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      cpu.stack.push16(hl);
    },
    cycles: 4
  },

  // ADD SP, s8
  {
    id: 0xe8,
    run: (cpu) => {
      const s8 = cpu.fetchProgramByte();
      ADD_SP(cpu, s8, cpu.registers.sp);
    },
    cycles: 4
  },

  // POP AF
  {
    id: 0xf1,
    run: (cpu) => {
      POP_AF(cpu);
    },
    cycles: 3
  },

  // PUSH AF
  {
    id: 0xf5,
    run: (cpu) => {
      PUSH_AF(cpu);
    },
    cycles: 4
  },

  // LD HL, SP+s8
  {
    id: 0xf8,
    run: (cpu) => {
      const s8 = cpu.fetchProgramByte();
      ADD_SP(cpu, s8, cpu.registers.hl);
    },
    cycles: 3
  },

  // LD SP, HL
  {
    id: 0xf9,
    run: (cpu) => {
      cpu.registers.sp.setValue(cpu.registers.hl.getValue());
    },
    cycles: 2
  }
];
