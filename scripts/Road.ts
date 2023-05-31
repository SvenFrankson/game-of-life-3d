class Road {

    private static _Ident: number = 0;
    public static MakeNewIdent(): number {
        Road._Ident++;
        return Road._Ident;
    }

    private _ident: number;
    public get ident(): number {
        return this._ident;
    }

    private _modelName: string = "";
    public get modelName(): string {
        return this._modelName;
    }

    public mesh: BABYLON.Mesh;

    constructor(public i: number, public j: number, public r: number, public roadManager: RoadManager, public scene: BABYLON.Scene, modelName: string = "none") {
        this._ident = Road.MakeNewIdent();
        this._modelName = modelName;
    }

    private _instantiated = false;
    public instantiate(): void {
        if (this.mesh) {
            this.mesh.dispose();
        }

        if (this._modelName === "none") {
            this.mesh = BABYLON.MeshBuilder.CreateBox("empty-road", { width: 9.5, height: 0.2, depth: 9.5 });
        }
        else {
            let baseMesh = this.roadManager.roadMeshes.get(this._modelName);
            if (baseMesh) {
                this.mesh = baseMesh.clone(this._modelName + "-" + this._ident.toFixed(0));
            }
        }
        this.mesh.position.x = this.i * 10;
        this.mesh.position.y = 0;
        this.mesh.position.z = this.j * 10;
        this.mesh.rotation.y = Math.PI / 2 * this.r;

        this._instantiated = true;
    }

    public setModelName(modelName: string): void {
        this._modelName = modelName;
        if (this._instantiated) {
            this.mesh.dispose();
            this.instantiate();
        }
    }
}