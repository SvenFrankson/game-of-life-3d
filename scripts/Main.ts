/// <reference path="../lib/babylon.d.ts"/>

var MAX_ROAD_SIZE: number = 7;

class Main {
    
    public static Instance: Main;

	public canvas: HTMLCanvasElement;
	public engine: BABYLON.Engine;
    public scene: BABYLON.Scene;
    public camera: BABYLON.ArcRotateCamera;
    public light: BABYLON.HemisphericLight;

    public static TestRedMaterial: ToonMaterial;
    public static TestGreenMaterial: ToonMaterial;
    public static TestBlueMaterial: ToonMaterial;

    public roads: Road[];
    public roadManager: RoadManager;

    constructor(canvasElement: string) {
        Main.Instance = this;
        
		this.canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
        this.canvas.requestPointerLock = this.canvas.requestPointerLock || this.canvas.msRequestPointerLock || this.canvas.mozRequestPointerLock || this.canvas.webkitRequestPointerLock;
		this.engine = new BABYLON.Engine(this.canvas, true);
		BABYLON.Engine.ShadersRepository = "./shaders/";
	}

    public async createScene(): Promise<void> {
        //window.localStorage.clear();

		this.scene = new BABYLON.Scene(this.engine);

        Main.TestRedMaterial = new ToonMaterial("red-material", this.scene);
        Main.TestRedMaterial.setDiffuseColor(BABYLON.Color3.Red());

        Main.TestGreenMaterial = new ToonMaterial("green-material", this.scene);
        Main.TestGreenMaterial.setDiffuseColor(BABYLON.Color3.Green());

        Main.TestBlueMaterial = new ToonMaterial("blue-material", this.scene);
        Main.TestBlueMaterial.setDiffuseColor(BABYLON.Color3.Blue());

		//this.scene.clearColor.copyFromFloats(166 / 255, 231 / 255, 255 / 255, 1);
        //this.scene.clearColor = BABYLON.Color4.FromHexString("#eb4034ff");
        this.scene.clearColor = BABYLON.Color4.FromHexString("#eb4034");

        this.light = new BABYLON.HemisphericLight("light", (new BABYLON.Vector3(- 1, 3, 2)).normalize(), this.scene);

        this.camera = new BABYLON.ArcRotateCamera("camera", 0, 0, 10, new BABYLON.Vector3(MAX_ROAD_SIZE * 5, 0, MAX_ROAD_SIZE * 5));
        this.camera.setPosition(new BABYLON.Vector3(30, 30, -10));
        this.camera.attachControl();
        OutlinePostProcess.AddOutlinePostProcess(this.camera);

        this.roadManager = new RoadManager();
        await this.roadManager.initialize();

        this.roads = [];
        for (let i = 0; i < MAX_ROAD_SIZE; i++) {
            for (let j = 0; j < MAX_ROAD_SIZE; j++) {
                this.roads[i + MAX_ROAD_SIZE * j] = new Road(i, j, 2, this.roadManager, this.scene, RoadType.None);
                this.roads[i + MAX_ROAD_SIZE * j].instantiate();
            }
        }

        let building = new Prop("building-bordeaux");
        building.position.y += 0.2;
        building.position.x += 8;
        building.rotation.y = Math.PI / 2;
        building.instantiate();

        let tree = new Prop("street-tree-1");
        tree.position.y += 0.2;
        tree.position.x -= 4.5;
        tree.position.z += 4.5;
        tree.rotation.y = Math.PI / 2;
        tree.instantiate();

        let roadEditor = new RoadEditor(this);
        roadEditor.initialize();
	}

	public animate(): void {
		this.engine.runRenderLoop(() => {
			this.scene.render();
			this.update();
		});

		window.addEventListener("resize", () => {
			this.engine.resize();
		});
	}

    public async initialize(): Promise<void> {
        
    }

    public update(): void {
        
    }
}

window.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded " + window.location.href);

    let main: Main = new Main("renderCanvas");
    main.createScene();
    main.initialize().then(() => {
        main.animate();
    });
});