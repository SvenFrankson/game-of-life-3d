class TerrainGrid {

    public debugMesh: BABYLON.Mesh;
    public values: Uint8Array;

    public getValue(i: number, j: number): number {
        return this.values[i + j * this.w];
    }

    public setValue(v: number, i: number, j: number): void {
        this.values[i + j * this.w] = v;
    }

    constructor(public w: number, public d: number) {
        this.values = new Uint8Array(w * d);
        this.reset();
    }

    public reset(): void {
        this.values.fill(1);
    }

    public updateDebugMesh(): void {
        let distGrid = this.makeGridTo(15, 15);
        if (this.debugMesh) {
            this.debugMesh.dispose();
        }
        this.debugMesh = new BABYLON.Mesh("terrain-grid-debug");
        this.debugMesh.isPickable = false;
        //this.debugMesh.visibility = 0.25;
        this.debugMesh.position.y = 0.25;

        let data = new BABYLON.VertexData();
        let positions: number[] = [];
        let indices: number[] = [];
        let colors: number[] = [];

        for (let i = 0; i < this.w; i++) {
            for (let j = 0; j < this.d; j++) {
                let v = distGrid[i + j * this.w];

                let p = positions.length / 3;
                let d1 = 0.0;
                let d2 = 1;
                positions.push(i + d1 - 0.5, 0, j + d1 - 0.5);
                positions.push(i + d2 - 0.5, 0, j + d1 - 0.5);
                positions.push(i + d2 - 0.5, 0, j + d2 - 0.5);
                positions.push(i + d1 - 0.5, 0, j + d2 - 0.5);

                indices.push(p, p + 1, p + 2);
                indices.push(p, p + 2, p + 3);

                let r = 1;
                let g = 0;
                let b = 0.2;
                if (isFinite(v)) {
                    let f = v / 50;
                    r = f;
                    g = f;
                    b = f;
                }

                colors.push(r, g, b, 1);
                colors.push(r, g, b, 1);
                colors.push(r, g, b, 1);
                colors.push(r, g, b, 1);
            }
        }

        data.positions = positions;
        data.indices = indices;
        data.colors = colors;

        data.applyToMesh(this.debugMesh);
    }

    public makeGridTo(iTo: number, jTo: number): number[] {
        let distGrid: number[] = [];

        for (let n = 0; n < this.w * this.d; n++) {
            distGrid[n] = Infinity;
        }

        this.doMakeGrid(0, iTo, jTo, distGrid);

        return distGrid;
    }

    public doMakeGrid(v: number, i: number, j: number, distGrid: number[]): void {
        if (i >= 0 && j >= 0 && i < this.w && j < this.d) {
            if (this.getValue(i, j) > 0) {
                if (v < distGrid[i + j * this.w]) {
                    distGrid[i + j * this.w] = v;
    
                    this.doMakeGrid(v + 1, i + 1, j, distGrid);
                    this.doMakeGrid(v + 1, i, j + 1, distGrid);
                    this.doMakeGrid(v + 1, i - 1, j, distGrid);
                    this.doMakeGrid(v + 1, i, j - 1, distGrid);
                    
                    this.doMakeGrid(v + Math.SQRT2, i + 1, j + 1, distGrid);
                    this.doMakeGrid(v + Math.SQRT2, i - 1, j + 1, distGrid);
                    this.doMakeGrid(v + Math.SQRT2, i - 1, j - 1, distGrid);
                    this.doMakeGrid(v + Math.SQRT2, i + 1, j - 1, distGrid);
                }
            }
        }
    }
}