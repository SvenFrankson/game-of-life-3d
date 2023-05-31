class Prop extends BABYLON.Mesh {

    private static _Ident: number = 0;
    public static MakeNewIdent(): number {
        Prop._Ident++;
        return Prop._Ident;
    }

    private _ident: number;
    public get ident(): number {
        return this._ident;
    }

    public get modelName(): string {
        return this._modelName;
    }

    public get scene(): BABYLON.Scene {
        return this.getScene();
    }

    constructor(private _modelName: string) {
        super("");
        this._ident = Prop.MakeNewIdent();
        this.name = this._modelName + "-" + this._ident.toFixed(0);
    }

    private _instantiated = false;
    public async instantiate(): Promise<void> {
        return new Promise<void>(resolve => {
            BABYLON.SceneLoader.ImportMesh("", "datas/meshes/" + this._modelName + ".babylon", "", this.scene, (meshes) => {
                meshes.forEach(mesh => {
                    if (mesh instanceof BABYLON.Mesh) {
                        let material = mesh.material;
                        if (material instanceof BABYLON.MultiMaterial) {
                            for (let i = 0; i < material.subMaterials.length; i++) {
                                let subMat = material.subMaterials[i];
                                if (subMat instanceof BABYLON.PBRMaterial) {
                                    let toonMat = new ToonMaterial(subMat.name + "-3-toon", this.scene);
                                    toonMat.setColor(subMat.albedoColor);
                                    material.subMaterials[i] = toonMat;
                                }
                            }
                        }
                        mesh.parent = this;
                    }
                });
                this._instantiated = true;
                resolve();
            });
        });
    }

    public async setModelName(modelName: string): Promise<void> {
        this._modelName = modelName;
        this.name = this._modelName + "-" + this._ident.toFixed(0);
        if (this._instantiated) {
            this.getChildMeshes().forEach(m => {
                m.dispose();
            })
            await this.instantiate();
        }
    }
}