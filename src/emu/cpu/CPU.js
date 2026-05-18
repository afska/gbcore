import { Register8Bit, Register16Bit, ProgramCounter } from "./Register";
import FlagsRegister from "./FlagsRegister";
import MemoryBus from "../MemoryBus";
import { getOperation } from "./opcodes";

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

    this.ime = 0;
    this.eiCountdown = 0;
    this.halted = false;
  }

  step() {
    let opcode = this.fetchProgramByte();
    const isPrefix = opcode === PREFIX_INSTRUCTION;
    if (isPrefix) opcode = this.fetchProgramByte();

    const operation = getOperation(opcode, isPrefix);
    if (operation == null) throw new Error(`Unknown opcode: ${opcode}`);

    operation.run(this);

    _processPendingEI();
  }

  fetchProgramByte() {
    const value = this.memory.read(this.pc.getValue());
    this.pc.increment();
    return value;
  }

  _processPendingEI() {
    if (this.eiCountdown <= 0) return;

    this.eiCountdown--;
    if (this.eiCountdown === 0) this.ime = 1;
  }
}
