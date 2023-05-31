class RoadEditor {

    public roadEditionMenu: HTMLDivElement;

    public selectedRoad: Road;
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
                    this.selectedRoad.setRoadType(roadType);
                }
            })
        }
    }

    public initialize(): void {
        this.roadSelector = BABYLON.MeshBuilder.CreateBox("road-selector", { width: 10, height: 0.5, depth: 10 });
        let roadSelectorMaterial = new BABYLON.StandardMaterial("road-selector-material");
        roadSelectorMaterial.diffuseColor.copyFromFloats(0, 1, 1);
        roadSelectorMaterial.specularColor.copyFromFloats(0, 0, 0);
        roadSelectorMaterial.alpha = 0.3;
        this.roadSelector.material = roadSelectorMaterial;

        this.selectedRoadButtonsContainer = new BABYLON.Mesh("selected-road-button-container");
        this.selectedRoadButtonsContainer.rotationQuaternion = BABYLON.Quaternion.Identity();

        this.turnRoadLeftButton = BABYLON.MeshBuilder.CreateBox("turn-road-left-button", { width: 2, height: 0.5, depth: 2 });
        this.turnRoadLeftButton.position.x = - 1.5;
        this.turnRoadLeftButton.position.y = 1;
        this.turnRoadLeftButton.position.z = 7 * Math.SQRT2;
        this.turnRoadLeftButton.parent = this.selectedRoadButtonsContainer;

        this.turnRoadRightButton = BABYLON.MeshBuilder.CreateBox("turn-road-right-button", { width: 2, height: 0.5, depth: 2 });
        this.turnRoadRightButton.position.x = 1.5;
        this.turnRoadRightButton.position.y = 1;
        this.turnRoadRightButton.position.z = 7 * Math.SQRT2;
        this.turnRoadRightButton.parent = this.selectedRoadButtonsContainer;

        this.main.scene.onBeforeRenderObservable.add(this._update);
        this.main.scene.onPointerObservable.add(this._onPointerObservable)
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
    private _onPointerObservable = (eventData: BABYLON.PointerInfo, eventState: BABYLON.EventState) => {
        if (eventData.pickInfo && eventData.pickInfo.pickedPoint) {
            if (eventData.type === BABYLON.PointerEventTypes.POINTERDOWN) {
                this._pointerDownPos.copyFrom(eventData.pickInfo.pickedPoint);
            }
            else if (eventData.type === BABYLON.PointerEventTypes.POINTERUP) {
                let deltaPos = BABYLON.Vector3.DistanceSquared(eventData.pickInfo.pickedPoint, this._pointerDownPos);
                if (deltaPos < 0.5 * 0.5) {
                    let pickedMesh = eventData.pickInfo.pickedMesh;
                    if (pickedMesh === this.turnRoadLeftButton) {
                        if (this.selectedRoad) {
                            this.selectedRoad.r = (this.selectedRoad.r - 1 + 4) % 4;
                        }
                    }
                    else if (pickedMesh === this.turnRoadRightButton) {
                        if (this.selectedRoad) {
                            this.selectedRoad.r = (this.selectedRoad.r + 1 + 4) % 4;
                        }
                    }
                    else {
                        let road = this.main.roads.find(r => { return r.mesh === eventData.pickInfo.pickedMesh; });
                        if (road) {
                            this.setSelectedRoad(road);
                        }
                        else {
                            this.setSelectedRoad(undefined);
                        }
                    }
                }
            }
        }
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