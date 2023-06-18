class Human extends Prop {
    
    public ass: BABYLON.Bone;
    public humanMesh: BABYLON.Mesh;

    public get engine(): BABYLON.Engine {
        return this.scene.getEngine();
    }

    constructor(level: Level) {
        super("human", level);
        this.hasObstacle = false;
    }

    protected _instantiated = false;
    public async instantiate(): Promise<void> {
        return new Promise<void>(resolve => {
            BABYLON.SceneLoader.ImportMesh("", "datas/meshes/human.babylon", "", this.scene, (meshes, particlesSystems, skeletons) => {
                meshes.forEach(mesh => {
                    if (mesh instanceof BABYLON.Mesh) {
                        this.humanMesh = mesh;
                        /*
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
                        else if (material instanceof BABYLON.PBRMaterial) {
                            let toonMat = new ToonMaterial(material.name + "-3-toon", this.scene);
                            toonMat.setDiffuseColor(material.albedoColor);
                            mesh.material = toonMat;
                        }
                        */
                    }
                });

                skeletons.forEach(skeleton => {
                    console.log(skeleton);
                    this.ass = skeleton.bones.find(bone => {
                        return bone.name === "ass";
                    });
                    let lowerArmRight = skeleton.bones.find(bone => { return bone.name === "lower-arm-right"; });
                    let handRight = skeleton.bones.find(bone => { return bone.name === "hand-right"; });
                    handRight.parent = lowerArmRight;
                    let thumbRight = skeleton.bones.find(bone => { return bone.name === "thumb-right"; });
                    thumbRight.parent = lowerArmRight;

                    skeleton.bones.forEach(bone => {
                        if (!bone.parent) {
                            console.log(bone.name + " no parent");
                        }
                        else {
                            console.log(bone.name + " " + bone.parent.name);
                        }
                    })
                    console.log(this.ass);
                });

                this._instantiated = true;
                this.start();
                resolve();
            });
        });
    }

    public start(): void {
        console.log("Start human");
        this.scene.onBeforeRenderObservable.add(this._update);
    }

    private _timer: number = 0;
    private _update = () => {
        let dt = this.engine.getDeltaTime() / 1000;
        this._timer += dt;
        this.ass.setAbsolutePosition(new BABYLON.Vector3(this.pos2D.x, 1 + Math.cos(this._timer), this.pos2D.y));
        this.humanMesh.refreshBoundingInfo(true);
    }
}