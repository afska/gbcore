import { Register8Bit, Register16Bit, ProgramCounter } from "./Register";
import FlagsRegister from "./FlagsRegister";
import MemoryBus from "../MemoryBus";
import operations from "./operations";
import byte from "../lib/byte";

const PREFIX_INSTRUCTION = 0xcb;

export default class CPU {
  constructor() {
    this.registers = {
      a: new Register8Bit(),
      b: new Register8Bit(),
      c: new Register8Bit(),
      d: new Register8Bit(),
      e: new Register8Bit(),
      f: new Register8Bit(),
      h: new Register8Bit(),
      l: new Register8Bit()
    };

    this.registers.af = new Register16Bit(this.registers.a, this.registers.f);
    this.registers.bc = new Register16Bit(this.registers.b, this.registers.c);
    this.registers.de = new Register16Bit(this.registers.d, this.registers.e);
    this.registers.hl = new Register16Bit(this.registers.h, this.registers.l);

    this.registers.flags = new FlagsRegister();

    this.pc = new ProgramCounter();
    this.memory = new MemoryBus();
  }

  step() {
    let opcode = this.memory.read(this.pc.getValue());
    const isPrefix = opcode === PREFIX_INSTRUCTION;
    if (isPrefix) {
      opcode = this.memory.read(byte.toU16(this.pc.getValue() + 1));
    }

    const operation = operations[opcode];
    if (operation == null) throw new Error(`Unknown opcode: ${opcode}`);

    const size = operation.instruction(this);
    this.pc.setValue(this.pc.getValue() + size);
  }
}
