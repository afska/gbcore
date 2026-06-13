import interrupts from "../interrupts";
import IORegisterSegment from "../lib/IORegisterSegment";
import byte from "../lib/byte";
import DIV from "./DIV";
import TAC from "./TAC";
import TIMA from "./TIMA";
import TMA from "./TMA";

const CPU_FREQ_MCYCLES = 1048576;
const DIV_INCREMENT_INTERVAL = CPU_FREQ_MCYCLES / 16384;

/**
 * A built-in timer in the Game Boy.
 */
export default class Timer extends IORegisterSegment {
  constructor(cpu) {
    super();

    this.cpu = cpu;

    this.div = new DIV(this);
    this.tima = new TIMA(this);
    this.tma = new TMA(this);
    this.tac = new TAC(this);

    this._divCycleCount = 0;
    this._timaCycleCount = 0;
  }

  advance(mCycles) {
    this._incrementDiv(mCycles);
    this._incrementTima(mCycles);
  }

  resetDivPhase() {
    this._divCycleCount = 0;
  }

  getSaveState() {
    return {
      div: this.div.getSaveState(),
      tima: this.tima.getSaveState(),
      tma: this.tma.getSaveState(),
      tac: this.tac.getSaveState(),
      divCycleCount: this._divCycleCount,
      timaCycleCount: this._timaCycleCount
    };
  }

  setSaveState(saveState) {
    this.div.setSaveState(saveState.div);
    this.tima.setSaveState(saveState.tima);
    this.tma.setSaveState(saveState.tma);
    this.tac.setSaveState(saveState.tac);
    this._divCycleCount = saveState.divCycleCount;
    this._timaCycleCount = saveState.timaCycleCount;
  }

  _incrementDiv(mCycles) {
    this._divCycleCount += mCycles;

    const increments = Math.floor(this._divCycleCount / DIV_INCREMENT_INTERVAL);
    this._divCycleCount %= DIV_INCREMENT_INTERVAL;

    this.div.set(byte.toU8(this.div.value + increments));
  }

  _incrementTima(mCycles) {
    if (!this.tac.enable) return;

    this._timaCycleCount += mCycles;

    const interval = this.tac.incrementInterval;
    const increments = Math.floor(this._timaCycleCount / interval);
    this._timaCycleCount %= interval;

    for (let i = 0; i < increments; i++) {
      if (this.tima.value === 0xff) {
        this.tima.setValue(this.tma.value);
        this.cpu.requestInterrupt(interrupts.TIMER);
      } else {
        this.tima.setValue(this.tima.value + 1);
      }
    }
  }

  _getRegister(address) {
    switch (address) {
      case 0xff04:
        return this.div;
      case 0xff05:
        return this.tima;
      case 0xff06:
        return this.tma;
      case 0xff07:
        return this.tac;
      default:
    }
  }
}
