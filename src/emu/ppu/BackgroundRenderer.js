import Tile from "./Tile";
import byte from "../lib/byte";

const SCREEN_WIDTH = 256;
const SCREEN_HEIGHT = 240;
const TILE_SIZE_PIXELS = 8;
const TILES_PER_ROW = SCREEN_WIDTH / TILE_SIZE_PIXELS;
const MEM_NAME_TABLES = 0x2000;
const NAME_TABLE_SIZE_BYTES = 1024;
const ATTRIBUTE_TABLE_SIZE_BYTES = 64;
const ATTRIBUTE_TABLE_BLOCK_SIZE = 32;
const ATTRIBUTE_TABLE_REGION_SIZE = 16;
const ATTRIBUTE_TABLE_TOTAL_BLOCKS_X =
  SCREEN_WIDTH / ATTRIBUTE_TABLE_BLOCK_SIZE;
const ATTRIBUTE_TABLE_TOTAL_REGIONS_X =
  ATTRIBUTE_TABLE_BLOCK_SIZE / ATTRIBUTE_TABLE_REGION_SIZE;
const ATTRIBUTE_TABLE_REGION_SIZE_BITS = 2;

function xxx(time, period, radius) {
  return radius + Math.round(radius * Math.cos((2 * Math.PI * time) / period));
}

function yyy(time, period, radius) {
  return radius + Math.round(radius * Math.sin((2 * Math.PI * time) / period));
}

const PERIOD = 60;
const RADIUS = 6;

export default class BackgroundRenderer {
  constructor(ppu) {
    this.ppu = ppu;
  }

  renderScanline() {
    const y = this.ppu.scanline;
    const scrolledY = this.ppu.loopy.scrolledY();
    const backgroundColor = this.ppu.getColor(0, 0);

    for (let x = 0; x < SCREEN_WIDTH; x++) {
      const shouldSkip =
        !this.ppu.registers.ppuMask.showBackground ||
        (!this.ppu.registers.ppuMask.showBackgroundInFirst8Pixels && x < 8);
      if (shouldSkip) {
        this.ppu.plotBG(x, y, backgroundColor, 0);
        continue;
      }

      const scrolledX = this.ppu.loopy.scrolledX(x);
      const nameTableId = this.ppu.loopy.nameTableId(scrolledX);
      const nameTableX = scrolledX % SCREEN_WIDTH;
      const nameTableY = scrolledY % SCREEN_HEIGHT;
      const tileX = Math.floor(nameTableX / TILE_SIZE_PIXELS);
      const tileY = Math.floor(nameTableY / TILE_SIZE_PIXELS);
      const tileIndex = tileY * TILES_PER_ROW + tileX;
      const tileId = this.ppu.memory.read(
        MEM_NAME_TABLES + nameTableId * NAME_TABLE_SIZE_BYTES + tileIndex
      );
      const paletteId = this._getBackgroundPaletteId(
        nameTableId,
        nameTableX,
        nameTableY
      );

      const paletteColors = this.ppu.getPaletteColors(paletteId);
      const patternTableId = this.ppu.registers.ppuCtrl
        .backgroundPatternTableId;
      const tileStartX = nameTableX % TILE_SIZE_PIXELS;
      const tileInsideY = nameTableY % TILE_SIZE_PIXELS;

      const tile = new Tile(this.ppu, patternTableId, tileId, tileInsideY);
      const tilePixels = Math.min(
        TILE_SIZE_PIXELS - tileStartX,
        SCREEN_WIDTH - nameTableX
      );

      for (let xx = 0; xx < tilePixels; xx++) {
        const colorIndex = tile.getColorIndex(tileStartX + xx);
        const color =
          colorIndex > 0 ? paletteColors[colorIndex] : backgroundColor;
        this.ppu.plotBG(x + xx, y, color, colorIndex);
      }

      x += tilePixels - 1;
    }
  }

  _getBackgroundPaletteId(nameTableId, x, y) {
    const startAddress =
      MEM_NAME_TABLES +
      (nameTableId + 1) * NAME_TABLE_SIZE_BYTES -
      ATTRIBUTE_TABLE_SIZE_BYTES;

    const blockX = Math.floor(x / ATTRIBUTE_TABLE_BLOCK_SIZE);
    const blockY = Math.floor(y / ATTRIBUTE_TABLE_BLOCK_SIZE);
    const blockIndex = blockY * ATTRIBUTE_TABLE_TOTAL_BLOCKS_X + blockX;

    const regionX = Math.floor(
      (x % ATTRIBUTE_TABLE_BLOCK_SIZE) / ATTRIBUTE_TABLE_REGION_SIZE
    );
    const regionY = Math.floor(
      (y % ATTRIBUTE_TABLE_BLOCK_SIZE) / ATTRIBUTE_TABLE_REGION_SIZE
    );
    const regionIndex = regionY * ATTRIBUTE_TABLE_TOTAL_REGIONS_X + regionX;

    const block = this.ppu.memory.read(startAddress + blockIndex);

    return byte.getBits(
      block,
      regionIndex * ATTRIBUTE_TABLE_REGION_SIZE_BITS,
      ATTRIBUTE_TABLE_REGION_SIZE_BITS
    );
  }
}
