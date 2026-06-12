import MBC1 from "./MBC1";
import MBC2 from "./MBC2";
import NoMBC from "./NoMBC";

export default [
  { id: 0x00, name: "ROM ONLY", MBC: NoMBC() },
  { id: 0x01, name: "MBC1", MBC: MBC1() },
  { id: 0x02, name: "MBC1+RAM", MBC: MBC1({ ram: true }) },
  { id: 0x03, name: "MBC1+RAM+BATTERY", MBC: MBC1({ ram: true, batt: true }) },
  { id: 0x05, name: "MBC2", MBC: MBC2() },
  { id: 0x06, name: "MBC2+BATTERY", MBC: MBC2({ batt: true }) },
  { id: 0x08, name: "ROM+RAM", MBC: NoMBC({ ram: true }) },
  { id: 0x09, name: "ROM+RAM+BATTERY", MBC: NoMBC({ ram: true, batt: true }) },
  { id: 0x0b, name: "MMM01", MBC: null },
  { id: 0x0c, name: "MMM01+RAM", MBC: null },
  { id: 0x0d, name: "MMM01+RAM+BATTERY", MBC: null },
  { id: 0x0f, name: "MBC3+TIMER+BATTERY", MBC: null },
  { id: 0x10, name: "MBC3+TIMER+RAM+BATTERY", MBC: null },
  { id: 0x11, name: "MBC3", MBC: null },
  { id: 0x12, name: "MBC3+RAM", MBC: null },
  { id: 0x13, name: "MBC3+RAM+BATTERY", MBC: null },
  { id: 0x19, name: "MBC5", MBC: null },
  { id: 0x1a, name: "MBC5+RAM", MBC: null },
  { id: 0x1b, name: "MBC5+RAM+BATTERY", MBC: null },
  { id: 0x1c, name: "MBC5+RUMBLE", MBC: null },
  { id: 0x1d, name: "MBC5+RUMBLE+RAM", MBC: null },
  { id: 0x1e, name: "MBC5+RUMBLE+RAM+BATTERY", MBC: null },
  { id: 0x20, name: "MBC6", MBC: null },
  { id: 0x22, name: "MBC7+SENSOR+RUMBLE+RAM+BATTERY", MBC: null },
  { id: 0xfc, name: "POCKET CAMERA", MBC: null },
  { id: 0xfd, name: "BANDAI TAMA5", MBC: null },
  { id: 0xfe, name: "HuC3", MBC: null },
  { id: 0xff, name: "HuC1+RAM+BATTERY", MBC: null }
];
