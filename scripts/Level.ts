interface IVector3 {
    x: number;
    y: number;
    z: number;
}

function Vector3ToIVector3(v: BABYLON.Vector3): IVector3 {
    return {
        x: v.x,
        y: v.y,
        z: v.z,
    }
}

interface IRoadData {
    roadType: number;
    dir: number;
}

interface IPropData {
    modelName: string;
    position: IVector3;
    dir: number;
    elementIndexes?: number[];
}

interface ILevelData {
    roads?: IRoadData[];
    props?: IPropData[];
}

class Level {

    public roads: Road[];
    public props: UniqueList<Prop> = new UniqueList<Prop>();
    //public grid: TerrainGrid;

    constructor(public main: Main) {
        this.roads = [];
        for (let i = 0; i < MAX_ROAD_SIZE; i++) {
            for (let j = 0; j < MAX_ROAD_SIZE; j++) {
                this.roads[i + MAX_ROAD_SIZE * j] = new Road(i, j, 2, this.main.roadManager, this.main.scene, RoadType.Empty);
            }
        }
        //this.grid = new TerrainGrid(MAX_ROAD_SIZE * 10, MAX_ROAD_SIZE * 10);
        //this.grid.updateDebugMesh();
    }

    public async instantiate(): Promise<void> {
        for (let i = 0; i < MAX_ROAD_SIZE; i++) {
            for (let j = 0; j < MAX_ROAD_SIZE; j++) {
                this.roads[i + MAX_ROAD_SIZE * j].instantiate();
            }
        }

        for (let i = 0; i < this.props.length; i++) {
            await this.props.get(i).instantiate();
        }

        this.refreshGrid();
    }
    
    public refreshGrid(): void {
        //this.grid.reset();

        this.props.forEach(prop => {
            if (prop.obstacle) {
                NavGraphManager.AddObstacle(prop.obstacle);
            }
        });

        NavGraphManager.GetForRadius(1).update();
        NavGraphManager.GetForRadius(1).displayGraph();
    }

    public serialize(): ILevelData {
        let roadsData: IRoadData[] = [];
        for (let i = 0; i < MAX_ROAD_SIZE; i++) {
            for (let j = 0; j < MAX_ROAD_SIZE; j++) {
                let roadData: IRoadData = {
                    roadType: this.roads[i + MAX_ROAD_SIZE * j].roadType,
                    dir: this.roads[i + MAX_ROAD_SIZE * j].dir
                };
                roadsData[i + MAX_ROAD_SIZE * j] = roadData;
            }
        }

        let propsData: IPropData[] = [];
        for (let i = 0; i < this.props.length; i++) {
            let prop = this.props.get(i);
            let propData: IPropData = {
                modelName: prop.modelName,
                position: Vector3ToIVector3(prop.position),
                dir: prop.dir
            };
            if (prop instanceof Building) {
                propData.elementIndexes = prop.elementIndexes;
            }
            propsData[i] = propData;
        }

        return {
            roads: roadsData,
            props: propsData
        };
    }

    public deserializeInPlace(data: ILevelData): void {
        if (data) {
            if (data.roads) {
                for (let i = 0; i < MAX_ROAD_SIZE; i++) {
                    for (let j = 0; j < MAX_ROAD_SIZE; j++) {
                        let roadData = data.roads[i + MAX_ROAD_SIZE * j];
                        this.roads[i + MAX_ROAD_SIZE * j].setRoadType(roadData.roadType);
                        this.roads[i + MAX_ROAD_SIZE * j].dir = roadData.dir;
                    }
                }
            }
    
            if (data.props) {
                for (let i = 0; i < data.props.length; i++) {
                    let propData = data.props[i];
                    let prop = Prop.Create(propData.modelName, this);
                    prop.position.x = propData.position.x;
                    prop.position.y = propData.position.y;
                    prop.position.z = propData.position.z;
                    prop.dir = propData.dir;
                    if (prop instanceof Building) {
                        prop.elementIndexes = propData.elementIndexes;
                    }
                }
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