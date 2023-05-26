/// <reference path="../lib/babylon.d.ts"/>

class Cell {

    public nCount: number = 0;

    constructor(public value: number) {
    }
}

class Main {
    
    public static Instance: Main;

	public canvas: HTMLCanvasElement;
	public engine: BABYLON.Engine;
    public scene: BABYLON.Scene;
    public cameraManager: BABYLON.ArcRotateCamera;
    public vertexDataLoader: VertexDataLoader;

    public static redMaterial: BABYLON.StandardMaterial;
    public static greenMaterial: BABYLON.StandardMaterial;
    public static blueMaterial: BABYLON.StandardMaterial;

    constructor(canvasElement: string) {
        Main.Instance = this;
        
		this.canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
        this.canvas.requestPointerLock = this.canvas.requestPointerLock || this.canvas.msRequestPointerLock || this.canvas.mozRequestPointerLock || this.canvas.webkitRequestPointerLock;
		this.engine = new BABYLON.Engine(this.canvas, true);
		BABYLON.Engine.ShadersRepository = "./shaders/";
	}

    public createScene(): void {
        //window.localStorage.clear();

		this.scene = new BABYLON.Scene(this.engine);

        Main.redMaterial = new BABYLON.StandardMaterial("debug");
        Main.redMaterial.specularColor.copyFromFloats(0, 0, 0);
        Main.redMaterial.diffuseColor.copyFromFloats(1, 0, 0);
        Main.greenMaterial = new BABYLON.StandardMaterial("debug");
        Main.greenMaterial.specularColor.copyFromFloats(0, 0, 0);
        Main.greenMaterial.diffuseColor.copyFromFloats(0, 1, 0);
        Main.blueMaterial = new BABYLON.StandardMaterial("debug");
        Main.blueMaterial.specularColor.copyFromFloats(0, 0, 0);
        Main.blueMaterial.diffuseColor.copyFromFloats(0, 0, 1);

		//this.scene.clearColor.copyFromFloats(166 / 255, 231 / 255, 255 / 255, 1);
        //this.scene.clearColor = BABYLON.Color4.FromHexString("#eb4034ff");
        this.scene.clearColor = BABYLON.Color4.FromHexString("#eb4034");
        this.vertexDataLoader = new VertexDataLoader(this.scene);

        let light = new BABYLON.HemisphericLight("light", BABYLON.Vector3.One(), this.scene);

        this.cameraManager = new BABYLON.ArcRotateCamera("camera", 0, 0, 10, new BABYLON.Vector3(20, 20, 20));
        this.cameraManager.setPosition(new BABYLON.Vector3(30, 30, -10));
        this.cameraManager.attachControl();

        let tree = new OctreeNode<Cell>(7);
        let newTree = new OctreeNode<Cell>(7);
        
        let step = () => {
            newTree = new OctreeNode<Cell>(7);

            tree.forEach((cell, i, j, k) => {
                //console.log("a");
                if (cell.value === 1) {
                    let existingNewCell = newTree.get(i, j, k);
                    if (!existingNewCell) {
                        existingNewCell = new Cell(1);
                        newTree.set(existingNewCell, i, j, k);
                    }
                    existingNewCell.value = 1;

                    for (let ii = - 1; ii <= 1; ii++) {
                        for (let jj = - 1; jj <= 1; jj++) {
                            for (let kk = - 1; kk <= 1; kk++) {
                                if (ii != 0 || jj != 0 || kk != 0) {
                                    let nCell = newTree.get(i + ii, j + jj, k + kk);
                                    if (!nCell) {
                                        nCell = new Cell(0);
                                        newTree.set(nCell, i + ii, j + jj, k + kk);
                                    }
                                    nCell.nCount++;
                                }
                            }
                        }
                    }
                }
            });
            
            newTree.forEach((cell, i, j, k) => {
                //console.log("b");
                if (i === 0 || j === 0 || k === 0) {
                    cell.value = 0;
                }
                if (cell.value === 1) {
                    console.log(cell.nCount);
                    if (cell.nCount <= 1 || cell.nCount >= 8) {
                        cell.value = 0;
                        console.log("kill, n = " + cell.nCount);
                    }
                }
                else if (cell.value === 0) {
                    if (cell.nCount === 4) {
                        cell.value = 1;
                        console.log("born, n = " + cell.nCount);
                    }
                    else {
                        //console.log("still dead, n = " + cell.nCount);
                    }
                }
            });
            tree = newTree;
        }

        ChunckVertexData.InitializeData().then(async () => {
            /*
            tree.set(new Cell(1), 20, 20, 20);
            tree.set(new Cell(1), 21, 20, 20);
            tree.set(new Cell(1), 20, 21, 20);
            tree.set(new Cell(1), 20, 20, 21);
            tree.set(new Cell(1), 19, 20, 20);
            tree.set(new Cell(1), 20, 19, 20);
            tree.set(new Cell(1), 20, 20, 19);
            */
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    for (let k = 0; k < 3; k++) {
                        tree.set(new Cell(1), 19 + i, 19 + j, 19 + k);
                    }
                }
            }
            let mesh = new BABYLON.Mesh("mesh");

            let vData = ChunckMeshBuilder.BuildMesh(tree);
            if (vData) {
                vData.applyToMesh(mesh);
            }

            let n = 0;
            setInterval(() => {
                console.log("-- Step " + n + " starting");
                step();
                vData = ChunckMeshBuilder.BuildMesh(tree);
                if (vData) {
                    vData.applyToMesh(mesh);
                }
                console.log("-- Step " + n + " done");
                console.log("-- -- -- -- -- -- --");
                n++;
            }, 1000);
        });
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