import { Register8Bit, Register16Bit } from "./Register";
import FlagsRegister from "./FlagsRegister";
import Stack from "./Stack";
import instructions from "./instructions";
import addressingModes from "./addressingModes";
import defineOperations from "../lib/cpu/defineOperations";
import byte from "../lib/byte";

export default class CPU {
  constructor(cpuMemory) {
    this.memory = cpuMemory;
    this.cycle = 0;
    this.extraCycles = 0;

    this.a = new Register8Bit();
    this.x = new Register8Bit();
    this.y = new Register8Bit();
    this.sp = new Register8Bit();
    this.pc = new Register16Bit();

    this.flags = new FlagsRegister();
    this.stack = new Stack(this.memory, this.sp);
    this.operations = defineOperations(instructions, addressingModes);
  }

  step() {
    const originalPC = this.pc.getValue();

    const operation = this._fetchOperation();
    const input = this._fetchInput(operation);
    const argument = this._fetchArgument(operation, input);

    if (this.logger != null) {
      this.logger(this, originalPC, operation, input, argument);
    }

    operation.instruction.run(this, argument);
    return this._addCycles(operation);
  }

  interrupt(interrupt, withBFlag) {
    if (interrupt.id === "IRQ" && this.flags.i) return 0;

    this.stack.push16(this.pc.getValue());
    this.stack.push(this.flags.getValue() | (withBFlag && 0b00010000));

    this.cycle += 7;

    this.flags.i = true;
    this.pc.setValue(this._read16(interrupt.vector));

    return 7;
  }

  _fetchOperation() {
    const opcode = this.memory.read(this.pc.getValue());
    const operation = this.operations[opcode];
    if (operation == null)
      throw new Error("Invalid opcode: 0x" + opcode.toString(16));
    this.pc.increment();

    return operation;
  }

  _fetchInput(operation) {
    let input = null;
    if (operation.addressingMode.inputSize === 1) {
      input = this.memory.read(this.pc.getValue());
      this.pc.increment();
    } else if (operation.addressingMode.inputSize === 2) {
      input = this._read16(this.pc.getValue());
      this.pc.increment();
      this.pc.increment();
    }

    return input;
  }

  _fetchArgument(operation, input) {
    const arg =
      operation.instruction.argument === "value"
        ? operation.addressingMode.getValue(
            this,
            input,
            operation.hasPageCrossPenalty
          )
        : operation.addressingMode.getAddress(
            this,
            input,
            operation.hasPageCrossPenalty
          );

    return arg;
  }

  _addCycles(operation) {
    const cycles = operation.cycles + this.extraCycles;
    this.cycle += cycles;
    this.extraCycles = 0;

    return cycles;
  }

  _read16(address) {
    return byte.buildU16(
      this.memory.read(address + 1),
      this.memory.read(address)
    );
  }
}
