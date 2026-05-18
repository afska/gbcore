import { INC16, DEC16 } from "./arithmetic_16bit";

/**
 * LD \target, \source
 * Load the contents of register \source into register \target.
 */
function LD(cpu, target, source) {
  target.setValue(source.getValue());
}

export default [
  // LD BC, d16
  {
    id: 0x01,
    run: (cpu) => {
      const d16 = cpu.fetchProgramHalfword();
      cpu.registers.bc.setValue(d16);
    },
    cycles: 3
  },

  // LD (BC), A
  {
    id: 0x02,
    run: (cpu) => {
      const bc = cpu.registers.bc.getValue();
      const a = cpu.registers.a.getValue();
      cpu.memory.write(bc, a);
    },
    cycles: 2
  },

  // LD B, d8
  {
    id: 0x06,
    run: (cpu) => {
      const d8 = cpu.fetchProgramByte();
      cpu.registers.b.setValue(d8);
    },
    cycles: 2
  },

  // LD A, (BC)
  {
    id: 0x0a,
    run: (cpu) => {
      const bc = cpu.registers.bc.getValue();
      cpu.registers.a.setValue(cpu.memory.read(bc));
    },
    cycles: 2
  },

  // LD C, d8
  {
    id: 0x0e,
    run: (cpu) => {
      const d8 = cpu.fetchProgramByte();
      cpu.registers.c.setValue(d8);
    },
    cycles: 2
  },

  // LD DE, d16
  {
    id: 0x11,
    run: (cpu) => {
      const d16 = cpu.fetchProgramHalfword();
      cpu.registers.de.setValue(d16);
    },
    cycles: 3
  },

  // LD (DE), A
  {
    id: 0x12,
    run: (cpu) => {
      const de = cpu.registers.de.getValue();
      const a = cpu.registers.a.getValue();
      cpu.memory.write(de, a);
    },
    cycles: 2
  },

  // LD D, d8
  {
    id: 0x16,
    run: (cpu) => {
      const d8 = cpu.fetchProgramByte();
      cpu.registers.d.setValue(d8);
    },
    cycles: 2
  },

  // LD A, (DE)
  {
    id: 0x1a,
    run: (cpu) => {
      const de = cpu.registers.de.getValue();
      cpu.registers.a.setValue(cpu.memory.read(de));
    },
    cycles: 2
  },

  // LD E, d8
  {
    id: 0x1e,
    run: (cpu) => {
      const d8 = cpu.fetchProgramByte();
      cpu.registers.e.setValue(d8);
    },
    cycles: 2
  },

  // LD HL, d16
  {
    id: 0x21,
    run: (cpu) => {
      const d16 = cpu.fetchProgramHalfword();
      cpu.registers.hl.setValue(d16);
    },
    cycles: 3
  },

  // LD (HL+), A
  {
    id: 0x22,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      const a = cpu.registers.a.getValue();
      cpu.memory.write(hl, a);
      INC16(cpu, cpu.registers.hl);
    },
    cycles: 2
  },

  // LD H, d8
  {
    id: 0x26,
    run: (cpu) => {
      const d8 = cpu.fetchProgramByte();
      cpu.registers.h.setValue(d8);
    },
    cycles: 2
  },

  // LD A, (HL+)
  {
    id: 0x2a,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      cpu.registers.a.setValue(cpu.memory.read(hl));
      INC16(cpu, cpu.registers.hl);
    },
    cycles: 2
  },

  // LD L, d8
  {
    id: 0x2e,
    run: (cpu) => {
      const d8 = cpu.fetchProgramByte();
      cpu.registers.l.setValue(d8);
    },
    cycles: 2
  },

  // LD (HL-), A
  {
    id: 0x32,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      const a = cpu.registers.a.getValue();
      cpu.memory.write(hl, a);
      DEC16(cpu, cpu.registers.hl);
    },
    cycles: 2
  },

  // LD (HL), d8
  {
    id: 0x36,
    run: (cpu) => {
      const d8 = cpu.fetchProgramByte();
      const hl = cpu.registers.hl.getValue();
      cpu.memory.write(hl, d8);
    },
    cycles: 3
  },

  // LD A, (HL-)
  {
    id: 0x3a,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      cpu.registers.a.setValue(cpu.memory.read(hl));
      DEC16(cpu, cpu.registers.hl);
    },
    cycles: 2
  },

  // LD A, d8
  {
    id: 0x3e,
    run: (cpu) => {
      const d8 = cpu.fetchProgramByte();
      cpu.registers.a.setValue(d8);
    },
    cycles: 2
  },

  // LD B, B
  {
    id: 0x40,
    run: (cpu) => {},
    cycles: 1
  },

  // LD B, C
  {
    id: 0x41,
    run: (cpu) => {
      LD(cpu, cpu.registers.b, cpu.registers.c);
    },
    cycles: 1
  },

  // LD B, D
  {
    id: 0x42,
    run: (cpu) => {
      LD(cpu, cpu.registers.b, cpu.registers.d);
    },
    cycles: 1
  },

  // LD B, E
  {
    id: 0x43,
    run: (cpu) => {
      LD(cpu, cpu.registers.b, cpu.registers.e);
    },
    cycles: 1
  },

  // LD B, H
  {
    id: 0x44,
    run: (cpu) => {
      LD(cpu, cpu.registers.b, cpu.registers.h);
    },
    cycles: 1
  },

  // LD B, L
  {
    id: 0x45,
    run: (cpu) => {
      LD(cpu, cpu.registers.b, cpu.registers.l);
    },
    cycles: 1
  },

  // LD B, (HL)
  {
    id: 0x46,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      cpu.registers.b.setValue(cpu.memory.read(hl));
    },
    cycles: 2
  },

  // LD B, A
  {
    id: 0x47,
    run: (cpu) => {
      LD(cpu, cpu.registers.b, cpu.registers.a);
    },
    cycles: 1
  },

  // LD C, B
  {
    id: 0x48,
    run: (cpu) => {
      LD(cpu, cpu.registers.c, cpu.registers.b);
    },
    cycles: 1
  },

  // LD C, C
  {
    id: 0x49,
    run: (cpu) => {},
    cycles: 1
  },

  // LD C, D
  {
    id: 0x4a,
    run: (cpu) => {
      LD(cpu, cpu.registers.c, cpu.registers.d);
    },
    cycles: 1
  },

  // LD C, E
  {
    id: 0x4b,
    run: (cpu) => {
      LD(cpu, cpu.registers.c, cpu.registers.e);
    },
    cycles: 1
  },

  // LD C, H
  {
    id: 0x4c,
    run: (cpu) => {
      LD(cpu, cpu.registers.c, cpu.registers.h);
    },
    cycles: 1
  },

  // LD C, L
  {
    id: 0x4d,
    run: (cpu) => {
      LD(cpu, cpu.registers.c, cpu.registers.l);
    },
    cycles: 1
  },

  // LD C, (HL)
  {
    id: 0x4e,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      cpu.registers.c.setValue(cpu.memory.read(hl));
    },
    cycles: 2
  },

  // LD C, A
  {
    id: 0x4f,
    run: (cpu) => {
      LD(cpu, cpu.registers.c, cpu.registers.a);
    },
    cycles: 1
  },

  // LD D, B
  {
    id: 0x50,
    run: (cpu) => {
      LD(cpu, cpu.registers.d, cpu.registers.b);
    },
    cycles: 1
  },

  // LD D, C
  {
    id: 0x51,
    run: (cpu) => {
      LD(cpu, cpu.registers.d, cpu.registers.c);
    },
    cycles: 1
  },

  // LD D, D
  {
    id: 0x52,
    run: (cpu) => {},
    cycles: 1
  },

  // LD D, E
  {
    id: 0x53,
    run: (cpu) => {
      LD(cpu, cpu.registers.d, cpu.registers.e);
    },
    cycles: 1
  },

  // LD D, H
  {
    id: 0x54,
    run: (cpu) => {
      LD(cpu, cpu.registers.d, cpu.registers.h);
    },
    cycles: 1
  },

  // LD D, L
  {
    id: 0x55,
    run: (cpu) => {
      LD(cpu, cpu.registers.d, cpu.registers.l);
    },
    cycles: 1
  },

  // LD D, (HL)
  {
    id: 0x56,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      cpu.registers.d.setValue(cpu.memory.read(hl));
    },
    cycles: 2
  },

  // LD D, A
  {
    id: 0x57,
    run: (cpu) => {
      LD(cpu, cpu.registers.d, cpu.registers.a);
    },
    cycles: 1
  },

  // LD E, B
  {
    id: 0x58,
    run: (cpu) => {
      LD(cpu, cpu.registers.e, cpu.registers.b);
    },
    cycles: 1
  },

  // LD E, C
  {
    id: 0x59,
    run: (cpu) => {
      LD(cpu, cpu.registers.e, cpu.registers.c);
    },
    cycles: 1
  },

  // LD E, D
  {
    id: 0x5a,
    run: (cpu) => {
      LD(cpu, cpu.registers.e, cpu.registers.d);
    },
    cycles: 1
  },

  // LD E, E
  {
    id: 0x5b,
    run: (cpu) => {},
    cycles: 1
  },

  // LD E, H
  {
    id: 0x5c,
    run: (cpu) => {
      LD(cpu, cpu.registers.e, cpu.registers.h);
    },
    cycles: 1
  },

  // LD E, L
  {
    id: 0x5d,
    run: (cpu) => {
      LD(cpu, cpu.registers.e, cpu.registers.l);
    },
    cycles: 1
  },

  // LD E, (HL)
  {
    id: 0x5e,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      cpu.registers.e.setValue(cpu.memory.read(hl));
    },
    cycles: 2
  },

  // LD E, A
  {
    id: 0x5f,
    run: (cpu) => {
      LD(cpu, cpu.registers.e, cpu.registers.a);
    },
    cycles: 1
  },

  // LD H, B
  {
    id: 0x60,
    run: (cpu) => {
      LD(cpu, cpu.registers.h, cpu.registers.b);
    },
    cycles: 1
  },

  // LD H, C
  {
    id: 0x61,
    run: (cpu) => {
      LD(cpu, cpu.registers.h, cpu.registers.c);
    },
    cycles: 1
  },

  // LD H, D
  {
    id: 0x62,
    run: (cpu) => {
      LD(cpu, cpu.registers.h, cpu.registers.d);
    },
    cycles: 1
  },

  // LD H, E
  {
    id: 0x63,
    run: (cpu) => {
      LD(cpu, cpu.registers.h, cpu.registers.e);
    },
    cycles: 1
  },

  // LD H, H
  {
    id: 0x64,
    run: (cpu) => {},
    cycles: 1
  },

  // LD H, L
  {
    id: 0x65,
    run: (cpu) => {
      LD(cpu, cpu.registers.h, cpu.registers.l);
    },
    cycles: 1
  },

  // LD H, (HL)
  {
    id: 0x66,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      cpu.registers.h.setValue(cpu.memory.read(hl));
    },
    cycles: 2
  },

  // LD H, A
  {
    id: 0x67,
    run: (cpu) => {
      LD(cpu, cpu.registers.h, cpu.registers.a);
    },
    cycles: 1
  },

  // LD L, B
  {
    id: 0x68,
    run: (cpu) => {
      LD(cpu, cpu.registers.l, cpu.registers.b);
    },
    cycles: 1
  },

  // LD L, C
  {
    id: 0x69,
    run: (cpu) => {
      LD(cpu, cpu.registers.l, cpu.registers.c);
    },
    cycles: 1
  },

  // LD L, D
  {
    id: 0x6a,
    run: (cpu) => {
      LD(cpu, cpu.registers.l, cpu.registers.d);
    },
    cycles: 1
  },

  // LD L, E
  {
    id: 0x6b,
    run: (cpu) => {
      LD(cpu, cpu.registers.l, cpu.registers.e);
    },
    cycles: 1
  },

  // LD L, H
  {
    id: 0x6c,
    run: (cpu) => {
      LD(cpu, cpu.registers.l, cpu.registers.h);
    },
    cycles: 1
  },

  // LD L, L
  {
    id: 0x6d,
    run: (cpu) => {},
    cycles: 1
  },

  // LD L, (HL)
  {
    id: 0x6e,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      cpu.registers.l.setValue(cpu.memory.read(hl));
    },
    cycles: 2
  },

  // LD L, A
  {
    id: 0x6f,
    run: (cpu) => {
      LD(cpu, cpu.registers.l, cpu.registers.a);
    },
    cycles: 1
  },

  // LD (HL), B
  {
    id: 0x70,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      const b = cpu.registers.b.getValue();
      cpu.memory.write(hl, b);
    },
    cycles: 2
  },

  // LD (HL), C
  {
    id: 0x71,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      const c = cpu.registers.c.getValue();
      cpu.memory.write(hl, c);
    },
    cycles: 2
  },

  // LD (HL), D
  {
    id: 0x72,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      const d = cpu.registers.d.getValue();
      cpu.memory.write(hl, d);
    },
    cycles: 2
  },

  // LD (HL), E
  {
    id: 0x73,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      const e = cpu.registers.e.getValue();
      cpu.memory.write(hl, e);
    },
    cycles: 2
  },

  // LD (HL), H
  {
    id: 0x74,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      const h = cpu.registers.h.getValue();
      cpu.memory.write(hl, h);
    },
    cycles: 2
  },

  // LD (HL), L
  {
    id: 0x75,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      const l = cpu.registers.l.getValue();
      cpu.memory.write(hl, l);
    },
    cycles: 2
  },

  // LD (HL), A
  {
    id: 0x77,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      const a = cpu.registers.a.getValue();
      cpu.memory.write(hl, a);
    },
    cycles: 2
  },

  // LD A, B
  {
    id: 0x78,
    run: (cpu) => {
      LD(cpu, cpu.registers.a, cpu.registers.b);
    },
    cycles: 1
  },

  // LD A, C
  {
    id: 0x79,
    run: (cpu) => {
      LD(cpu, cpu.registers.a, cpu.registers.c);
    },
    cycles: 1
  },

  // LD A, D
  {
    id: 0x7a,
    run: (cpu) => {
      LD(cpu, cpu.registers.a, cpu.registers.d);
    },
    cycles: 1
  },

  // LD A, E
  {
    id: 0x7b,
    run: (cpu) => {
      LD(cpu, cpu.registers.a, cpu.registers.e);
    },
    cycles: 1
  },

  // LD A, H
  {
    id: 0x7c,
    run: (cpu) => {
      LD(cpu, cpu.registers.a, cpu.registers.h);
    },
    cycles: 1
  },

  // LD A, L
  {
    id: 0x7d,
    run: (cpu) => {
      LD(cpu, cpu.registers.a, cpu.registers.l);
    },
    cycles: 1
  },

  // LD A, (HL)
  {
    id: 0x7e,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      cpu.registers.a.setValue(cpu.memory.read(hl));
    },
    cycles: 2
  },

  // LD A, A
  {
    id: 0x7f,
    run: (cpu) => {},
    cycles: 1
  },

  // LD (a8), A
  {
    id: 0xe0,
    run: (cpu) => {
      const a8 = cpu.fetchProgramByte();
      const address = 0xff00 | a8;
      const a = cpu.registers.a.getValue();
      cpu.memory.write(address, a);
    },
    cycles: 3
  },

  // LD (C), A
  {
    id: 0xe2,
    run: (cpu) => {
      const c = cpu.registers.c.getValue();
      const address = 0xff00 | c;
      const a = cpu.registers.a.getValue();
      cpu.memory.write(address, a);
    },
    cycles: 2
  },

  // LD (a16), A
  {
    id: 0xea,
    run: (cpu) => {
      const a16 = cpu.fetchProgramHalfword();
      const a = cpu.registers.a.getValue();
      cpu.memory.write(a16, a);
    },
    cycles: 4
  },

  // LD A, (a8)
  {
    id: 0xf0,
    run: (cpu) => {
      const a8 = cpu.fetchProgramByte();
      const address = 0xff00 | a8;
      cpu.registers.a.setValue(cpu.memory.read(address));
    },
    cycles: 3
  },

  // LD A, (a16)
  {
    id: 0xfa,
    run: (cpu) => {
      const a16 = cpu.fetchProgramHalfword();
      cpu.registers.a.setValue(cpu.memory.read(a16));
    },
    cycles: 4
  },

  // LD A, (C)
  {
    id: 0xf2,
    run: (cpu) => {
      const c = cpu.registers.c.getValue();
      const address = 0xff00 | c;
      cpu.registers.a.setValue(cpu.memory.read(address));
    },
    cycles: 2
  }
];
