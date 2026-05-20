import byte from "../../lib/byte";

/**
 * CALL \a16
 * This pushes the address of the instruction after the CALL on the stack, such that RET can pop it later; then, it executes an implicit JP \a16.
 */
function CALL(cpu, a16) {
  cpu.stack.push16(cpu.registers.pc.getValue());
  cpu.registers.pc.setValue(a16);
}

/**
 * JP \a16
 * Jump to address in \a16; effectively, copy the value in \a16 into PC.
 */
function JP(cpu, a16) {
  cpu.registers.pc.setValue(a16);
}

/**
 * JR \s8
 * Relative Jump to address a16.
 * The target address a16 is encoded as a signed 8-bit offset from the address immediately following the JR instruction, so it must be between -128 and 127 bytes away.
 */
function JR(cpu, u8) {
  const s8 = byte.toS8(u8);
  const currentValue = cpu.registers.pc.getValue();
  cpu.registers.pc.setValue(currentValue + s8);
}

/**
 * RET
 * Return from subroutine.
 * This is basically a POP PC (if such an instruction existed).
 */
function RET(cpu) {
  cpu.registers.pc.setValue(cpu.stack.pop16());
}

/**
 * RETI
 * Return from subroutine and enable interrupts.
 * This is basically equivalent to executing EI then RET, meaning that IME is set right after this instruction.
 */
function RETI(cpu) {
  RET(cpu);
  cpu.ime = 1;
}

