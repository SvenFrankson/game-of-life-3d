interface ISelectableItem {

    dir: number;
    
    animateDir: (dir: number, duration: number) => Promise<void>;
}

class Prop extends BABYLON.Mesh implements ISelectableItem {

    public bboxMin: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public bboxMax: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public hasObstacle: boolean = true;
    public obstacle: Obstacle;

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
    private _pos2D: BABYLON.Vector2 = BABYLON.Vector2.Zero();
    public get pos2D(): BABYLON.Vector2 {
        this._pos2D.x = this.position.x;
        this._pos2D.y = this.position.z;
        return this._pos2D;
    } 
    public set pos2D(v: BABYLON.Vector2) {
        this.position.x = v.x;
        this.position.z = v.y;
    } 

    private _dir: number = 0;
    public get dir(): number {
        return this._dir;
    }
    public set dir(v: number) {
        this._dir = v;
        this.rotation.y = Math.PI / 2 * this.dir;
    }
    public animateDir = AnimationFactory.EmptyNumberCallback;

    public get rot2D(): number {
        return this.rotation.y;
    }
    public set rot2D(v: number) {
        this.rotation.y = v;
    }

    public get scene(): BABYLON.Scene {
        return this.getScene();
    }

    public static Create(modelName: string, level: Level): Prop {
        if (modelName.startsWith("building")) {
            return new Building(modelName, level);
        }
        else if (modelName === "human") {
            return new Human(level);
        }
        else if (modelName === "spawner") {
            return new Spawner(level);
        }
        else if (modelName === "target") {
            return new Target(level);
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
        NavGraphManager.RemoveObstacle(this.obstacle);
        super.dispose();
    }

    protected _instantiated = false;
    public async instantiate(): Promise<void> {
        return new Promise<void>(resolve => {
            BABYLON.SceneLoader.ImportMesh("", "datas/meshes/" + this._modelName + ".babylon", "", this.scene, (meshes) => {
                this.bboxMin.copyFromFloats(Infinity, Infinity, Infinity);
                this.bboxMax.copyFromFloats(- Infinity, - Infinity, - Infinity);
                meshes.forEach(mesh => {
                    if (mesh instanceof BABYLON.Mesh) {
                        let material = mesh.material;
                        this.bboxMin.minimizeInPlace(mesh.getBoundingInfo().boundingBox.minimum);
                        this.bboxMax.maximizeInPlace(mesh.getBoundingInfo().boundingBox.maximum);
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
                if (this.hasObstacle) {
                    this.obstacle = Obstacle.CreateRectWithPosRotSource(this, this.bboxMax.x - this.bboxMin.x, this.bboxMax.z - this.bboxMin.z);
                }

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