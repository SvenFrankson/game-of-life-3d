class HumanTest extends Prop {
    
    public human: Human;

    public root: BABYLON.Mesh;
    public torso: BABYLON.Mesh;
    public head: BABYLON.Mesh;

    public shoulderL: BABYLON.Mesh;
    public elbowL: BABYLON.Mesh;
    public handL: BABYLON.Mesh;

    public shoulderR: BABYLON.Mesh;
    public elbowR: BABYLON.Mesh;
    public handR: BABYLON.Mesh;
    
    public hipL: BABYLON.Mesh;
    public kneeL: BABYLON.Mesh;
    public footL: BABYLON.Mesh;

    public hipR: BABYLON.Mesh;
    public kneeR: BABYLON.Mesh;
    public footR: BABYLON.Mesh;

    public rootAlt: number = 0.65;
    public armLength: number = 0.3;
    public lowerArmLength: number = 0.3;
    public handLength: number = 0.1;

    public humanMesh: BABYLON.LinesMesh;

    public m16: BABYLON.Mesh;

    public get engine(): BABYLON.Engine {
        return this.scene.getEngine();
    }

    constructor(level: Level) {
        super("human", level);
        this.hasObstacle = false;

        this.human = new Human(level);
    }

    protected _instantiated = false;
    public async instantiate(): Promise<void> {
        await this.human.instantiate();

        this.armLength = BABYLON.Vector3.Distance(this.human.armR.getAbsolutePosition(), this.human.lowerArmR.getAbsolutePosition());
        this.lowerArmLength = BABYLON.Vector3.Distance(this.human.lowerArmR.getAbsolutePosition(), this.human.handR.getAbsolutePosition());

        this.root = BABYLON.MeshBuilder.CreateBox("root", { size: 0.1 });
        this.root.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.torso = BABYLON.MeshBuilder.CreateBox("torso", { size: 0.1 });
        this.torso.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.torso.material = Main.TestRedMaterial;
        this.head = BABYLON.MeshBuilder.CreateBox("head", { size: 0.1 });
        
        this.shoulderL = BABYLON.MeshBuilder.CreateBox("shoulderL", { size: 0.01 });
        this.shoulderL.parent = this.torso;
        this.shoulderL.position = new BABYLON.Vector3(- 0.15, 0.24, 0);
        this.elbowL = BABYLON.MeshBuilder.CreateBox("elbowL", { size: 0.01 });
        this.handL = BABYLON.MeshBuilder.CreateBox("handL", { size: 0.01 });

        this.shoulderR = BABYLON.MeshBuilder.CreateBox("shoulderR", { size: 0.01 });
        this.shoulderR.parent = this.torso;
        this.shoulderR.position = new BABYLON.Vector3(0.15, 0.24, 0);
        this.elbowR = BABYLON.MeshBuilder.CreateBox("elbowR", { size: 0.01 });
        this.handR = BABYLON.MeshBuilder.CreateBox("handR", { size: 0.01 });
        
        this.hipL = BABYLON.MeshBuilder.CreateBox("hipL", { size: 0.06 });
        this.hipL.parent = this.root;
        this.hipL.position = new BABYLON.Vector3(- 0.13, 0, 0);
        this.kneeL = BABYLON.MeshBuilder.CreateBox("kneeL", { size: 0.01 });
        this.footL = BABYLON.MeshBuilder.CreateBox("footL", { size: 0.01 });

        this.hipR = BABYLON.MeshBuilder.CreateBox("hipR", { size: 0.06 });
        this.hipR.parent = this.root;
        this.hipR.position = new BABYLON.Vector3(0.13, 0, 0);
        this.kneeR = BABYLON.MeshBuilder.CreateBox("kneeR", { size: 0.01 });
        this.footR = BABYLON.MeshBuilder.CreateBox("footR", { size: 0.01 });
        
        this.handL.position.copyFrom(this.position);
        this.handL.position.x -= 0.5;
        this.handL.position.y += 0.8;
        this.handL.position.z += 0.2;
        this.handL.rotationQuaternion = BABYLON.Quaternion.Identity();
        
        this.handR.position.copyFrom(this.position);
        this.handR.position.x += 0.5;
        this.handR.position.y += 0.8;
        this.handR.position.z += 0.2;
        this.handR.rotationQuaternion = BABYLON.Quaternion.Identity();

        this.footL.position.copyFrom(this.position);
        this.footL.position.x -= 0.12;
        this.footL.position.z -= 0.1;

        this.footR.position.copyFrom(this.position);
        this.footR.position.x += 0.12;
        this.footR.position.z += 0.1;

        this.m16 = new BABYLON.Mesh("m16");
        this.m16.rotationQuaternion = BABYLON.Quaternion.Identity();
        BABYLON.SceneLoader.ImportMesh("", "datas/meshes/m16.babylon", "", this.scene, (meshes) => {
            meshes.forEach(mesh => {
                if (mesh instanceof BABYLON.Mesh) {
                    let material = mesh.material;
                    if (material instanceof BABYLON.PBRMaterial) {
                        let toonMat = new ToonMaterial(material.name + "-3-toon", this.scene);
                        toonMat.setDiffuseColor(material.albedoColor);
                        mesh.material = toonMat;
                    }
                    this.m16 = mesh;
                    this.m16.isVisible = false;
                    this.m16.rotationQuaternion = BABYLON.Quaternion.Identity();
                }
            });
        });

        this.pointerPlane = BABYLON.MeshBuilder.CreateGround("pointer-plane", { width: 10, height: 10 });
        this.pointerPlane.visibility = 0.1;
        this.pointerPlane.rotationQuaternion = BABYLON.Quaternion.Identity();

        this.scene.onBeforeRenderObservable.add(this._update);
        this.scene.onBeforeRenderObservable.add(this._simpleWalk);

        this.scene.onPointerObservable.add(this.onPointerEvent);
    }

    private _steping: boolean = false;
    public _simpleWalk = () => {
        let dt = this.engine.getDeltaTime() / 1000;

        this.handR.position = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(0.25, 0.1, 0.15), this.torso.getWorldMatrix());
        this.handL.position = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(-0.1, 0.1, 0.4), this.torso.getWorldMatrix());
        this.m16.position.copyFrom(this.handR.position);
        VMath.QuaternionFromZYAxisToRef(this.handL.position.subtract(this.handR.position), BABYLON.Axis.Y, this.m16.rotationQuaternion);
        VMath.QuaternionFromYZAxisToRef(this.m16.right, this.m16.forward, this.handR.rotationQuaternion);
        VMath.QuaternionFromYZAxisToRef(this.m16.up.scale(-1), this.m16.forward.add(this.m16.right), this.handL.rotationQuaternion);
        //this.handR.position = this.footL.position.multiplyByFloats(1, 0, 1).add(new BABYLON.Vector3(0, 0.8, 0)).add(this.right.scale(0.4));
        //this.handL.position = this.footR.position.multiplyByFloats(1, 0, 1).add(new BABYLON.Vector3(0, 0.8, 0)).subtract(this.right.scale(0.4));
        
        //this.position.addInPlace(this.forward.scale(dt * 0.8));
        this.rotation.y += dt * Math.PI * 0.05;
        if (!this._steping) {
            let footTargetR = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(0.12, 0, 0), this.getWorldMatrix());
            let footTargetL = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(-0.12, 0, 0), this.getWorldMatrix());

            let dL = BABYLON.Vector3.Distance(this.footL.absolutePosition, footTargetL);
            let dR = BABYLON.Vector3.Distance(this.footR.absolutePosition, footTargetR);
            console.log(dL + " " + dR);
            if (dL > dR) {
                if (dL > 0.01) {
                    this._steping = true;
                    this.step(this.footL, footTargetL).then(() => { this._steping = false; });
                }
            }
            else {
                if (dR > 0.01) {
                    this._steping = true;
                    this.step(this.footR, footTargetR).then(() => { this._steping = false; });
                }
            }
        }
    }

    private async step(foot: BABYLON.Mesh, target: BABYLON.Vector3): Promise<void> {
        return new Promise<void>(resolve => {
            let origin = foot.position.clone();
            let destination = target.clone();
            let up = this.up;
            let duration = 0.8;
            let t = 0;
            let animationCB = () => {
                t += this.scene.getEngine().getDeltaTime() / 1000;
                let f = t / duration;
                if (f < 1) {
                    let p = origin.scale(1 - f).addInPlace(destination.scale(f));
                    p.addInPlace(up.scale(0.1 * Math.sin(f * Math.PI)));
                    foot.position.copyFrom(p);
                }
                else {
                    foot.position.copyFrom(destination);
                    this.scene.onBeforeRenderObservable.removeCallback(animationCB);
                    resolve();
                }
            }
            this.scene.onBeforeRenderObservable.add(animationCB);
        })
    }

    public start(): void {
        console.log("Start human");
        this.scene.onBeforeRenderObservable.add(this._update);
    }

    public pointerPlane: BABYLON.Mesh;
    public target: BABYLON.Mesh;

    public onPointerEvent = (eventData: BABYLON.PointerInfo, eventState: BABYLON.EventState) => {
        if (eventData.type === BABYLON.PointerEventTypes.POINTERDOWN) {
            let pick = this.scene.pick(
                this.scene.pointerX,
                this.scene.pointerY,
                (mesh) => {
                    return mesh === this.handL || mesh === this.handR || mesh === this.footL || mesh === this.footR;
                }
            )

            let pickedMesh = pick.pickedMesh;
            if (pickedMesh === this.handL) {
                this.target = this.handL;
            }
            else if (pickedMesh === this.handR) {
                this.target = this.handR;
            }
            else if (pickedMesh === this.footL) {
                this.target = this.footL;
            }
            else if (pickedMesh === this.footR) {
                this.target = this.footR;
            }

            if (this.target) {
                let d = this.scene.activeCamera.globalPosition.subtract(this.target.position);
                VMath.QuaternionFromYZAxisToRef(pick.getNormal(), d, this.pointerPlane.rotationQuaternion);

                this.pointerPlane.position.copyFrom(this.target.position);
                this.scene.activeCamera.detachControl();
            }

            console.log("pointer down " + this.target);
        }
        else if (eventData.type === BABYLON.PointerEventTypes.POINTERMOVE) {
            if (this.target) {
                console.log(".");
                let pick = this.scene.pick(
                    this.scene.pointerX,
                    this.scene.pointerY,
                    (mesh) => {
                        return mesh === this.pointerPlane;
                    }
                )
        
                if (pick && pick.hit) {
                    this.target.position.copyFrom(pick.pickedPoint);
                }
            }
        }
        else if (eventData.type === BABYLON.PointerEventTypes.POINTERUP) {
            this.target = undefined;
            this.scene.activeCamera.attachControl();
        }
    }

    public onPointerMove = () => {
        
    }

    private _timer: number = 0;
    private _update = () => {
        let dt = this.engine.getDeltaTime() / 1000;
        this._timer += dt;

        let footCenter = this.footL.position.add(this.footR.position).scaleInPlace(0.5);
        let handCenter = this.handL.position.add(this.handR.position).scaleInPlace(0.5);
        let torsoDir = handCenter.subtract(footCenter).normalize();
        torsoDir.addInPlace(BABYLON.Axis.Y.scale(0.5)).normalize();
        torsoDir = BABYLON.Vector3.Up();

        this.root.position.copyFrom(footCenter);
        this.root.position.y = this.rootAlt;

        // Shake that ass
        let footDir = this.footR.position.subtract(this.footL.position).normalize();
        footDir.addInPlace(this.right.scale(3)).normalize();
        VMath.QuaternionFromXYAxisToRef(footDir, torsoDir, this.root.rotationQuaternion);

        // Alpha shouldering
        let handDir = this.handR.position.subtract(this.handL.position).normalize();
        handDir.addInPlace(this.right.scale(2)).normalize();
        VMath.QuaternionFromXYAxisToRef(handDir, torsoDir, this.torso.rotationQuaternion);

        let shoulderForward = BABYLON.Vector3.Cross(this.head.absolutePosition.subtract(this.torso.absolutePosition), handDir).normalize();
        let footForward = BABYLON.Vector3.Cross(this.torso.absolutePosition.subtract(this.root.absolutePosition), footDir).normalize();

        this.torso.position = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(0, 0.33, 0), this.root.getWorldMatrix());
        this.head.position = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(0, 0.33, -0.05), this.torso.getWorldMatrix());

        // Arm Left

        this.elbowL.position.copyFrom(this.handL.position).subtractInPlace(this.forward.scale(this.lowerArmLength)).subtractInPlace(this.right.scale(this.lowerArmLength)).subtractInPlace(this.up.scale(this.lowerArmLength));

        let upperArmLZ = BABYLON.Vector3.Zero();
        let lowerArmLZ = BABYLON.Vector3.Zero();
        for (let i = 0; i < 3; i++) {
            lowerArmLZ.copyFrom(this.handL.position).subtractInPlace(this.elbowL.position).normalize().scaleInPlace(this.lowerArmLength);
            this.elbowL.position.copyFrom(this.handL.position).subtractInPlace(lowerArmLZ);

            upperArmLZ.copyFrom(this.elbowL.position).subtractInPlace(this.shoulderL.absolutePosition).normalize().scaleInPlace(this.armLength);
            this.elbowL.position.copyFrom(this.shoulderL.absolutePosition).addInPlace(upperArmLZ);
        }
        
        // Arm Right

        this.elbowR.position.copyFrom(this.handR.position).subtractInPlace(this.forward.scale(this.lowerArmLength)).addInPlace(this.right.scale(this.lowerArmLength)).subtractInPlace(this.up.scale(this.lowerArmLength));

        let upperArmRZ = BABYLON.Vector3.Zero();
        let lowerArmRZ = BABYLON.Vector3.Zero();
        for (let i = 0; i < 3; i++) {
            lowerArmRZ.copyFrom(this.handR.position).subtractInPlace(this.elbowR.position).normalize().scaleInPlace(this.lowerArmLength);
            this.elbowR.position.copyFrom(this.handR.position).subtractInPlace(lowerArmRZ);

            upperArmRZ.copyFrom(this.elbowR.position).subtractInPlace(this.shoulderR.absolutePosition).normalize().scaleInPlace(this.armLength);
            this.elbowR.position.copyFrom(this.shoulderR.absolutePosition).addInPlace(upperArmRZ);
        }

        // Leg Left

        this.kneeL.position.copyFrom(this.hipL.absolutePosition).addInPlace(this.footL.position).scaleInPlace(0.5);
        this.kneeL.position.addInPlace(this.forward.scale(0.1)).addInPlace(this.right.scale(- 0.05));

        let upperLegLZ = BABYLON.Vector3.Zero();
        let lowerLegLZ = BABYLON.Vector3.Zero();
        for (let i = 0; i < 3; i++) {
            lowerLegLZ.copyFrom(this.footL.position).subtractInPlace(this.kneeL.position).normalize().scaleInPlace(0.32);
            this.kneeL.position.copyFrom(this.footL.position).subtractInPlace(lowerLegLZ);

            upperLegLZ.copyFrom(this.kneeL.position).subtractInPlace(this.hipL.absolutePosition).normalize().scaleInPlace(0.32);
            this.kneeL.position.copyFrom(this.hipL.absolutePosition).addInPlace(upperLegLZ);
        }
        
        // Leg Right

        this.kneeR.position.copyFrom(this.hipR.absolutePosition).addInPlace(this.footR.position).scaleInPlace(0.5);
        this.kneeR.position.addInPlace(this.forward.scale(0.1)).addInPlace(this.right.scale(0.05));

        let upperLegRZ = BABYLON.Vector3.Zero();
        let lowerLegRZ = BABYLON.Vector3.Zero();
        for (let i = 0; i < 3; i++) {
            lowerLegRZ.copyFrom(this.footR.position).subtractInPlace(this.kneeR.position).normalize().scaleInPlace(0.32);
            this.kneeR.position.copyFrom(this.footR.position).subtractInPlace(lowerLegRZ);

            upperLegRZ.copyFrom(this.kneeR.position).subtractInPlace(this.hipR.absolutePosition).normalize().scaleInPlace(0.32);
            this.kneeR.position.copyFrom(this.hipR.absolutePosition).addInPlace(upperLegRZ);
        }

        let q = BABYLON.Quaternion.Identity();

        this.human.root.setPosition(this.root.absolutePosition);
        VMath.QuaternionFromYZAxisToRef(this.torso.absolutePosition.subtract(this.root.absolutePosition).scale(-1), footForward, q);
        this.human.root.setRotationQuaternion(q.normalize());

        this.human.torso.setPosition(this.torso.absolutePosition);
        VMath.QuaternionFromYZAxisToRef(this.head.absolutePosition.subtract(this.torso.absolutePosition).scale(-1), shoulderForward, q);
        this.human.torso.setRotationQuaternion(q.normalize());

        this.human.upperLegR.setPosition(this.hipR.absolutePosition.clone());
        VMath.QuaternionFromYZAxisToRef(this.kneeR.position.subtract(this.hipR.absolutePosition).scale(-1), this.forward.add(this.up), q);
        this.human.upperLegR.setRotationQuaternion(q.normalize());

        this.human.legR.setPosition(this.kneeR.absolutePosition.clone());
        VMath.QuaternionFromYZAxisToRef(this.footR.position.subtract(this.kneeR.absolutePosition).scale(-1), this.kneeR.position.subtract(this.hipR.absolutePosition), q);
        this.human.legR.setRotationQuaternion(q.normalize());

        this.human.upperLegL.setPosition(this.hipL.absolutePosition.clone());
        VMath.QuaternionFromYZAxisToRef(this.kneeL.position.subtract(this.hipL.absolutePosition).scale(-1), this.forward.add(this.up), q);
        this.human.upperLegL.setRotationQuaternion(q.normalize());

        this.human.legL.setPosition(this.kneeL.absolutePosition.clone());
        VMath.QuaternionFromYZAxisToRef(this.footL.position.subtract(this.kneeL.absolutePosition).scale(-1), this.kneeL.position.subtract(this.hipL.absolutePosition), q);
        this.human.legL.setRotationQuaternion(q.normalize());

        this.human.armR.setPosition(this.shoulderR.absolutePosition);
        VMath.QuaternionFromYZAxisToRef(this.elbowR.position.subtract(this.shoulderR.absolutePosition).scale(-1), this.up, q);
        this.human.armR.setRotationQuaternion(q.normalize());

        this.human.lowerArmR.setPosition(this.elbowR.absolutePosition.clone());
        VMath.QuaternionFromYZAxisToRef(this.handR.position.subtract(this.elbowR.absolutePosition).scale(-1), this.up, q);
        this.human.lowerArmR.setRotationQuaternion(q.normalize());

        this.human.handR.setPosition(this.handR.position.clone());
        this.human.handR.setRotationQuaternion(this.handR.rotationQuaternion.multiply(BABYLON.Quaternion.FromEulerAngles(- Math.PI * 0.5, 0, 0)).normalize());

        this.human.armL.setPosition(this.shoulderL.absolutePosition);
        VMath.QuaternionFromYZAxisToRef(this.elbowL.position.subtract(this.shoulderL.absolutePosition).scale(-1), this.up, q);
        this.human.armL.setRotationQuaternion(q.normalize());

        this.human.lowerArmL.setPosition(this.elbowL.absolutePosition.clone());
        VMath.QuaternionFromYZAxisToRef(this.handL.position.subtract(this.elbowL.absolutePosition).scale(-1), this.up, q);
        this.human.lowerArmL.setRotationQuaternion(q.normalize());

        this.human.handL.setPosition(this.handL.position.clone());
        this.human.handL.setRotationQuaternion(this.handL.rotationQuaternion.multiply(BABYLON.Quaternion.FromEulerAngles(- Math.PI * 0.5, 0, 0)).normalize());

        if (this.humanMesh) {
            this.humanMesh.dispose();
        }
        this.humanMesh = BABYLON.CreateLineSystem(
            "humanMesh",
            {
                lines: [
                    [ this.root.absolutePosition, this.torso.absolutePosition ],
                    [ this.torso.absolutePosition, this.head.absolutePosition ],
                    [ this.root.absolutePosition, this.hipL.absolutePosition ],
                    [ this.root.absolutePosition, this.hipR.absolutePosition ],
                    [ this.hipL.absolutePosition, this.kneeL.absolutePosition ],
                    [ this.hipR.absolutePosition, this.kneeR.absolutePosition ],
                    [ this.kneeL.absolutePosition, this.footL.absolutePosition ],
                    [ this.kneeR.absolutePosition, this.footR.absolutePosition ],
                    [ this.torso.absolutePosition, this.shoulderL.absolutePosition ],
                    [ this.torso.absolutePosition, this.shoulderR.absolutePosition ],
                    [ this.shoulderL.absolutePosition, this.elbowL.absolutePosition ],
                    [ this.shoulderR.absolutePosition, this.elbowR.absolutePosition ],
                    [ this.elbowL.absolutePosition, this.handL.absolutePosition ],
                    [ this.elbowR.absolutePosition, this.handR.absolutePosition ],
                ]
            },
            this.scene
        )
    }
}