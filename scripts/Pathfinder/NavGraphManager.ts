class NavGraphManager {

    public static Instance: NavGraphManager;

    private _navGraphZero: NavGraph;
    private _navGraphs: Map<number, NavGraph>;

    constructor() {
        NavGraphManager.Instance = this;
        this._navGraphs = new Map<number, NavGraph>();
        this._navGraphZero = new NavGraph();
        this._navGraphZero.offset = 0;
        this._navGraphs.set(0, this._navGraphZero);
    }

    public static GetForRadius(radius: number): NavGraph {
        return NavGraphManager.Instance.getForOffset(radius);
    }

    public getForOffset(offset: number): NavGraph {
        let navGraph = this._navGraphs.get(offset);
        if (!navGraph) {
            navGraph = new NavGraph();
            navGraph.offset = offset;
            navGraph.obstacles = this._navGraphZero.obstacles.clone();
            this._navGraphs.set(offset, navGraph);
        }
        return navGraph;
    }

    public static AddObstacle(obstacle: Obstacle): void {
        if (!obstacle) {
            return;
        }
        return NavGraphManager.Instance.addObstacle(obstacle);
    }

    public addObstacle(obstacle: Obstacle): void {
        if (!obstacle) {
            return;
        }
        this._navGraphs.forEach(
            (navGraph) => {
                navGraph.obstacles.push(obstacle);
            }
        )
    }

    public static RemoveObstacle(obstacle: Obstacle): void {
        return NavGraphManager.Instance.removeObstacle(obstacle);
    }

    public removeObstacle(obstacle: Obstacle): void {
        this._navGraphs.forEach(
            (navGraph) => {
                navGraph.obstacles.remove(obstacle);
            }
        )
    }
}