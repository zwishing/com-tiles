import { TileMatrix } from "@com-tiles/spec/types/tileMatrix";
import { MBTilesRepository, TileRecord } from "../src/mbTilesRepository";
import TileProvider from "../src/tileProvider";

function range(to: number) {
    return [...Array.from(Array(to).keys())];
}

Array(10).keys();

//TODO: fix test
describe("TileProvider", () => {
    it("should create dense index fragments in row-major order", async () => {
        const numTiles = 4 ** 0 + 4 ** 1 + 4 ** 2;
        const tiles = range(numTiles).map((i) => {
            return { data: new Uint8Array([i]) };
        });
        const tileMatrixSet: TileMatrix[] = [];
        tileMatrixSet.push({
            zoom: 0,
            aggregationCoefficient: -1,
            tileMatrixLimits: {
                minTileCol: 0,
                minTileRow: 0,
                maxTileCol: 0,
                maxTileRow: 0,
            },
        });
        tileMatrixSet.push({
            zoom: 1,
            aggregationCoefficient: -1,
            tileMatrixLimits: {
                minTileCol: 0,
                minTileRow: 0,
                maxTileCol: 1,
                maxTileRow: 1,
            },
        });
        tileMatrixSet.push({
            zoom: 2,
            aggregationCoefficient: 1,
            tileMatrixLimits: {
                minTileCol: 0,
                minTileRow: 0,
                maxTileCol: 3,
                maxTileRow: 3,
            },
        });
        const tileRepository = await MBTilesRepository.create("");
        tileRepository.getTilesByRowMajorOrder = jest.fn(
            (z) =>
                new Promise((resolve) => {
                    const tileBatch = z === 0 ? tiles.splice(0, 1) : tiles.splice(0, 4);
                    resolve(tileBatch as Tile[]);
                }),
        );
        const tileProvider = new TileProvider(tileRepository, tileMatrixSet);

        const actualTiles = tileProvider.getTilesInRowMajorOrderTest();

        for await (const tile of actualTiles) {
            expect(tile).toEqual(tiles.shift());
        }
    });

    it("should create sparse index fragments in row-major order", async () => {
        const numTiles = 4 ** 0 + 4 ** 1 + 4;
        const xyzIndices = [
            { row: 0, column: 0 },
            { row: 0, column: 0 },
            { row: 1, column: 0 },
            { row: 0, column: 1 },
            { row: 1, column: 1 },
            { row: 1, column: 1 },
            { row: 1, column: 2 },
            { row: 2, column: 1 },
            { row: 2, column: 2 },
        ];
        const tiles = range(numTiles).map((i) => {
            return { data: new Uint8Array([i]), ...xyzIndices.shift() };
        });
        const tileMatrixSet: TileMatrix[] = [];
        tileMatrixSet.push({
            zoom: 0,
            aggregationCoefficient: -1,
            tileMatrixLimits: {
                minTileCol: 0,
                minTileRow: 0,
                maxTileCol: 0,
                maxTileRow: 0,
            },
        });
        tileMatrixSet.push({
            zoom: 1,
            aggregationCoefficient: -1,
            tileMatrixLimits: {
                minTileCol: 0,
                minTileRow: 0,
                maxTileCol: 1,
                maxTileRow: 1,
            },
        });
        tileMatrixSet.push({
            zoom: 2,
            aggregationCoefficient: 1,
            tileMatrixLimits: {
                minTileCol: 1,
                minTileRow: 1,
                maxTileCol: 2,
                maxTileRow: 2,
            },
        });
        const tileRepository = await MBTilesRepository.create("");
        tileRepository.getTilesByRowMajorOrder = jest.fn(
            (z) =>
                new Promise((resolve) => {
                    const tileBatch = z !== 1 ? tiles.splice(0, 1) : tiles.splice(0, 4);
                    resolve(tileBatch as Tile[]);
                }),
        );
        const tileProvider = new TileProvider(tileRepository, tileMatrixSet);

        const actualTiles = tileProvider.getTilesInRowMajorOrderTest();

        for await (const tile of actualTiles) {
            expect(tile).toEqual(tiles.shift());
        }
    });
});
