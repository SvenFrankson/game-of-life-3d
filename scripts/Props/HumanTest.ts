class HumanTest extends Prop {
    
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

    public rootAlt: number = 0.6;

    public humanMesh: BABYLON.LinesMesh;

    public get engine(): BABYLON.Engine {
        return this.scene.getEngine();
    }

    constructor(level: Level) {
        super("human", level);
        this.hasObstacle = false;
    }

    protected _instantiated = false;
    public async instantiate(): Promise<void> {
        this.root = BABYLON.MeshBuilder.CreateBox("root", { size: 0.1 });
        this.torso = BABYLON.MeshBuilder.CreateBox("torso", { size: 0.1 });
        this.head = BABYLON.MeshBuilder.CreateBox("head", { size: 0.1 });
        
        this.shoulderL = BABYLON.MeshBuilder.CreateBox("shoulderL", { size: 0.1 });
        this.shoulderL.parent = this.torso;
        this.shoulderL.position = new BABYLON.Vector3(- 0.2, 0.2, 0);
        this.elbowL = BABYLON.MeshBuilder.CreateBox("elbowL", { size: 0.1 });
        this.handL = BABYLON.MeshBuilder.CreateBox("handL", { size: 0.1 });

        this.shoulderR = BABYLON.MeshBuilder.CreateBox("shoulderR", { size: 0.1 });
        this.shoulderR.parent = this.torso;
        this.shoulderR.position = new BABYLON.Vector3(0.2, 0.2, 0);
        this.elbowR = BABYLON.MeshBuilder.CreateBox("elbowR", { size: 0.1 });
        this.handR = BABYLON.MeshBuilder.CreateBox("handR", { size: 0.1 });
        
        this.hipL = BABYLON.MeshBuilder.CreateBox("hipL", { size: 0.1 });
        this.hipL.parent = this.root;
        this.hipL.position = new BABYLON.Vector3(- 0.13, 0, 0);
        this.kneeL = BABYLON.MeshBuilder.CreateBox("kneeL", { size: 0.1 });
        this.footL = BABYLON.MeshBuilder.CreateBox("footL", { size: 0.1 });

        this.hipR = BABYLON.MeshBuilder.CreateBox("hipR", { size: 0.1 });
        this.hipR.parent = this.root;
        this.hipR.position = new BABYLON.Vector3(0.13, 0, 0);
        this.kneeR = BABYLON.MeshBuilder.CreateBox("kneeR", { size: 0.1 });
        this.footR = BABYLON.MeshBuilder.CreateBox("footR", { size: 0.1 });

        this.scene.onBeforeRenderObservable.add(this._update);
    }

    public start(): void {
        console.log("Start human");
        this.scene.onBeforeRenderObservable.add(this._update);
    }

    private _timer: number = 0;
    private _update = () => {
        let dt = this.engine.getDeltaTime() / 1000;
        this._timer += dt;

        this.root.position.copyFrom(this.position);
        this.root.position.y += this.rootAlt;

        this.torso.position.copyFrom(this.root.position);
        this.torso.position.y += 0.33;

        this.head.position.copyFrom(this.torso.position);
        this.head.position.y += 0.35;

        this.handL.position.copyFrom(this.position);
        this.handL.position.x -= 0.5;
        this.handL.position.y += 1;
        this.handL.position.z += 0.2;

        this.elbowL.position.copyFrom(this.handL.position).subtractInPlace(this.forward.scale(0.32));

        let upperArmLZ = BABYLON.Vector3.Zero();
        let lowerArmLZ = BABYLON.Vector3.Zero();
        for (let i = 0; i < 3; i++) {
            lowerArmLZ.copyFrom(this.handL.position).subtractInPlace(this.elbowL.position).normalize().scaleInPlace(0.32);
            this.elbowL.position.copyFrom(this.handL.position).subtractInPlace(lowerArmLZ);

            upperArmLZ.copyFrom(this.elbowL.position).subtractInPlace(this.shoulderL.absolutePosition).normalize().scaleInPlace(0.32);
            this.elbowL.position.copyFrom(this.shoulderL.absolutePosition).addInPlace(upperArmLZ);
        }
        
        this.handR.position.copyFrom(this.position);
        this.handR.position.x += 0.5;
        this.handR.position.y += 1;
        this.handR.position.z += 0.2;
        
        this.elbowR.position.copyFrom(this.handR.position).subtractInPlace(this.forward.scale(0.32));

        let upperArmRZ = BABYLON.Vector3.Zero();
        let lowerArmRZ = BABYLON.Vector3.Zero();
        for (let i = 0; i < 3; i++) {
            lowerArmRZ.copyFrom(this.handR.position).subtractInPlace(this.elbowR.position).normalize().scaleInPlace(0.32);
            this.elbowR.position.copyFrom(this.handR.position).subtractInPlace(lowerArmRZ);

            upperArmRZ.copyFrom(this.elbowR.position).subtractInPlace(this.shoulderR.absolutePosition).normalize().scaleInPlace(0.32);
            this.elbowR.position.copyFrom(this.shoulderR.absolutePosition).addInPlace(upperArmRZ);
        }

        this.footL.position.copyFrom(this.position);
        this.footL.position.x -= 0.12;
        this.footL.position.z -= 0.1;

        this.kneeL.position.copyFrom(this.hipL.absolutePosition).addInPlace(this.footL.position).scaleInPlace(0.5);
        this.kneeL.position.addInPlace(this.forward.scale(0.2)).addInPlace(this.right.scale(- 0.1));

        let upperLegLZ = BABYLON.Vector3.Zero();
        let lowerLegLZ = BABYLON.Vector3.Zero();
        for (let i = 0; i < 3; i++) {
            lowerLegLZ.copyFrom(this.footL.position).subtractInPlace(this.kneeL.position).normalize().scaleInPlace(0.32);
            this.kneeL.position.copyFrom(this.footL.position).subtractInPlace(lowerLegLZ);

            upperLegLZ.copyFrom(this.kneeL.position).subtractInPlace(this.hipL.absolutePosition).normalize().scaleInPlace(0.32);
            this.kneeL.position.copyFrom(this.hipL.absolutePosition).addInPlace(upperLegLZ);
        }
        
        this.footR.position.copyFrom(this.position);
        this.footR.position.x += 0.12;
        this.footR.position.z += 0.1;
        
        this.kneeR.position.copyFrom(this.hipR.absolutePosition).addInPlace(this.footR.position).scaleInPlace(0.5);
        this.kneeR.position.addInPlace(this.forward.scale(0.2)).addInPlace(this.right.scale(0.1));

        let upperLegRZ = BABYLON.Vector3.Zero();
        let lowerLegRZ = BABYLON.Vector3.Zero();
        for (let i = 0; i < 3; i++) {
            lowerLegRZ.copyFrom(this.footR.position).subtractInPlace(this.kneeR.position).normalize().scaleInPlace(0.32);
            this.kneeR.position.copyFrom(this.footR.position).subtractInPlace(lowerLegRZ);

            upperLegRZ.copyFrom(this.kneeR.position).subtractInPlace(this.hipR.absolutePosition).normalize().scaleInPlace(0.32);
            this.kneeR.position.copyFrom(this.hipR.absolutePosition).addInPlace(upperLegRZ);
        }

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