export default [
  // JR s8
  {
    id: 0x18,
    run: (cpu) => {
      const s8 = cpu.fetchProgramByte();
      JR(cpu, s8);
    },
    cycles: 3
  },

  // JR NZ, s8
  {
    id: 0x20,
    run: (cpu) => {
      const s8 = cpu.fetchProgramByte();

      if (!cpu.registers.flags.zero) {
        cpu.cycle += 1;
        JR(cpu, s8);
      }
    },
    cycles: 2
  },

  // JR Z, s8
  {
    id: 0x28,
    run: (cpu) => {
      const s8 = cpu.fetchProgramByte();

      if (cpu.registers.flags.zero) {
        cpu.cycle += 1;
        JR(cpu, s8);
      }
    },
    cycles: 2
  },

  // JR NC, s8
  {
    id: 0x30,
    run: (cpu) => {
      const s8 = cpu.fetchProgramByte();

      if (!cpu.registers.flags.carry) {
        cpu.cycle += 1;
        JR(cpu, s8);
      }
    },
    cycles: 2
  },

  // JR C, s8
  {
    id: 0x38,
    run: (cpu) => {
      const s8 = cpu.fetchProgramByte();

      if (cpu.registers.flags.carry) {
        cpu.cycle += 1;
        JR(cpu, s8);
      }
    },
    cycles: 2
  },

  // RET NZ
  {
    id: 0xc0,
    run: (cpu) => {
      if (!cpu.registers.flags.zero) {
        cpu.cycle += 3;
        RET(cpu);
      }
    },
    cycles: 2
  },

  // JP NZ, a16
  {
    id: 0xc2,
    run: (cpu) => {
      const a16 = cpu.fetchProgramHalfword();

      if (!cpu.registers.flags.zero) {
        cpu.cycle += 1;
        JP(cpu, a16);
      }
    },
    cycles: 3
  },

  // JP a16
  {
    id: 0xc3,
    run: (cpu) => {
      const a16 = cpu.fetchProgramHalfword();
      JP(cpu, a16);
    },
    cycles: 4
  },

  // CALL NZ, a16
  {
    id: 0xc4,
    run: (cpu) => {
      const a16 = cpu.fetchProgramHalfword();

      if (!cpu.registers.flags.zero) {
        cpu.cycle += 3;
        CALL(cpu, a16);
      }
    },
    cycles: 3
  },

  // RST 00H
  {
    id: 0xc7,
    run: (cpu) => {
      CALL(cpu, 0x00);
    },
    cycles: 4
  },

  // RET Z
  {
    id: 0xc8,
    run: (cpu) => {
      if (cpu.registers.flags.zero) {
        cpu.cycle += 3;
        RET(cpu);
      }
    },
    cycles: 2
  },

  // RET
  {
    id: 0xc9,
    run: (cpu) => {
      RET(cpu);
    },
    cycles: 4
  },

  // JP Z, a16
  {
    id: 0xca,
    run: (cpu) => {
      const a16 = cpu.fetchProgramHalfword();

      if (cpu.registers.flags.zero) {
        cpu.cycle += 1;
        JP(cpu, a16);
      }
    },
    cycles: 3
  },

  // CALL Z, a16
  {
    id: 0xcc,
    run: (cpu) => {
      const a16 = cpu.fetchProgramHalfword();

      if (cpu.registers.flags.zero) {
        cpu.cycle += 3;
        CALL(cpu, a16);
      }
    },
    cycles: 3
  },

  // CALL a16
  {
    id: 0xcd,
    run: (cpu) => {
      const a16 = cpu.fetchProgramHalfword();
      CALL(cpu, a16);
    },
    cycles: 6
  },

  // RST 08H
  {
    id: 0xcf,
    run: (cpu) => {
      CALL(cpu, 0x08);
    },
    cycles: 4
  },

  // RET NC
  {
    id: 0xd0,
    run: (cpu) => {
      if (!cpu.registers.flags.carry) {
        cpu.cycle += 3;
        RET(cpu);
      }
    },
    cycles: 2
  },

  // JP NC, a16
  {
    id: 0xd2,
    run: (cpu) => {
      const a16 = cpu.fetchProgramHalfword();

      if (!cpu.registers.flags.carry) {
        cpu.cycle += 1;
        JP(cpu, a16);
      }
    },
    cycles: 3
  },

  // CALL NC, a16
  {
    id: 0xd4,
    run: (cpu) => {
      const a16 = cpu.fetchProgramHalfword();

      if (!cpu.registers.flags.carry) {
        cpu.cycle += 3;
        CALL(cpu, a16);
      }
    },
    cycles: 3
  },

  // RST 10H
  {
    id: 0xd7,
    run: (cpu) => {
      CALL(cpu, 0x10);
    },
    cycles: 4
  },

  // RET C
  {
    id: 0xd8,
    run: (cpu) => {
      if (cpu.registers.flags.carry) {
        cpu.cycle += 3;
        RET(cpu);
      }
    },
    cycles: 2
  },

  // RETI
  {
    id: 0xd9,
    run: (cpu) => {
      RETI(cpu);
    },
    cycles: 4
  },

  // JP C, a16
  {
    id: 0xda,
    run: (cpu) => {
      const a16 = cpu.fetchProgramHalfword();

      if (cpu.registers.flags.carry) {
        cpu.cycle += 1;
        JP(cpu, a16);
      }
    },
    cycles: 3
  },

  // CALL C, a16
  {
    id: 0xdc,
    run: (cpu) => {
      const a16 = cpu.fetchProgramHalfword();

      if (cpu.registers.flags.carry) {
        cpu.cycle += 3;
        CALL(cpu, a16);
      }
    },
    cycles: 3
  },

  // RST 18H
  {
    id: 0xdf,
    run: (cpu) => {
      CALL(cpu, 0x18);
    },
    cycles: 4
  },

  // RST 20H
  {
    id: 0xe7,
    run: (cpu) => {
      CALL(cpu, 0x20);
    },
    cycles: 4
  },

  // JP HL
  {
    id: 0xe9,
    run: (cpu) => {
      cpu.registers.pc.setValue(cpu.registers.hl.getValue());
    },
    cycles: 1
  },

  // RST 28H
  {
    id: 0xef,
    run: (cpu) => {
      CALL(cpu, 0x28);
    },
    cycles: 4
  },

  // RST 30H
  {
    id: 0xf7,
    run: (cpu) => {
      CALL(cpu, 0x30);
    },
    cycles: 4
  },

  // RST 38H
  {
    id: 0xff,
    run: (cpu) => {
      CALL(cpu, 0x38);
    },
    cycles: 4
  }
];
