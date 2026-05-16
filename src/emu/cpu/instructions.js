import byte from "../lib/byte";
import interrupts from "../lib/cpu/interrupts";

const ADC = function(cpu, val) {
  // Adds the contents of <val> to [A] together with the Carry Flag
  // ([A] = [A] + <val> + C), updating the Z and N flags.
  const oldValue = cpu.a.getValue();
  const result = oldValue + val + cpu.flags.c;
  const newValue = byte.toU8(result);
  cpu.a.setValue(newValue);
  cpu.flags.updateZeroAndNegative(newValue);

  // C and V flags are set in case of unsigned and signed overflow respectively.
  // Unsigned overflow occurs when the result is >= `256` (use `byte.overflows(...)`)
  // Signed overflow occurs when `Positive + Positive = Negative` or `Negative + Negative = Positive`
  cpu.flags.c = byte.overflows(result);
  cpu.flags.v =
    (byte.isPositive(oldValue) &&
      byte.isPositive(val) &&
      byte.isNegative(newValue)) ||
    (byte.isNegative(oldValue) &&
      byte.isNegative(val) &&
      byte.isPositive(newValue));
};

const SE_ = (flagName) => {
  return (cpu) => {
    cpu.flags[flagName] = true;
  };
};

const CL_ = (flagName) => {
  return (cpu) => {
    cpu.flags[flagName] = false;
  };
};

const LD_ = (registerName) => {
  return (cpu, value) => {
    cpu[registerName].setValue(value);
    cpu.flags.updateZeroAndNegative(value);
  };
};

const ST_ = (registerName) => {
  return (cpu, address) => {
    const value = cpu[registerName].getValue();
    cpu.memory.write(address, value);
  };
};

const T__ = (sourceRegister, targetRegister, updateFlags = true) => {
  return (cpu) => {
    const value = cpu[sourceRegister].getValue();
    cpu[targetRegister].setValue(value);
    if (updateFlags) cpu.flags.updateZeroAndNegative(value);
  };
};

const CP_ = (registerName) => {
  return (cpu, value) => {
    const source = cpu[registerName].getValue();
    cpu.flags.z = source === value;
    cpu.flags.updateNegative(byte.toU8(source - value));
    cpu.flags.c = source >= value;
  };
};

const LOGICAL_INSTRUCTION = (operator) => {
  return (cpu, value) => {
    const result = operator(cpu.a.getValue(), value);
    cpu.a.setValue(result);
    cpu.flags.updateZeroAndNegative(result);
  };
};

const B__ = (flag, value) => {
  return (cpu, address) => {
    if (cpu.flags[flag] === value) {
      cpu.pc.setValue(address);
      cpu.extraCycles++;
    } else {
      cpu.extraCycles = 0;
    }
  };
};

