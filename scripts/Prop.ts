interface ISelectableItem {

    dir: number;
    
    animateDir: (dir: number, duration: number) => Promise<void>;
}

class Prop extends BABYLON.Mesh implements ISelectableItem {

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

    public animatePos = AnimationFactory.EmptyVector3Callback;
    private _dir: number = 0;
    public get dir(): number {
        return this._dir;
    }
    public set dir(v: number) {
        this._dir = v;
        this.rotation.y = Math.PI / 2 * this.dir;
    }
    public animateDir = AnimationFactory.EmptyNumberCallback;

    public get scene(): BABYLON.Scene {
        return this.getScene();
    }

    public static Create(modelName: string, level: Level): Prop {
        if (modelName.startsWith("building")) {
            return new Building(modelName, level);
        }
        else {
            return new Prop(modelName, level);
        }
    }

    constructor(protected _modelName: string, public level: Level) {
        super("");
        this._ident = Prop.MakeNewIdent();
        this.name = this._modelName + "-" + this._ident.toFixed(0);
        this.level.props.push(this);

        this.animateDir = AnimationFactory.CreateNumber(this, this, "dir");
        this.animatePos = AnimationFactory.CreateVector3(this, this, "position");
    }

    public dispose(): void {
        this.level.props.remove(this);
        super.dispose();
    }

    protected _instantiated = false;
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
                                    toonMat.setDiffuseColor(subMat.albedoColor);
                                    material.subMaterials[i] = toonMat;
                                }
                            }
                        }
                        if (!mesh.parent) {
                            mesh.parent = this;
                        }
                    }
                });
                this._instantiated = true;
                resolve();
            });
        });
    }

    public highlight(): void {
        this.getChildMeshes().forEach(mesh => {
            mesh.renderOutline = true;
            mesh.outlineWidth = 0.1;
            mesh.outlineColor.copyFromFloats(0, 1, 1);
        })
    }

    public unlit(): void {
        this.getChildMeshes().forEach(mesh => {
            mesh.renderOutline = false;
        })
    }

    public setIsVisible(isVisible: boolean): void {
        this.isVisible = isVisible;
        this.getChildMeshes().forEach(mesh => {
            mesh.isVisible = isVisible;
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