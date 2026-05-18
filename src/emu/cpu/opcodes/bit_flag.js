import byte from "../../lib/byte";

/**
 * BIT \n, \value
 * Copy the complement of the contents of bit \n in \value to the Z flag.
 *
 * Z: Set if the selected bit is 0.
 * N: 0.
 * H: 1.
 */
function BIT(cpu, n, value) {
  const bit = byte.getBit(value, n);

  cpu.registers.flags.zero = !bit;
  cpu.registers.flags.subtraction = false;
  cpu.registers.flags.halfCarry = true;
}

/**
 * SET \n, \target
 * Set bit \n in \target to 1.
 */
function SET(cpu, target, n) {
  const currentValue = target.getValue();
  const newValue = byte.setBit(currentValue, n, 1);
  target.setValue(newValue);
}

/**
 * RES \n, \target
 * Set bit \n in \target to 0.
 */
function RES(cpu, target, n) {
  const currentValue = target.getValue();
  const newValue = byte.setBit(currentValue, n, 0);
  target.setValue(newValue);
}

export default [
  // BIT 0, B
  {
    id: 0xcb40,
    run: (cpu) => {
      const b = cpu.registers.b.getValue();
      BIT(cpu, 0, b);
    },
    cycles: 2
  },

  // BIT 0, C
  {
    id: 0xcb41,
    run: (cpu) => {
      const c = cpu.registers.c.getValue();
      BIT(cpu, 0, c);
    },
    cycles: 2
  },

  // BIT 0, D
  {
    id: 0xcb42,
    run: (cpu) => {
      const d = cpu.registers.d.getValue();
      BIT(cpu, 0, d);
    },
    cycles: 2
  },

  // BIT 0, E
  {
    id: 0xcb43,
    run: (cpu) => {
      const e = cpu.registers.e.getValue();
      BIT(cpu, 0, e);
    },
    cycles: 2
  },

  // BIT 0, H
  {
    id: 0xcb44,
    run: (cpu) => {
      const h = cpu.registers.h.getValue();
      BIT(cpu, 0, h);
    },
    cycles: 2
  },

  // BIT 0, L
  {
    id: 0xcb45,
    run: (cpu) => {
      const l = cpu.registers.l.getValue();
      BIT(cpu, 0, l);
    },
    cycles: 2
  },

  // BIT 0, (HL)
  {
    id: 0xcb46,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      const value = cpu.memory.read(hl);
      BIT(cpu, 0, value);
    },
    cycles: 3
  },

  // BIT 0, A
  {
    id: 0xcb47,
    run: (cpu) => {
      const a = cpu.registers.a.getValue();
      BIT(cpu, 0, a);
    },
    cycles: 2
  },

  // BIT 1, B
  {
    id: 0xcb48,
    run: (cpu) => {
      const b = cpu.registers.b.getValue();
      BIT(cpu, 1, b);
    },
    cycles: 2
  },

  // BIT 1, C
  {
    id: 0xcb49,
    run: (cpu) => {
      const c = cpu.registers.c.getValue();
      BIT(cpu, 1, c);
    },
    cycles: 2
  },

  // BIT 1, D
  {
    id: 0xcb4a,
    run: (cpu) => {
      const d = cpu.registers.d.getValue();
      BIT(cpu, 1, d);
    },
    cycles: 2
  },

  // BIT 1, E
  {
    id: 0xcb4b,
    run: (cpu) => {
      const e = cpu.registers.e.getValue();
      BIT(cpu, 1, e);
    },
    cycles: 2
  },

  // BIT 1, H
  {
    id: 0xcb4c,
    run: (cpu) => {
      const h = cpu.registers.h.getValue();
      BIT(cpu, 1, h);
    },
    cycles: 2
  },

  // BIT 1, L
  {
    id: 0xcb4d,
    run: (cpu) => {
      const l = cpu.registers.l.getValue();
      BIT(cpu, 1, l);
    },
    cycles: 2
  },

  // BIT 1, (HL)
  {
    id: 0xcb4e,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      const value = cpu.memory.read(hl);
      BIT(cpu, 1, value);
    },
    cycles: 3
  },

  // BIT 1, A
  {
    id: 0xcb4f,
    run: (cpu) => {
      const a = cpu.registers.a.getValue();
      BIT(cpu, 1, a);
    },
    cycles: 2
  },

  // BIT 2, B
  {
    id: 0xcb50,
    run: (cpu) => {
      const b = cpu.registers.b.getValue();
      BIT(cpu, 2, b);
    },
    cycles: 2
  },

  // BIT 2, C
  {
    id: 0xcb51,
    run: (cpu) => {
      const c = cpu.registers.c.getValue();
      BIT(cpu, 2, c);
    },
    cycles: 2
  },

  // BIT 2, D
  {
    id: 0xcb52,
    run: (cpu) => {
      const d = cpu.registers.d.getValue();
      BIT(cpu, 2, d);
    },
    cycles: 2
  },

  // BIT 2, E
  {
    id: 0xcb53,
    run: (cpu) => {
      const e = cpu.registers.e.getValue();
      BIT(cpu, 2, e);
    },
    cycles: 2
  },

  // BIT 2, H
  {
    id: 0xcb54,
    run: (cpu) => {
      const h = cpu.registers.h.getValue();
      BIT(cpu, 2, h);
    },
    cycles: 2
  },

  // BIT 2, L
  {
    id: 0xcb55,
    run: (cpu) => {
      const l = cpu.registers.l.getValue();
      BIT(cpu, 2, l);
    },
    cycles: 2
  },

  // BIT 2, (HL)
  {
    id: 0xcb56,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      const value = cpu.memory.read(hl);
      BIT(cpu, 2, value);
    },
    cycles: 3
  },

  // BIT 2, A
  {
    id: 0xcb57,
    run: (cpu) => {
      const a = cpu.registers.a.getValue();
      BIT(cpu, 2, a);
    },
    cycles: 2
  },

  // BIT 3, B
  {
    id: 0xcb58,
    run: (cpu) => {
      const b = cpu.registers.b.getValue();
      BIT(cpu, 3, b);
    },
    cycles: 2
  },

  // BIT 3, C
  {
    id: 0xcb59,
    run: (cpu) => {
      const c = cpu.registers.c.getValue();
      BIT(cpu, 3, c);
    },
    cycles: 2
  },

  // BIT 3, D
  {
    id: 0xcb5a,
    run: (cpu) => {
      const d = cpu.registers.d.getValue();
      BIT(cpu, 3, d);
    },
    cycles: 2
  },

  // BIT 3, E
  {
    id: 0xcb5b,
    run: (cpu) => {
      const e = cpu.registers.e.getValue();
      BIT(cpu, 3, e);
    },
    cycles: 2
  },

  // BIT 3, H
  {
    id: 0xcb5c,
    run: (cpu) => {
      const h = cpu.registers.h.getValue();
      BIT(cpu, 3, h);
    },
    cycles: 2
  },

  // BIT 3, L
  {
    id: 0xcb5d,
    run: (cpu) => {
      const l = cpu.registers.l.getValue();
      BIT(cpu, 3, l);
    },
    cycles: 2
  },

  // BIT 3, (HL)
  {
    id: 0xcb5e,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      const value = cpu.memory.read(hl);
      BIT(cpu, 3, value);
    },
    cycles: 3
  },

  // BIT 3, A
  {
    id: 0xcb5f,
    run: (cpu) => {
      const a = cpu.registers.a.getValue();
      BIT(cpu, 3, a);
    },
    cycles: 2
  },

  // BIT 4, B
  {
    id: 0xcb60,
    run: (cpu) => {
      const b = cpu.registers.b.getValue();
      BIT(cpu, 4, b);
    },
    cycles: 2
  },

  // BIT 4, C
  {
    id: 0xcb61,
    run: (cpu) => {
      const c = cpu.registers.c.getValue();
      BIT(cpu, 4, c);
    },
    cycles: 2
  },

  // BIT 4, D
  {
    id: 0xcb62,
    run: (cpu) => {
      const d = cpu.registers.d.getValue();
      BIT(cpu, 4, d);
    },
    cycles: 2
  },

  // BIT 4, E
  {
    id: 0xcb63,
    run: (cpu) => {
      const e = cpu.registers.e.getValue();
      BIT(cpu, 4, e);
    },
    cycles: 2
  },

  // BIT 4, H
  {
    id: 0xcb64,
    run: (cpu) => {
      const h = cpu.registers.h.getValue();
      BIT(cpu, 4, h);
    },
    cycles: 2
  },

  // BIT 4, L
  {
    id: 0xcb65,
    run: (cpu) => {
      const l = cpu.registers.l.getValue();
      BIT(cpu, 4, l);
    },
    cycles: 2
  },

  // BIT 4, (HL)
  {
    id: 0xcb66,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      const value = cpu.memory.read(hl);
      BIT(cpu, 4, value);
    },
    cycles: 3
  },

  // BIT 4, A
  {
    id: 0xcb67,
    run: (cpu) => {
      const a = cpu.registers.a.getValue();
      BIT(cpu, 4, a);
    },
    cycles: 2
  },

  // BIT 5, B
  {
    id: 0xcb68,
    run: (cpu) => {
      const b = cpu.registers.b.getValue();
      BIT(cpu, 5, b);
    },
    cycles: 2
  },

  // BIT 5, C
  {
    id: 0xcb69,
    run: (cpu) => {
      const c = cpu.registers.c.getValue();
      BIT(cpu, 5, c);
    },
    cycles: 2
  },

  // BIT 5, D
  {
    id: 0xcb6a,
    run: (cpu) => {
      const d = cpu.registers.d.getValue();
      BIT(cpu, 5, d);
    },
    cycles: 2
  },

  // BIT 5, E
  {
    id: 0xcb6b,
    run: (cpu) => {
      const e = cpu.registers.e.getValue();
      BIT(cpu, 5, e);
    },
    cycles: 2
  },

  // BIT 5, H
  {
    id: 0xcb6c,
    run: (cpu) => {
      const h = cpu.registers.h.getValue();
      BIT(cpu, 5, h);
    },
    cycles: 2
  },

  // BIT 5, L
  {
    id: 0xcb6d,
    run: (cpu) => {
      const l = cpu.registers.l.getValue();
      BIT(cpu, 5, l);
    },
    cycles: 2
  },

  // BIT 5, (HL)
  {
    id: 0xcb6e,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      const value = cpu.memory.read(hl);
      BIT(cpu, 5, value);
    },
    cycles: 3
  },

  // BIT 5, A
  {
    id: 0xcb6f,
    run: (cpu) => {
      const a = cpu.registers.a.getValue();
      BIT(cpu, 5, a);
    },
    cycles: 2
  },

  // BIT 6, B
  {
    id: 0xcb70,
    run: (cpu) => {
      const b = cpu.registers.b.getValue();
      BIT(cpu, 6, b);
    },
    cycles: 2
  },

  // BIT 6, C
  {
    id: 0xcb71,
    run: (cpu) => {
      const c = cpu.registers.c.getValue();
      BIT(cpu, 6, c);
    },
    cycles: 2
  },

  // BIT 6, D
  {
    id: 0xcb72,
    run: (cpu) => {
      const d = cpu.registers.d.getValue();
      BIT(cpu, 6, d);
    },
    cycles: 2
  },

  // BIT 6, E
  {
    id: 0xcb73,
    run: (cpu) => {
      const e = cpu.registers.e.getValue();
      BIT(cpu, 6, e);
    },
    cycles: 2
  },

  // BIT 6, H
  {
    id: 0xcb74,
    run: (cpu) => {
      const h = cpu.registers.h.getValue();
      BIT(cpu, 6, h);
    },
    cycles: 2
  },

  // BIT 6, L
  {
    id: 0xcb75,
    run: (cpu) => {
      const l = cpu.registers.l.getValue();
      BIT(cpu, 6, l);
    },
    cycles: 2
  },

  // BIT 6, (HL)
  {
    id: 0xcb76,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      const value = cpu.memory.read(hl);
      BIT(cpu, 6, value);
    },
    cycles: 3
  },

  // BIT 6, A
  {
    id: 0xcb77,
    run: (cpu) => {
      const a = cpu.registers.a.getValue();
      BIT(cpu, 6, a);
    },
    cycles: 2
  },

  // BIT 7, B
  {
    id: 0xcb78,
    run: (cpu) => {
      const b = cpu.registers.b.getValue();
      BIT(cpu, 7, b);
    },
    cycles: 2
  },

  // BIT 7, C
  {
    id: 0xcb79,
    run: (cpu) => {
      const c = cpu.registers.c.getValue();
      BIT(cpu, 7, c);
    },
    cycles: 2
  },

  // BIT 7, D
  {
    id: 0xcb7a,
    run: (cpu) => {
      const d = cpu.registers.d.getValue();
      BIT(cpu, 7, d);
    },
    cycles: 2
  },

  // BIT 7, E
  {
    id: 0xcb7b,
    run: (cpu) => {
      const e = cpu.registers.e.getValue();
      BIT(cpu, 7, e);
    },
    cycles: 2
  },

  // BIT 7, H
  {
    id: 0xcb7c,
    run: (cpu) => {
      const h = cpu.registers.h.getValue();
      BIT(cpu, 7, h);
    },
    cycles: 2
  },

  // BIT 7, L
  {
    id: 0xcb7d,
    run: (cpu) => {
      const l = cpu.registers.l.getValue();
      BIT(cpu, 7, l);
    },
    cycles: 2
  },

  // BIT 7, (HL)
  {
    id: 0xcb7e,
    run: (cpu) => {
      const hl = cpu.registers.hl.getValue();
      const value = cpu.memory.read(hl);
      BIT(cpu, 7, value);
    },
    cycles: 3
  },

  // BIT 7, A
  {
    id: 0xcb7f,
    run: (cpu) => {
      const a = cpu.registers.a.getValue();
      BIT(cpu, 7, a);
    },
    cycles: 2
  },

  // RES 0, B
  {
    id: 0xcb80,
    run: (cpu) => {
      const b = cpu.registers.b;
      RES(cpu, b, 0);
    },
    cycles: 2
  },

  // RES 0, C
  {
    id: 0xcb81,
    run: (cpu) => {
      const c = cpu.registers.c;
      RES(cpu, c, 0);
    },
    cycles: 2
  },

  // RES 0, D
  {
    id: 0xcb82,
    run: (cpu) => {
      const d = cpu.registers.d;
      RES(cpu, d, 0);
    },
    cycles: 2
  },

  // RES 0, E
  {
    id: 0xcb83,
    run: (cpu) => {
      const e = cpu.registers.e;
      RES(cpu, e, 0);
    },
    cycles: 2
  },

  // RES 0, H
  {
    id: 0xcb84,
    run: (cpu) => {
      const h = cpu.registers.h;
      RES(cpu, h, 0);
    },
    cycles: 2
  },

  // RES 0, L
  {
    id: 0xcb85,
    run: (cpu) => {
      const l = cpu.registers.l;
      RES(cpu, l, 0);
    },
    cycles: 2
  },

  // RES 0, (HL)
  {
    id: 0xcb86,
    run: (cpu) => {
      withHL(cpu, RES, 0);
    },
    cycles: 4
  },

  // RES 0, A
  {
    id: 0xcb87,
    run: (cpu) => {
      const a = cpu.registers.a;
      RES(cpu, a, 0);
    },
    cycles: 2
  },

  // RES 1, B
  {
    id: 0xcb88,
    run: (cpu) => {
      const b = cpu.registers.b;
      RES(cpu, b, 1);
    },
    cycles: 2
  },

  // RES 1, C
  {
    id: 0xcb89,
    run: (cpu) => {
      const c = cpu.registers.c;
      RES(cpu, c, 1);
    },
    cycles: 2
  },

  // RES 1, D
  {
    id: 0xcb8a,
    run: (cpu) => {
      const d = cpu.registers.d;
      RES(cpu, d, 1);
    },
    cycles: 2
  },

  // RES 1, E
  {
    id: 0xcb8b,
    run: (cpu) => {
      const e = cpu.registers.e;
      RES(cpu, e, 1);
    },
    cycles: 2
  },

  // RES 1, H
  {
    id: 0xcb8c,
    run: (cpu) => {
      const h = cpu.registers.h;
      RES(cpu, h, 1);
    },
    cycles: 2
  },

  // RES 1, L
  {
    id: 0xcb8d,
    run: (cpu) => {
      const l = cpu.registers.l;
      RES(cpu, l, 1);
    },
    cycles: 2
  },

  // RES 1, (HL)
  {
    id: 0xcb8e,
    run: (cpu) => {
      withHL(cpu, RES, 1);
    },
    cycles: 4
  },

  // RES 1, A
  {
    id: 0xcb8f,
    run: (cpu) => {
      const a = cpu.registers.a;
      RES(cpu, a, 1);
    },
    cycles: 2
  },

  // RES 2, B
  {
    id: 0xcb90,
    run: (cpu) => {
      const b = cpu.registers.b;
      RES(cpu, b, 2);
    },
    cycles: 2
  },

  // RES 2, C
  {
    id: 0xcb91,
    run: (cpu) => {
      const c = cpu.registers.c;
      RES(cpu, c, 2);
    },
    cycles: 2
  },

  // RES 2, D
  {
    id: 0xcb92,
    run: (cpu) => {
      const d = cpu.registers.d;
      RES(cpu, d, 2);
    },
    cycles: 2
  },

  // RES 2, E
  {
    id: 0xcb93,
    run: (cpu) => {
      const e = cpu.registers.e;
      RES(cpu, e, 2);
    },
    cycles: 2
  },

  // RES 2, H
  {
    id: 0xcb94,
    run: (cpu) => {
      const h = cpu.registers.h;
      RES(cpu, h, 2);
    },
    cycles: 2
  },

  // RES 2, L
  {
    id: 0xcb95,
    run: (cpu) => {
      const l = cpu.registers.l;
      RES(cpu, l, 2);
    },
    cycles: 2
  },

  // RES 2, (HL)
  {
    id: 0xcb96,
    run: (cpu) => {
      withHL(cpu, RES, 2);
    },
    cycles: 4
  },

  // RES 2, A
  {
    id: 0xcb97,
    run: (cpu) => {
      const a = cpu.registers.a;
      RES(cpu, a, 2);
    },
    cycles: 2
  },

  // RES 3, B
  {
    id: 0xcb98,
    run: (cpu) => {
      const b = cpu.registers.b;
      RES(cpu, b, 3);
    },
    cycles: 2
  },

  // RES 3, C
  {
    id: 0xcb99,
    run: (cpu) => {
      const c = cpu.registers.c;
      RES(cpu, c, 3);
    },
    cycles: 2
  },

  // RES 3, D
  {
    id: 0xcb9a,
    run: (cpu) => {
      const d = cpu.registers.d;
      RES(cpu, d, 3);
    },
    cycles: 2
  },

  // RES 3, E
  {
    id: 0xcb9b,
    run: (cpu) => {
      const e = cpu.registers.e;
      RES(cpu, e, 3);
    },
    cycles: 2
  },

  // RES 3, H
  {
    id: 0xcb9c,
    run: (cpu) => {
      const h = cpu.registers.h;
      RES(cpu, h, 3);
    },
    cycles: 2
  },

  // RES 3, L
  {
    id: 0xcb9d,
    run: (cpu) => {
      const l = cpu.registers.l;
      RES(cpu, l, 3);
    },
    cycles: 2
  },

  // RES 3, (HL)
  {
    id: 0xcb9e,
    run: (cpu) => {
      withHL(cpu, RES, 3);
    },
    cycles: 4
  },

  // RES 3, A
  {
    id: 0xcb9f,
    run: (cpu) => {
      const a = cpu.registers.a;
      RES(cpu, a, 3);
    },
    cycles: 2
  },

  // RES 4, B
  {
    id: 0xcba0,
    run: (cpu) => {
      const b = cpu.registers.b;
      RES(cpu, b, 4);
    },
    cycles: 2
  },

  // RES 4, C
  {
    id: 0xcba1,
    run: (cpu) => {
      const c = cpu.registers.c;
      RES(cpu, c, 4);
    },
    cycles: 2
  },

  // RES 4, D
  {
    id: 0xcba2,
    run: (cpu) => {
      const d = cpu.registers.d;
      RES(cpu, d, 4);
    },
    cycles: 2
  },

  // RES 4, E
  {
    id: 0xcba3,
    run: (cpu) => {
      const e = cpu.registers.e;
      RES(cpu, e, 4);
    },
    cycles: 2
  },

  // RES 4, H
  {
    id: 0xcba4,
    run: (cpu) => {
      const h = cpu.registers.h;
      RES(cpu, h, 4);
    },
    cycles: 2
  },

  // RES 4, L
  {
    id: 0xcba5,
    run: (cpu) => {
      const l = cpu.registers.l;
      RES(cpu, l, 4);
    },
    cycles: 2
  },

  // RES 4, (HL)
  {
    id: 0xcba6,
    run: (cpu) => {
      withHL(cpu, RES, 4);
    },
    cycles: 4
  },

  // RES 4, A
  {
    id: 0xcba7,
    run: (cpu) => {
      const a = cpu.registers.a;
      RES(cpu, a, 4);
    },
    cycles: 2
  },

  // RES 5, B
  {
    id: 0xcba8,
    run: (cpu) => {
      const b = cpu.registers.b;
      RES(cpu, b, 5);
    },
    cycles: 2
  },

  // RES 5, C
  {
    id: 0xcba9,
    run: (cpu) => {
      const c = cpu.registers.c;
      RES(cpu, c, 5);
    },
    cycles: 2
  },

  // RES 5, D
  {
    id: 0xcbaa,
    run: (cpu) => {
      const d = cpu.registers.d;
      RES(cpu, d, 5);
    },
    cycles: 2
  },

  // RES 5, E
  {
    id: 0xcbab,
    run: (cpu) => {
      const e = cpu.registers.e;
      RES(cpu, e, 5);
    },
    cycles: 2
  },

  // RES 5, H
  {
    id: 0xcbac,
    run: (cpu) => {
      const h = cpu.registers.h;
      RES(cpu, h, 5);
    },
    cycles: 2
  },

  // RES 5, L
  {
    id: 0xcbad,
    run: (cpu) => {
      const l = cpu.registers.l;
      RES(cpu, l, 5);
    },
    cycles: 2
  },

  // RES 5, (HL)
  {
    id: 0xcbae,
    run: (cpu) => {
      withHL(cpu, RES, 5);
    },
    cycles: 4
  },

  // RES 5, A
  {
    id: 0xcbaf,
    run: (cpu) => {
      const a = cpu.registers.a;
      RES(cpu, a, 5);
    },
    cycles: 2
  },

  // RES 6, B
  {
    id: 0xcbb0,
    run: (cpu) => {
      const b = cpu.registers.b;
      RES(cpu, b, 6);
    },
    cycles: 2
  },

  // RES 6, C
  {
    id: 0xcbb1,
    run: (cpu) => {
      const c = cpu.registers.c;
      RES(cpu, c, 6);
    },
    cycles: 2
  },

  // RES 6, D
  {
    id: 0xcbb2,
    run: (cpu) => {
      const d = cpu.registers.d;
      RES(cpu, d, 6);
    },
    cycles: 2
  },

  // RES 6, E
  {
    id: 0xcbb3,
    run: (cpu) => {
      const e = cpu.registers.e;
      RES(cpu, e, 6);
    },
    cycles: 2
  },

  // RES 6, H
  {
    id: 0xcbb4,
    run: (cpu) => {
      const h = cpu.registers.h;
      RES(cpu, h, 6);
    },
    cycles: 2
  },

  // RES 6, L
  {
    id: 0xcbb5,
    run: (cpu) => {
      const l = cpu.registers.l;
      RES(cpu, l, 6);
    },
    cycles: 2
  },

  // RES 6, (HL)
  {
    id: 0xcbb6,
    run: (cpu) => {
      withHL(cpu, RES, 6);
    },
    cycles: 4
  },

  // RES 6, A
  {
    id: 0xcbb7,
    run: (cpu) => {
      const a = cpu.registers.a;
      RES(cpu, a, 6);
    },
    cycles: 2
  },

  // RES 7, B
  {
    id: 0xcbb8,
    run: (cpu) => {
      const b = cpu.registers.b;
      RES(cpu, b, 7);
    },
    cycles: 2
  },

  // RES 7, C
  {
    id: 0xcbb9,
    run: (cpu) => {
      const c = cpu.registers.c;
      RES(cpu, c, 7);
    },
    cycles: 2
  },

  // RES 7, D
  {
    id: 0xcbba,
    run: (cpu) => {
      const d = cpu.registers.d;
      RES(cpu, d, 7);
    },
    cycles: 2
  },

  // RES 7, E
  {
    id: 0xcbbb,
    run: (cpu) => {
      const e = cpu.registers.e;
      RES(cpu, e, 7);
    },
    cycles: 2
  },

  // RES 7, H
  {
    id: 0xcbbc,
    run: (cpu) => {
      const h = cpu.registers.h;
      RES(cpu, h, 7);
    },
    cycles: 2
  },

  // RES 7, L
  {
    id: 0xcbbd,
    run: (cpu) => {
      const l = cpu.registers.l;
      RES(cpu, l, 7);
    },
    cycles: 2
  },

  // RES 7, (HL)
  {
    id: 0xcbbe,
    run: (cpu) => {
      withHL(cpu, RES, 7);
    },
    cycles: 4
  },

  // RES 7, A
  {
    id: 0xcbbf,
    run: (cpu) => {
      const a = cpu.registers.a;
      RES(cpu, a, 7);
    },
    cycles: 2
  },

  // SET 0, B
  {
    id: 0xcbc0,
    run: (cpu) => {
      const b = cpu.registers.b;
      SET(cpu, b, 0);
    },
    cycles: 2
  },

  // SET 0, C
  {
    id: 0xcbc1,
    run: (cpu) => {
      const c = cpu.registers.c;
      SET(cpu, c, 0);
    },
    cycles: 2
  },

  // SET 0, D
  {
    id: 0xcbc2,
    run: (cpu) => {
      const d = cpu.registers.d;
      SET(cpu, d, 0);
    },
    cycles: 2
  },

  // SET 0, E
  {
    id: 0xcbc3,
    run: (cpu) => {
      const e = cpu.registers.e;
      SET(cpu, e, 0);
    },
    cycles: 2
  },

  // SET 0, H
  {
    id: 0xcbc4,
    run: (cpu) => {
      const h = cpu.registers.h;
      SET(cpu, h, 0);
    },
    cycles: 2
  },

  // SET 0, L
  {
    id: 0xcbc5,
    run: (cpu) => {
      const l = cpu.registers.l;
      SET(cpu, l, 0);
    },
    cycles: 2
  },

  // SET 0, (HL)
  {
    id: 0xcbc6,
    run: (cpu) => {
      withHL(cpu, SET, 0);
    },
    cycles: 4
  },

  // SET 0, A
  {
    id: 0xcbc7,
    run: (cpu) => {
      const a = cpu.registers.a;
      SET(cpu, a, 0);
    },
    cycles: 2
  },

  // SET 1, B
  {
    id: 0xcbc8,
    run: (cpu) => {
      const b = cpu.registers.b;
      SET(cpu, b, 1);
    },
    cycles: 2
  },

  // SET 1, C
  {
    id: 0xcbc9,
    run: (cpu) => {
      const c = cpu.registers.c;
      SET(cpu, c, 1);
    },
    cycles: 2
  },

  // SET 1, D
  {
    id: 0xcbca,
    run: (cpu) => {
      const d = cpu.registers.d;
      SET(cpu, d, 1);
    },
    cycles: 2
  },

  // SET 1, E
  {
    id: 0xcbcb,
    run: (cpu) => {
      const e = cpu.registers.e;
      SET(cpu, e, 1);
    },
    cycles: 2
  },

  // SET 1, H
  {
    id: 0xcbcc,
    run: (cpu) => {
      const h = cpu.registers.h;
      SET(cpu, h, 1);
    },
    cycles: 2
  },

  // SET 1, L
  {
    id: 0xcbcd,
    run: (cpu) => {
      const l = cpu.registers.l;
      SET(cpu, l, 1);
    },
    cycles: 2
  },

  // SET 1, (HL)
  {
    id: 0xcbce,
    run: (cpu) => {
      withHL(cpu, SET, 1);
    },
    cycles: 4
  },

  // SET 1, A
  {
    id: 0xcbcf,
    run: (cpu) => {
      const a = cpu.registers.a;
      SET(cpu, a, 1);
    },
    cycles: 2
  },

  // SET 2, B
  {
    id: 0xcbd0,
    run: (cpu) => {
      const b = cpu.registers.b;
      SET(cpu, b, 2);
    },
    cycles: 2
  },

  // SET 2, C
  {
    id: 0xcbd1,
    run: (cpu) => {
      const c = cpu.registers.c;
      SET(cpu, c, 2);
    },
    cycles: 2
  },

  // SET 2, D
  {
    id: 0xcbd2,
    run: (cpu) => {
      const d = cpu.registers.d;
      SET(cpu, d, 2);
    },
    cycles: 2
  },

  // SET 2, E
  {
    id: 0xcbd3,
    run: (cpu) => {
      const e = cpu.registers.e;
      SET(cpu, e, 2);
    },
    cycles: 2
  },

  // SET 2, H
  {
    id: 0xcbd4,
    run: (cpu) => {
      const h = cpu.registers.h;
      SET(cpu, h, 2);
    },
    cycles: 2
  },

  // SET 2, L
  {
    id: 0xcbd5,
    run: (cpu) => {
      const l = cpu.registers.l;
      SET(cpu, l, 2);
    },
    cycles: 2
  },

  // SET 2, (HL)
  {
    id: 0xcbd6,
    run: (cpu) => {
      withHL(cpu, SET, 2);
    },
    cycles: 4
  },

  // SET 2, A
  {
    id: 0xcbd7,
    run: (cpu) => {
      const a = cpu.registers.a;
      SET(cpu, a, 2);
    },
    cycles: 2
  },

  // SET 3, B
  {
    id: 0xcbd8,
    run: (cpu) => {
      const b = cpu.registers.b;
      SET(cpu, b, 3);
    },
    cycles: 2
  },

  // SET 3, C
  {
    id: 0xcbd9,
    run: (cpu) => {
      const c = cpu.registers.c;
      SET(cpu, c, 3);
    },
    cycles: 2
  },

  // SET 3, D
  {
    id: 0xcbda,
    run: (cpu) => {
      const d = cpu.registers.d;
      SET(cpu, d, 3);
    },
    cycles: 2
  },

  // SET 3, E
  {
    id: 0xcbdb,
    run: (cpu) => {
      const e = cpu.registers.e;
      SET(cpu, e, 3);
    },
    cycles: 2
  },

  // SET 3, H
  {
    id: 0xcbdc,
    run: (cpu) => {
      const h = cpu.registers.h;
      SET(cpu, h, 3);
    },
    cycles: 2
  },

  // SET 3, L
  {
    id: 0xcbdd,
    run: (cpu) => {
      const l = cpu.registers.l;
      SET(cpu, l, 3);
    },
    cycles: 2
  },

  // SET 3, (HL)
  {
    id: 0xcbde,
    run: (cpu) => {
      withHL(cpu, SET, 3);
    },
    cycles: 4
  },

  // SET 3, A
  {
    id: 0xcbdf,
    run: (cpu) => {
      const a = cpu.registers.a;
      SET(cpu, a, 3);
    },
    cycles: 2
  },

  // SET 4, B
  {
    id: 0xcbe0,
    run: (cpu) => {
      const b = cpu.registers.b;
      SET(cpu, b, 4);
    },
    cycles: 2
  },

  // SET 4, C
  {
    id: 0xcbe1,
    run: (cpu) => {
      const c = cpu.registers.c;
      SET(cpu, c, 4);
    },
    cycles: 2
  },

  // SET 4, D
  {
    id: 0xcbe2,
    run: (cpu) => {
      const d = cpu.registers.d;
      SET(cpu, d, 4);
    },
    cycles: 2
  },

  // SET 4, E
  {
    id: 0xcbe3,
    run: (cpu) => {
      const e = cpu.registers.e;
      SET(cpu, e, 4);
    },
    cycles: 2
  },

  // SET 4, H
  {
    id: 0xcbe4,
    run: (cpu) => {
      const h = cpu.registers.h;
      SET(cpu, h, 4);
    },
    cycles: 2
  },

  // SET 4, L
  {
    id: 0xcbe5,
    run: (cpu) => {
      const l = cpu.registers.l;
      SET(cpu, l, 4);
    },
    cycles: 2
  },

  // SET 4, (HL)
  {
    id: 0xcbe6,
    run: (cpu) => {
      withHL(cpu, SET, 4);
    },
    cycles: 4
  },

  // SET 4, A
  {
    id: 0xcbe7,
    run: (cpu) => {
      const a = cpu.registers.a;
      SET(cpu, a, 4);
    },
    cycles: 2
  },

  // SET 5, B
  {
    id: 0xcbe8,
    run: (cpu) => {
      const b = cpu.registers.b;
      SET(cpu, b, 5);
    },
    cycles: 2
  },

  // SET 5, C
  {
    id: 0xcbe9,
    run: (cpu) => {
      const c = cpu.registers.c;
      SET(cpu, c, 5);
    },
    cycles: 2
  },

  // SET 5, D
  {
    id: 0xcbea,
    run: (cpu) => {
      const d = cpu.registers.d;
      SET(cpu, d, 5);
    },
    cycles: 2
  },

  // SET 5, E
  {
    id: 0xcbeb,
    run: (cpu) => {
      const e = cpu.registers.e;
      SET(cpu, e, 5);
    },
    cycles: 2
  },

  // SET 5, H
  {
    id: 0xcbec,
    run: (cpu) => {
      const h = cpu.registers.h;
      SET(cpu, h, 5);
    },
    cycles: 2
  },

  // SET 5, L
  {
    id: 0xcbed,
    run: (cpu) => {
      const l = cpu.registers.l;
      SET(cpu, l, 5);
    },
    cycles: 2
  },

  // SET 5, (HL)
  {
    id: 0xcbee,
    run: (cpu) => {
      withHL(cpu, SET, 5);
    },
    cycles: 4
  },

  // SET 5, A
  {
    id: 0xcbef,
    run: (cpu) => {
      const a = cpu.registers.a;
      SET(cpu, a, 5);
    },
    cycles: 2
  },

  // SET 6, B
  {
    id: 0xcbf0,
    run: (cpu) => {
      const b = cpu.registers.b;
      SET(cpu, b, 6);
    },
    cycles: 2
  },

  // SET 6, C
  {
    id: 0xcbf1,
    run: (cpu) => {
      const c = cpu.registers.c;
      SET(cpu, c, 6);
    },
    cycles: 2
  },

  // SET 6, D
  {
    id: 0xcbf2,
    run: (cpu) => {
      const d = cpu.registers.d;
      SET(cpu, d, 6);
    },
    cycles: 2
  },

  // SET 6, E
  {
    id: 0xcbf3,
    run: (cpu) => {
      const e = cpu.registers.e;
      SET(cpu, e, 6);
    },
    cycles: 2
  },

  // SET 6, H
  {
    id: 0xcbf4,
    run: (cpu) => {
      const h = cpu.registers.h;
      SET(cpu, h, 6);
    },
    cycles: 2
  },

  // SET 6, L
  {
    id: 0xcbf5,
    run: (cpu) => {
      const l = cpu.registers.l;
      SET(cpu, l, 6);
    },
    cycles: 2
  },

  // SET 6, (HL)
  {
    id: 0xcbf6,
    run: (cpu) => {
      withHL(cpu, SET, 6);
    },
    cycles: 4
  },

  // SET 6, A
  {
    id: 0xcbf7,
    run: (cpu) => {
      const a = cpu.registers.a;
      SET(cpu, a, 6);
    },
    cycles: 2
  },

  // SET 7, B
  {
    id: 0xcbf8,
    run: (cpu) => {
      const b = cpu.registers.b;
      SET(cpu, b, 7);
    },
    cycles: 2
  },

  // SET 7, C
  {
    id: 0xcbf9,
    run: (cpu) => {
      const c = cpu.registers.c;
      SET(cpu, c, 7);
    },
    cycles: 2
  },

  // SET 7, D
  {
    id: 0xcbfa,
    run: (cpu) => {
      const d = cpu.registers.d;
      SET(cpu, d, 7);
    },
    cycles: 2
  },

  // SET 7, E
  {
    id: 0xcbfb,
    run: (cpu) => {
      const e = cpu.registers.e;
      SET(cpu, e, 7);
    },
    cycles: 2
  },

  // SET 7, H
  {
    id: 0xcbfc,
    run: (cpu) => {
      const h = cpu.registers.h;
      SET(cpu, h, 7);
    },
    cycles: 2
  },

  // SET 7, L
  {
    id: 0xcbfd,
    run: (cpu) => {
      const l = cpu.registers.l;
      SET(cpu, l, 7);
    },
    cycles: 2
  },

  // SET 7, (HL)
  {
    id: 0xcbfe,
    run: (cpu) => {
      withHL(cpu, SET, 7);
    },
    cycles: 4
  },

  // SET 7, A
  {
    id: 0xcbff,
    run: (cpu) => {
      const a = cpu.registers.a;
      SET(cpu, a, 7);
    },
    cycles: 2
  }
];
