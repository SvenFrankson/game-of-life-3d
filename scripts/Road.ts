class Road {

    private static _Ident: number = 0;
    public static MakeNewIdent(): number {
        Road._Ident++;
        return Road._Ident;
    }

    public get dir(): number {
        return this._r;
    }
    public set dir(v: number) {
        this._r = v;
        if (this.mesh) {
            this.mesh.rotation.y = Math.PI / 2 * this.dir;
        }
    }

    private _ident: number;
    public get ident(): number {
        return this._ident;
    }

    private _roadType: RoadType = RoadType.Empty;
    public get roadType(): RoadType {
        return this._roadType;
    }

    public mesh: BABYLON.Mesh;

    constructor(public i: number, public j: number, private _r: number, public roadManager: RoadMeshManager, public scene: BABYLON.Scene, modelName: RoadType = RoadType.Empty) {
        this._ident = Road.MakeNewIdent();
        this._roadType = modelName;
    }

    private _instantiated = false;
    public instantiate(): void {
        if (this.mesh) {
            this.mesh.dispose();
        }

        let baseMesh = this.roadManager.roadMeshes.get(RoadsData.List[this._roadType]);
        if (baseMesh) {
            this.mesh = baseMesh.clone(this._roadType + "-" + this._ident.toFixed(0));
        }
        else {
            this.mesh = BABYLON.MeshBuilder.CreateBox("empty-road", { width: 9.5, height: 0.2, depth: 9.5 });
        }

        this.mesh.position.x = this.i * 10;
        this.mesh.position.y = 0;
        this.mesh.position.z = this.j * 10;
        this.mesh.rotation.y = Math.PI / 2 * this.dir;

        this._instantiated = true;
    }

    public setRoadType(modelName: RoadType): void {
        this._roadType = modelName;
        if (this._instantiated) {
            this.mesh.dispose();
            this.instantiate();
        }
    }
}