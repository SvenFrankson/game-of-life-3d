interface IRoadData {
    roadType: number;
    dir: number;
}

interface ILevelData {
    roads: IRoadData[];
}

class Level {

    public roads: Road[];

    constructor(public main: Main) {
        this.roads = [];
        for (let i = 0; i < MAX_ROAD_SIZE; i++) {
            for (let j = 0; j < MAX_ROAD_SIZE; j++) {
                this.roads[i + MAX_ROAD_SIZE * j] = new Road(i, j, 2, this.main.roadManager, this.main.scene, RoadType.Empty);
            }
        }
    }

    public instantiate(): void {
        for (let i = 0; i < MAX_ROAD_SIZE; i++) {
            for (let j = 0; j < MAX_ROAD_SIZE; j++) {
                this.roads[i + MAX_ROAD_SIZE * j].instantiate();
            }
        }
    }

    public serialize(): ILevelData {
        let roadsData: IRoadData[] = [];
        for (let i = 0; i < MAX_ROAD_SIZE; i++) {
            for (let j = 0; j < MAX_ROAD_SIZE; j++) {
                let roadData: IRoadData = {
                    roadType: this.roads[i + MAX_ROAD_SIZE * j].roadType,
                    dir: this.roads[i + MAX_ROAD_SIZE * j].dir
                }
                roadsData[i + MAX_ROAD_SIZE * j] = roadData;
            }
        }

        return {
            roads: roadsData
        };
    }

    public deserializeInPlace(data: ILevelData): void {
        for (let i = 0; i < MAX_ROAD_SIZE; i++) {
            for (let j = 0; j < MAX_ROAD_SIZE; j++) {
                let roadData = data.roads[i + MAX_ROAD_SIZE * j];
                this.roads[i + MAX_ROAD_SIZE * j].setRoadType(roadData.roadType);
                this.roads[i + MAX_ROAD_SIZE * j].dir = roadData.dir;
            }
        }
    }

    public saveToLocalStorage(): void {
        let data = this.serialize();
        window.localStorage.setItem("level-test", JSON.stringify(data));
    }

    public loadFromLocalStorage(): void {
        let dataString = window.localStorage.getItem("level-test");
        if (dataString) {
            let data = JSON.parse(dataString) as ILevelData;
            this.deserializeInPlace(data);
        }
    }
}