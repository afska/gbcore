import byte from "../lib/byte";

const ADD_TO = (targetRegisterName) => {
  return (sourceRegisterName) => {
    return (cpu) => {
      const target = cpu.registers[targetRegisterName];
      const source = cpu.registers[sourceRegisterName];

      const currentValue = target.getValue();
      const valueToAdd = source.getValue();
      target.setValue(currentValue + valueToAdd);
      const newValue = target.getValue();

      cpu.registers.flags.zero = newValue == 0;
      cpu.registers.flags.subtraction = false;
      cpu.registers.flags.carry = currentValue + valueToAdd > 0xff;
      cpu.registers.flags.halfCarry =
        byte.lowNybbleOf(currentValue) + byte.lowNybbleOf(valueToAdd) > 0b1111;
    };
  };
};

const ADD = ADD_TO("a");
const ADDHL = ADD_TO("hl");

export default { ADD };
