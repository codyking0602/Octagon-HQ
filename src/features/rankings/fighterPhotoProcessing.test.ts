import { describe, expect, it } from "vitest";
import { blackCompositeEdgeBackground } from "./fighterPhotoProcessing";

function image(width: number, height: number, pixels: number[][]) {
  return {
    width,
    height,
    data: new Uint8ClampedArray(pixels.flat()),
  };
}

function pixel(data: Uint8ClampedArray, index: number) {
  return Array.from(data.slice(index * 4, index * 4 + 4));
}

describe("blackCompositeEdgeBackground", () => {
  it("turns edge-connected navy background pixels true black", () => {
    const source = image(3, 3, [
      [8, 15, 42, 255], [8, 15, 42, 255], [8, 15, 42, 255],
      [8, 15, 42, 255], [210, 150, 110, 255], [8, 15, 42, 255],
      [8, 15, 42, 255], [8, 15, 42, 255], [8, 15, 42, 255],
    ]);

    blackCompositeEdgeBackground(source);

    expect(pixel(source.data, 0)).toEqual([0, 0, 0, 255]);
    expect(pixel(source.data, 4)).toEqual([210, 150, 110, 255]);
    expect(pixel(source.data, 8)).toEqual([0, 0, 0, 255]);
  });

  it("does not recolor a dark-blue detail enclosed inside the fighter", () => {
    const source = image(5, 5, Array.from({ length: 25 }, (_, index) => {
      const x = index % 5;
      const y = Math.floor(index / 5);
      if (x === 0 || x === 4 || y === 0 || y === 4) return [5, 12, 36, 255];
      if (x === 2 && y === 2) return [12, 22, 58, 255];
      return [190, 120, 90, 255];
    }));

    blackCompositeEdgeBackground(source);

    expect(pixel(source.data, 0)).toEqual([0, 0, 0, 255]);
    expect(pixel(source.data, 12)).toEqual([12, 22, 58, 255]);
  });

  it("composites transparent edge pixels onto black", () => {
    const source = image(2, 1, [
      [20, 30, 50, 0],
      [180, 110, 80, 255],
    ]);

    blackCompositeEdgeBackground(source);

    expect(pixel(source.data, 0)).toEqual([0, 0, 0, 255]);
    expect(pixel(source.data, 1)).toEqual([180, 110, 80, 255]);
  });
});