const instructions = {
  // ----------
  // ARITHMETIC
  // ----------

  // Add with Carry
  ADC: {
    argument: "value",
    run: ADC
  },

  ASL: {
    argument: "address",
    run(cpu, address) {
      const value = cpu.memory.read(address);
      const result = value << 1;
      const newValue = byte.toU8(result);

      cpu.memory.write(address, newValue);
      cpu.flags.updateZeroAndNegative(newValue);
      cpu.flags.c = byte.getFlag(value, 7);
    }
  },

  ASLa: {
    argument: "no",
    run(cpu) {
      const value = cpu.a.getValue();
      const result = value << 1;
      const newValue = byte.toU8(result);

      cpu.a.setValue(newValue);
      cpu.flags.updateZeroAndNegative(newValue);
      cpu.flags.c = byte.getFlag(value, 7);
    }
  },

  DEC: {
    argument: "address",
    run(cpu, address) {
      const value = cpu.memory.read(address);
      const newValue = byte.toU8(value - 1);

      cpu.flags.updateZeroAndNegative(newValue);
      cpu.memory.write(address, newValue);
    }
  },

  DEX: {
    argument: "no",
    run(cpu) {
      const register = cpu.x;
      register.decrement();
      cpu.flags.updateZeroAndNegative(register.getValue());
    }
  },

  DEY: {
    argument: "no",
    run(cpu) {
      const register = cpu.y;
      register.decrement();
      cpu.flags.updateZeroAndNegative(register.getValue());
    }
  },

  // Increment Memory
  INC: {
    argument: "address",
    run(cpu, addr) {
      // Adds one to the value held at <addr>, updating the Z and N flags.
      const value = cpu.memory.read(addr);
      const newValue = byte.toU8(value + 1);
      cpu.memory.write(addr, newValue);
      cpu.flags.updateZeroAndNegative(newValue);
    }
  },

  // Increment X Register
  INX: {
    argument: "no",
    run(cpu) {
      // Increments [X], updating the Z and N flags.
      cpu.x.increment();
      cpu.flags.updateZeroAndNegative(cpu.x.getValue());
    }
  },

  INY: {
    argument: "no",
    run(cpu) {
      cpu.y.increment();
      cpu.flags.updateZeroAndNegative(cpu.y.getValue());
    }
  },

  LSR: {
    argument: "address",
    run(cpu, address) {
      const value = cpu.memory.read(address);
      const result = value >> 1;
      const newValue = byte.toU8(result);

      cpu.memory.write(address, newValue);
      cpu.flags.updateZeroAndNegative(newValue);
      cpu.flags.c = byte.getFlag(value, 0);
    }
  },

  LSRa: {
    argument: "no",
    run(cpu) {
      const value = cpu.a.getValue();
      const result = value >> 1;
      const newValue = byte.toU8(result);

      cpu.a.setValue(newValue);
      cpu.flags.updateZeroAndNegative(newValue);
      cpu.flags.c = byte.getFlag(value, 0);
    }
  },

  ROL: {
    argument: "address",
    run(cpu, address) {
      const value = cpu.memory.read(address);
      const result = (value << 1) | +cpu.flags.c;
      const newValue = byte.toU8(result);

      cpu.memory.write(address, newValue);
      cpu.flags.updateZeroAndNegative(newValue);
      cpu.flags.c = byte.getFlag(value, 7);
    }
  },

  ROLa: {
    argument: "no",
    run(cpu) {
      const value = cpu.a.getValue();
      const result = (value << 1) | +cpu.flags.c;
      const newValue = byte.toU8(result);

      cpu.a.setValue(newValue);
      cpu.flags.updateZeroAndNegative(newValue);
      cpu.flags.c = byte.getFlag(value, 7);
    }
  },

  ROR: {
    argument: "address",
    run(cpu, address) {
      const value = cpu.memory.read(address);
      const result = (value >> 1) | (+cpu.flags.c << 7);
      const newValue = byte.toU8(result);

      cpu.memory.write(address, newValue);
      cpu.flags.updateZeroAndNegative(newValue);
      cpu.flags.c = byte.getFlag(value, 0);
    }
  },

  RORa: {
    argument: "no",
    run(cpu) {
      const value = cpu.a.getValue();
      const result = (value >> 1) | (+cpu.flags.c << 7);
      const newValue = byte.toU8(result);

      cpu.a.setValue(newValue);
      cpu.flags.updateZeroAndNegative(newValue);
      cpu.flags.c = byte.getFlag(value, 0);
    }
  },

  SBC: {
    argument: "value",
    run(cpu, value) {
      return ADC(cpu, 255 - value);
    }
  },

  // ----
  // DATA
  // ----

  CLC: {
    argument: "no",
    run: CL_("c")
  },

  CLD: {
    argument: "no",
    run: CL_("d")
  },

  CLI: {
    argument: "no",
    run: CL_("i")
  },

  CLV: {
    argument: "no",
    run: CL_("v")
  },

  LDA: {
    argument: "value",
    run: LD_("a")
  },

  LDX: {
    argument: "value",
    run: LD_("x")
  },

  LDY: {
    argument: "value",
    run: LD_("y")
  },

  PHA: {
    argument: "no",
    run(cpu) {
      cpu.stack.push(cpu.a.getValue());
    }
  },

  PHP: {
    argument: "no",
    run(cpu) {
      cpu.stack.push(cpu.flags.getValue() | 0b00010000);
    }
  },

  PLA: {
    argument: "no",
    run(cpu) {
      const value = cpu.stack.pop();
      cpu.a.setValue(value);
      cpu.flags.updateZeroAndNegative(value);
    }
  },

  PLP: {
    argument: "no",
    run(cpu) {
      cpu.flags.setValue(cpu.stack.pop());
    }
  },

  SEC: {
    argument: "no",
    run: SE_("c")
  },

  SED: {
    argument: "no",
    run: SE_("d")
  },

  SEI: {
    argument: "no",
    run: SE_("i")
  },

  STA: {
    argument: "address",
    run: ST_("a")
  },

  STX: {
    argument: "address",
    run: ST_("x")
  },

  STY: {
    argument: "address",
    run: ST_("y")
  },

  TAX: {
    argument: "no",
    run: T__("a", "x")
  },

  TAY: {
    argument: "no",
    run: T__("a", "y")
  },

  TSX: {
    argument: "no",
    run: T__("sp", "x")
  },

  TXA: {
    argument: "no",
    run: T__("x", "a")
  },

  TXS: {
    argument: "no",
    run: T__("x", "sp", false)
  },

  TYA: {
    argument: "no",
    run: T__("y", "a")
  },

  // ------
  // CHECKS
  // ------

  BIT: {
    argument: "value",
    run(cpu, value) {
      const mask = cpu.a.getValue();
      const result = value & mask;

      cpu.flags.updateZero(result);
      cpu.flags.updateNegative(value);
      cpu.flags.v = byte.getFlag(value, 6);
    }
  },

  CMP: {
    argument: "value",
    run: CP_("a")
  },

  CPX: {
    argument: "value",
    run: CP_("x")
  },

  CPY: {
    argument: "value",
    run: CP_("y")
  },

  AND: {
    argument: "value",
    run: LOGICAL_INSTRUCTION((one, another) => one & another)
  },

  EOR: {
    argument: "value",
    run: LOGICAL_INSTRUCTION((one, another) => one ^ another)
  },

  ORA: {
    argument: "value",
    run: LOGICAL_INSTRUCTION((one, another) => one | another)
  },

  // ---------
  // BRANCHING
  // ---------

  BCC: {
    argument: "address",
    run: B__("c", false)
  },

  BCS: {
    argument: "address",
    run: B__("c", true)
  },

  BEQ: {
    argument: "address",
    run: B__("z", true)
  },

  BMI: {
    argument: "address",
    run: B__("n", true)
  },

  BNE: {
    argument: "address",
    run: B__("z", false)
  },

  BPL: {
    argument: "address",
    run: B__("n", false)
  },

  BVC: {
    argument: "address",
    run: B__("v", false)
  },

  BVS: {
    argument: "address",
    run: B__("v", true)
  },

  JMP: {
    argument: "address",
    run(cpu, address) {
      cpu.pc.setValue(address);
    }
  },

  JSR: {
    argument: "address",
    run(cpu, address) {
      cpu.stack.push16(cpu.pc.getValue() - 1);
      cpu.pc.setValue(address);
    }
  },

  RTI: {
    argument: "no",
    run(cpu) {
      cpu.flags.setValue(cpu.stack.pop());
      cpu.pc.setValue(cpu.stack.pop16());
    }
  },

  RTS: {
    argument: "no",
    run(cpu) {
      cpu.pc.setValue(cpu.stack.pop16() + 1);
    }
  },

  // ------
  // SYSTEM
  // ------

  BRK: {
    argument: "no",
    run(cpu) {
      cpu.pc.increment();
      cpu.interrupt(interrupts.BRK, true);
    }
  },

  NOP: {
    argument: "no",
    run() {}
  }
};

for (let key in instructions) {
  instructions[key].id = key;
}

export default instructions;
