class RoadEditor {

    public roadEditionMenu: HTMLDivElement;

    public selectedRoad: Road;
    public draggedRoadType: RoadType = RoadType.Empty;
    public lastUsedDirection: number = 0;

    public roadSelector: BABYLON.Mesh;
    public selectedRoadButtonsContainer: BABYLON.Mesh;
    public turnRoadLeftButton: BABYLON.Mesh;
    public turnRoadRightButton: BABYLON.Mesh;

    constructor(
        public main: Main
    ) {
        this.roadEditionMenu = document.createElement("div");
        this.roadEditionMenu.id = "road-edition-menu";
        this.roadEditionMenu.classList.add("edition-menu");
        document.body.appendChild(this.roadEditionMenu);

        for (let i = 0; i < 7; i++) {
            let roadType = i;
            let roadEditionButton = document.createElement("div");
            roadEditionButton.classList.add("edition-menu-button");
            roadEditionButton.innerText = RoadsData.List[roadType];
            this.roadEditionMenu.appendChild(roadEditionButton);
            roadEditionButton.addEventListener("pointerup", () => {
                if (this.selectedRoad) {
                    if (this.selectedRoad.roadType === RoadType.Empty) {
                        this.selectedRoad.dir = this.lastUsedDirection;
                    }
                    this.selectedRoad.setRoadType(roadType);
                }
                this.draggedRoadType = RoadType.None;
            });
            roadEditionButton.addEventListener("pointerdown", () => {
                this.draggedRoadType = roadType;
            });
        }
    }

    public initialize(): void {
        this.roadSelector = BABYLON.MeshBuilder.CreateBox("road-selector", { width: 10, height: 0.5, depth: 10 });
        this.roadSelector.isPickable = false;
        let roadSelectorMaterial = new BABYLON.StandardMaterial("road-selector-material");
        roadSelectorMaterial.diffuseColor.copyFromFloats(0, 1, 1);
        roadSelectorMaterial.specularColor.copyFromFloats(0, 0, 0);
        roadSelectorMaterial.alpha = 0.3;
        this.roadSelector.material = roadSelectorMaterial;

        this.selectedRoadButtonsContainer = new BABYLON.Mesh("selected-road-button-container");
        this.selectedRoadButtonsContainer.rotationQuaternion = BABYLON.Quaternion.Identity();

        this.turnRoadLeftButton = BABYLON.MeshBuilder.CreateBox("turn-road-left-button", { width: 2, height: 0.5, depth: 2 });
        this.turnRoadLeftButton.material = Main.TestBlueMaterial;
        this.turnRoadLeftButton.position.x = - 1.5;
        this.turnRoadLeftButton.position.y = 1;
        this.turnRoadLeftButton.position.z = 6 * Math.SQRT2;
        this.turnRoadLeftButton.parent = this.selectedRoadButtonsContainer;

        this.turnRoadRightButton = BABYLON.MeshBuilder.CreateBox("turn-road-right-button", { width: 2, height: 0.5, depth: 2 });
        this.turnRoadRightButton.material = Main.TestBlueMaterial;
        this.turnRoadRightButton.position.x = 1.5;
        this.turnRoadRightButton.position.y = 1;
        this.turnRoadRightButton.position.z = 6 * Math.SQRT2;
        this.turnRoadRightButton.parent = this.selectedRoadButtonsContainer;

        this.main.scene.onBeforeRenderObservable.add(this._update);
        this.main.canvas.addEventListener("pointerdown", this._onPointerDown);
        this.main.canvas.addEventListener("pointerup", this._onPointerUp);
    }

    public setSelectedRoad(road: Road): void {
        this.selectedRoad = road;

        if (this.selectedRoad) {
            this.roadSelector.isVisible = true;
            this.roadSelector.position.x = road.i * 10;
            this.roadSelector.position.z = road.j * 10;

            this.selectedRoadButtonsContainer.isVisible = true;
            this.selectedRoadButtonsContainer.getChildMeshes().forEach(child => { child.isVisible = true; });
            this.selectedRoadButtonsContainer.position.copyFrom(this.roadSelector.position);
        }
        else {
            this.roadSelector.isVisible = false;
            this.selectedRoadButtonsContainer.isVisible = false;
            this.selectedRoadButtonsContainer.getChildMeshes().forEach(child => { child.isVisible = false; });
        }
    }

    private _pointerDownPos: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _lastPointerUpTime: number = 0;

    private _onPointerDown = () => {
        let pickInfo = this.main.scene.pick(this.main.scene.pointerX, this.main.scene.pointerY);
        if (pickInfo && pickInfo.pickedPoint) {
            this._pointerDownPos.copyFrom(pickInfo.pickedPoint);
        }
    }

    private _onPointerUp = () => {
        let pickInfo = this.main.scene.pick(this.main.scene.pointerX, this.main.scene.pointerY);
        if (pickInfo && pickInfo.pickedPoint) {
            let deltaPos = BABYLON.Vector3.DistanceSquared(pickInfo.pickedPoint, this._pointerDownPos);
            if (deltaPos < 0.5 * 0.5) {
                let pickedMesh = pickInfo.pickedMesh;
                if (pickedMesh === this.turnRoadLeftButton) {
                    if (this.selectedRoad) {
                        this.selectedRoad.dir = (this.selectedRoad.dir - 1 + 4) % 4;
                        this.lastUsedDirection = this.selectedRoad.dir;
                    }
                }
                else if (pickedMesh === this.turnRoadRightButton) {
                    if (this.selectedRoad) {
                        this.selectedRoad.dir = (this.selectedRoad.dir + 1 + 4) % 4;
                        this.lastUsedDirection = this.selectedRoad.dir;
                    }
                }
                else {
                    let road = this.main.roads.find(r => { return r.mesh === pickInfo.pickedMesh; });
                    if (road) {
                        if (this.selectedRoad && road === this.selectedRoad) {
                            if (performance.now() - this._lastPointerUpTime < 200) {
                                this.main.camera.target.x = this.selectedRoad.i * 10;
                                this.main.camera.target.z = this.selectedRoad.j * 10;
                            }
                        }
                        this.setSelectedRoad(road);
                    }
                    else {
                        this.setSelectedRoad(undefined);
                    }
                }
            }
            else {
                if (this.draggedRoadType != RoadType.None) {
                    let road = this.main.roads.find(r => { return r.mesh === pickInfo.pickedMesh; });
                    if (road) {
                        if (road.roadType === RoadType.Empty) {
                            road.dir = this.lastUsedDirection;
                        }
                        road.setRoadType(this.draggedRoadType);
                    }
                    this.setSelectedRoad(road);
                }
            }
        }
        else {
            this.setSelectedRoad(undefined);
        }
        this._lastPointerUpTime = performance.now();
        this.draggedRoadType = RoadType.None;
    }

    private _update = () => {
        if (this.selectedRoad) {
            let right = this.main.camera.getDirection(BABYLON.Axis.X);
            let dir = this.main.camera.getDirection(BABYLON.Axis.Z);
            dir.y = 0;
            
            VMath.QuaternionFromZXAxisToRef(dir, right, this.selectedRoadButtonsContainer.rotationQuaternion);
        }
    }
}