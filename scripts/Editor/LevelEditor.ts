class LevelEditor {

    public propEditionMenu: HTMLDivElement;
    public roadEditionMenu: HTMLDivElement;
    public addPropButton: HTMLDivElement;

    public selectedItem: Road | Prop;
    public draggedRoadType: RoadType = RoadType.None;
    public draggedProp: Prop;
    public lastUsedDirection: number = 0;

    public roadSelector: BABYLON.Mesh;
    public selectedRoadButtonsContainer: BABYLON.Mesh;
    public turnRoadLeftButton: BABYLON.Mesh;
    public turnRoadRightButton: BABYLON.Mesh;

    constructor(
        public main: Main
    ) {
        this.propEditionMenu = document.createElement("div");
        this.propEditionMenu.id = "prop-edition-menu";
        this.propEditionMenu.classList.add("edition-menu");
        document.body.appendChild(this.propEditionMenu);

        this.roadEditionMenu = document.createElement("div");
        this.roadEditionMenu.id = "road-edition-menu";
        this.roadEditionMenu.classList.add("edition-menu");
        document.body.appendChild(this.roadEditionMenu);

        this.addPropButton = document.createElement("div");
        this.addPropButton.id = "add-prop-button";
        this.addPropButton.classList.add("edition-button");
        this.addPropButton.innerText = "+";
        this.addPropButton.addEventListener("pointerup", () => {
            this.showPropMenu();
        });
        document.body.appendChild(this.addPropButton);

        for (let i = 0; i < 7; i++) {
            let roadType = i;
            let roadEditionButton = document.createElement("div");
            roadEditionButton.classList.add("edition-menu-button");
            roadEditionButton.innerText = RoadsData.List[roadType];
            this.roadEditionMenu.appendChild(roadEditionButton);
            roadEditionButton.addEventListener("pointerup", () => {
                if (this.selectedItem instanceof Road) {
                    if (this.selectedItem.roadType === RoadType.Empty) {
                        this.selectedItem.dir = this.lastUsedDirection;
                    }
                    this.selectedItem.setRoadType(roadType);
                    this.main.level.saveToLocalStorage();
                }
                this.draggedRoadType = RoadType.None;
            });
            roadEditionButton.addEventListener("pointerdown", () => {
                this.draggedRoadType = roadType;
            });
        }

        for (let i = 0; i < PropsData.List.length; i++) {
            let propName = PropsData.List[i];
            let addPropButton = document.createElement("div");
            addPropButton.classList.add("edition-menu-button");
            addPropButton.innerText = propName;
            this.propEditionMenu.appendChild(addPropButton);
        }
    }

    public showPropMenu(): void {
        this.roadEditionMenu.style.display = "none";
        this.propEditionMenu.style.display = "block";
    }

    public showRoadMenu(): void {
        this.roadEditionMenu.style.display = "block";
        this.propEditionMenu.style.display = "none";
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
        this.main.canvas.addEventListener("pointermove", this._onPointerMove);
        this.main.canvas.addEventListener("pointerup", this._onPointerUp);

        this.showRoadMenu();
    }

    public setSelectedItem(item: Road | Prop): void {
        if (this.selectedItem != item) {
            if (this.selectedItem instanceof Prop) {
                this.selectedItem.unlit();
            }

            this.selectedItem = item;
    
            if (this.selectedItem instanceof Road) {
                this.roadSelector.isVisible = true;
                this.roadSelector.position.x = this.selectedItem.i * 10;
                this.roadSelector.position.z = this.selectedItem.j * 10;
    
                this.selectedRoadButtonsContainer.isVisible = true;
                this.selectedRoadButtonsContainer.getChildMeshes().forEach(child => { child.isVisible = true; });
                this.selectedRoadButtonsContainer.position.copyFrom(this.roadSelector.position);
    
                this.showRoadMenu();
            }
            else {
                this.roadSelector.isVisible = false;
                this.selectedRoadButtonsContainer.isVisible = false;
                this.selectedRoadButtonsContainer.getChildMeshes().forEach(child => { child.isVisible = false; });
            }

            if (this.selectedItem instanceof Prop) {
                this.selectedItem.highlight();
                this.showPropMenu();
            }
        }
    }

    public setDraggedProp(prop: Prop): void {
        this.draggedProp = prop;
        
        if (this.draggedProp) {
            this.main.camera.detachControl();
        }
        else {
            this.main.camera.attachControl();
        }
    }

    public dropDraggedProp(): void {
        if (this.draggedProp) {
            if (!this.draggedProp.isVisible) {
                this.draggedProp.dispose();
            }
            this.setDraggedProp(undefined);
            this.main.level.saveToLocalStorage();
        }
    }

    private _pointerDownPos: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _lastPointerUpTime: number = 0;

    private _onPointerDown = () => {
        let pickInfo = this.main.scene.pick(this.main.scene.pointerX, this.main.scene.pointerY);
        if (pickInfo && pickInfo.pickedPoint) {
            this._pointerDownPos.copyFrom(pickInfo.pickedPoint);

            // Case Prop
            let prop = this.main.level.props.find(p => { return p === pickInfo.pickedMesh.parent; });
            if (prop) {
                // Case picking already selected Prop
                if (this.selectedItem && prop === this.selectedItem) {
                    // Case re click selected Prop
                    if (performance.now() - this._lastPointerUpTime > 200) {
                        this.setDraggedProp(this.selectedItem);
                    }
                }
                this.setSelectedItem(prop);
            }
        }
    }

    
    private _onPointerMove = () => {
        if (this.draggedProp) {
            // Pick any mesh which is not the dragged prop.
            let pickInfo = this.main.scene.pick(
                this.main.scene.pointerX,
                this.main.scene.pointerY,
                (mesh) => {
                    if (mesh.parent === this.draggedProp) {
                        return false;
                    }
                    return true;
                }
            );

            if (pickInfo && pickInfo.pickedPoint) {
                this.draggedProp.setIsVisible(true);
                this.draggedProp.position.x = pickInfo.pickedPoint.x;
                this.draggedProp.position.y = pickInfo.pickedPoint.y;
                this.draggedProp.position.z = pickInfo.pickedPoint.z;
            }
            else {
                this.draggedProp.setIsVisible(false);
            }
        }
    }

    private _onPointerUp = () => {
        // Exit Prop drag mode.
        if (this.draggedProp) {
            this.dropDraggedProp();
        }

        let pickInfo = this.main.scene.pick(this.main.scene.pointerX, this.main.scene.pointerY);
        if (pickInfo && pickInfo.pickedPoint) {
            let deltaPos = BABYLON.Vector3.DistanceSquared(pickInfo.pickedPoint, this._pointerDownPos);
            if (deltaPos < 0.5 * 0.5) {
                let pickedMesh = pickInfo.pickedMesh;
                if (pickedMesh === this.turnRoadLeftButton) {
                    if (this.selectedItem instanceof Road) {
                        this.selectedItem.dir = (this.selectedItem.dir - 1 + 4) % 4;
                        this.lastUsedDirection = this.selectedItem.dir;
                        this.main.level.saveToLocalStorage();
                    }
                }
                else if (pickedMesh === this.turnRoadRightButton) {
                    if (this.selectedItem instanceof Road) {
                        this.selectedItem.dir = (this.selectedItem.dir + 1 + 4) % 4;
                        this.lastUsedDirection = this.selectedItem.dir;
                        this.main.level.saveToLocalStorage();
                    }
                }
                else {
                    // Case Select Road
                    let road = this.main.level.roads.find(r => { return r.mesh === pickInfo.pickedMesh; });
                    if (road) {
                        if (this.selectedItem && road === this.selectedItem) {
                            if (performance.now() - this._lastPointerUpTime < 200) {
                                this.main.animateCamera(
                                    new BABYLON.Vector3(
                                        this.selectedItem.i * 10,
                                        0,
                                        this.selectedItem.j * 10
                                    ),
                                    0.5
                                );
                            }
                        }
                        this.setSelectedItem(road);
                    }
                    else {
                        // Case Select Prop
                        let prop = this.main.level.props.find(p => { return p === pickInfo.pickedMesh.parent; });
                        if (prop) {
                            // Case picking already selected Prop
                            if (this.selectedItem && prop === this.selectedItem) {
                                // Case double-click selected Prop
                                if (performance.now() - this._lastPointerUpTime < 200) {
                                    this.main.animateCamera(
                                        new BABYLON.Vector3(
                                            this.selectedItem.position.x,
                                            0,
                                            this.selectedItem.position.z
                                        ),
                                        0.5
                                    );
                                }
                            }
                            this.setSelectedItem(prop);
                        }
                        else {
                            this.setSelectedItem(undefined);
                        }
                    }
                }
            }
            else {
                if (this.draggedRoadType != RoadType.None) {
                    let road = this.main.level.roads.find(r => { return r.mesh === pickInfo.pickedMesh; });
                    if (road) {
                        if (road.roadType === RoadType.Empty) {
                            road.dir = this.lastUsedDirection;
                        }
                        road.setRoadType(this.draggedRoadType);
                        this.main.level.saveToLocalStorage();
                    }
                    this.setSelectedItem(road);
                }
            }
        }
        else {
            this.setSelectedItem(undefined);
        }
        this._lastPointerUpTime = performance.now();
        this.draggedRoadType = RoadType.None;
    }

    private _update = () => {
        if (this.selectedItem) {
            let right = this.main.camera.getDirection(BABYLON.Axis.X);
            let dir = this.main.camera.getDirection(BABYLON.Axis.Z);
            dir.y = 0;
            
            VMath.QuaternionFromZXAxisToRef(dir, right, this.selectedRoadButtonsContainer.rotationQuaternion);
        }
    }
}