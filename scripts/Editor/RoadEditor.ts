class RoadEditor {

    constructor(
        public main: Main
    ) {
        
    }

    public initialize(): void {
        this.main.scene.onPointerObservable.add(this._onPointerObservable)
    }

    private _pointerDownPos: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _onPointerObservable = (eventData: BABYLON.PointerInfo, eventState: BABYLON.EventState) => {
        if (eventData.pickInfo && eventData.pickInfo.pickedPoint) {
            if (eventData.type === BABYLON.PointerEventTypes.POINTERDOWN) {
                this._pointerDownPos.copyFrom(eventData.pickInfo.pickedPoint);
            }
            else if (eventData.type === BABYLON.PointerEventTypes.POINTERUP) {
                let deltaPos = BABYLON.Vector3.DistanceSquared(eventData.pickInfo.pickedPoint, this._pointerDownPos);
                if (deltaPos < 0.1 * 0.1) {
                    let road = this.main.roads.find(r => { return r.mesh === eventData.pickInfo.pickedMesh; });
                    if (road) {
                        if (eventData.event.button === 0 || eventData.event.button === 2) {
                            let offset = 1;
                            if (eventData.event.button === 2) {
                                offset = - 1;
                            }
                            let newRoadType = (road.roadType + offset + 7) % 7;
                            road.setRoadType(newRoadType);
                        }
                        else if (eventData.event.button === 1) {
                            road.r = (road.r + 1) % 4;
                        }
                    }
                }
            }
        }
    }
}