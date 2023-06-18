class Creep extends BABYLON.Mesh {

    public speed: number = 3;

    public path: BABYLON.Vector2[];
    public endTarget: Target;

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

    public get scene(): BABYLON.Scene {
        return this.getScene();
    }

    public get engine(): BABYLON.Engine {
        return this.scene.getEngine();
    }

    constructor(public level: Level) {
        super("creep");
    }

    protected _instantiated = false;
    public async instantiate(): Promise<void> {
        return new Promise<void>(resolve => {
            BABYLON.SceneLoader.ImportMesh("", "datas/meshes/creep.babylon", "", this.scene, (meshes) => {
                
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

    public start(): void {
        console.log("Start creep");
        this.endTarget = this.level.getTargets()[0];
        if (this.endTarget) {
            this.scene.onBeforeRenderObservable.add(this._update);
        }
    }

    private _currentPointOnPath: number = 1;
    private _update = () => {
        if (!this.path) {
            this.path = NavGraphManager.GetForRadius(1).path;
            this._currentPointOnPath = 1;
        }

        if (BABYLON.Vector2.DistanceSquared(this.pos2D, this.endTarget.pos2D) < 1) {
            this.kill();
            return;
        }

        if (this.path) {
            let dt = this.engine.getDeltaTime() / 1000;
            let dDist = dt * this.speed;

            let target = this.path[this._currentPointOnPath];
            if (target) {
                let dir = target.subtract(this.pos2D);
    
                if (dir.lengthSquared() < dDist * dDist) {
                    this._currentPointOnPath++;
                    target = this.path[this._currentPointOnPath];
                    if (target) {
                        dir = target.subtract(this.pos2D); 
                    }
                }
    
                dir.normalize();
                this.position.x += dir.x * dDist;
                this.position.z += dir.y * dDist;

                this.rotation.y = - Math2D.HeadingFromDir(dir);
            }
        }
    }

    public kill(): void {
        this.scene.onBeforeRenderObservable.removeCallback(this._update);
        this.dispose();
    }
}