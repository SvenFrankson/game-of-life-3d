class Human extends Prop {
    
    public root: BABYLON.Bone;
    public torso: BABYLON.Bone;
    public upperLegL: BABYLON.Bone;
    public legL: BABYLON.Bone;
    public upperLegR: BABYLON.Bone;
    public legR: BABYLON.Bone;

    public rootAlt: number = 1;
    public hipLPosition: BABYLON.Vector3;
    public footTargetL: BABYLON.Mesh;
    public footTargetR: BABYLON.Mesh;
    public kneeL: BABYLON.Mesh;
    public kneeR: BABYLON.Mesh;
    public handTargetL: BABYLON.Mesh;
    public handTargetR: BABYLON.Mesh;

    public humanMesh: BABYLON.Mesh;

    public get engine(): BABYLON.Engine {
        return this.scene.getEngine();
    }

    constructor(level: Level) {
        super("human", level);
        this.hasObstacle = false;
        this.footTargetL = new BABYLON.Mesh("footTargetL");
        //BABYLON.CreateBoxVertexData({ size: 0.2 }).applyToMesh(this.footTargetL);
        this.footTargetR = new BABYLON.Mesh("footTargetR");

        this.kneeL = new BABYLON.Mesh("kneeL");
        //BABYLON.CreateBoxVertexData({ size: 0.2 }).applyToMesh(this.kneeL);
        this.kneeR = new BABYLON.Mesh("kneeR");

        this.handTargetL = new BABYLON.Mesh("handTargetL");
        this.handTargetR = new BABYLON.Mesh("handTargetR");
    }

    protected _instantiated = false;
    public async instantiate(): Promise<void> {
        return new Promise<void>(resolve => {
            BABYLON.SceneLoader.ImportMesh("", "datas/meshes/human.babylon", "", this.scene, (meshes, particlesSystems, skeletons) => {
                meshes.forEach(mesh => {
                    if (mesh instanceof BABYLON.Mesh) {
                        this.humanMesh = mesh;
                        this.humanMesh.visibility = 0.8;
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
                    this.root = skeleton.bones.find(bone => { return bone.name === "ass"; });
                    this.upperLegL = skeleton.bones.find(bone => { return bone.name === "upper-leg-left"; });
                    console.log("upperLegL");
                    console.log(this.upperLegL.getAbsolutePosition());
                    console.log(this.upperLegL.rotationQuaternion);
                    console.log(BABYLON.Quaternion.Identity());
                    console.log("- - -");
                    this.upperLegL.parent = undefined;
                    
                    let test1 = BABYLON.MeshBuilder.CreateSphere("hip", { diameter: 0.1 });
                    let test2 = BABYLON.MeshBuilder.CreateSphere("hip", { diameter: 0.1 });
                    test2.parent = test1;
                    test2.position.y = - 0.32;

                    this.upperLegR = skeleton.bones.find(bone => { return bone.name === "upper-leg-right"; });
                    this.upperLegR.parent = undefined;
                    
                    this.legL = skeleton.bones.find(bone => { return bone.name === "leg-left"; });
                    this.legL.parent = undefined;
                    
                    this.legR = skeleton.bones.find(bone => { return bone.name === "leg-right"; });
                    this.legR.parent = undefined;

                    this.legR = skeleton.bones.find(bone => { return bone.name === "leg-right"; });
                    let lowerArmRight = skeleton.bones.find(bone => { return bone.name === "lower-arm-right"; });
                    let handRight = skeleton.bones.find(bone => { return bone.name === "hand-right"; });
                    //handRight.parent = lowerArmRight;
                    let thumbRight = skeleton.bones.find(bone => { return bone.name === "thumb-right"; });
                    //thumbRight.parent = lowerArmRight;

                    skeleton.bones.forEach(bone => {
                        if (!bone.parent) {
                            console.log(bone.name + " no parent");
                        }
                        else {
                            console.log(bone.name + " " + bone.parent.name);
                        }
                    })
                    console.log(this.root);
                });

                this._instantiated = true;
                this.start();
                resolve();
            });
        });
    }

    public start(): void {
        this.scene.onBeforeRenderObservable.add(this._update);
    }

    private _timer: number = 0;
    private _update = () => {
        return;
        let dt = this.engine.getDeltaTime() / 1000;
        this._timer += dt;
        
        this.rootAlt = 0.8 + 0.4 * Math.cos(this._timer);

        this.root.setAbsolutePosition(new BABYLON.Vector3(this.pos2D.x, this.rootAlt, this.pos2D.y));
        let q = BABYLON.Quaternion.Identity();
        this.humanMesh.refreshBoundingInfo(true);

        this.footTargetL.position.copyFromFloats(- 0.2, 0, 0);
        BABYLON.Vector3.TransformCoordinatesToRef(this.footTargetL.position, this.getWorldMatrix(), this.footTargetL.position);

        this.kneeL.position.addInPlace(this.forward.scale(0.1));

        this.footTargetR.position.copyFromFloats(0.2, 0, 0);
        BABYLON.Vector3.TransformCoordinatesToRef(this.footTargetR.position, this.getWorldMatrix(), this.footTargetR.position);
        
        this.kneeR.position.addInPlace(this.forward.scale(0.1));

        this.upperLegL.setAbsolutePosition(BABYLON.Vector3.TransformCoordinates(this.hipLPosition, this.root.getWorldMatrix()));

        let upperLegLZ = BABYLON.Vector3.Zero();
        let lowerLegLZ = BABYLON.Vector3.Zero();
        for (let i = 0; i < 3; i++) {
            lowerLegLZ.copyFrom(this.footTargetL.position).subtractInPlace(this.kneeL.position).normalize().scaleInPlace(0.3);
            this.kneeL.position.copyFrom(this.footTargetL.position).subtractInPlace(lowerLegLZ);

            upperLegLZ.copyFrom(this.kneeL.position).subtractInPlace(this.upperLegL.getAbsolutePosition()).normalize().scaleInPlace(0.3);
            this.kneeL.position.copyFrom(this.upperLegL.getAbsolutePosition()).addInPlace(upperLegLZ);
        }

        VMath.QuaternionFromZYAxisToRef(upperLegLZ, BABYLON.Vector3.Up(), q);
        this.upperLegL.setRotationQuaternion(q);

        this.legL.setAbsolutePosition(this.kneeL.position);
        VMath.QuaternionFromZYAxisToRef(lowerLegLZ, BABYLON.Vector3.Up(), q);
        this.legL.setRotationQuaternion(q);
    }
}