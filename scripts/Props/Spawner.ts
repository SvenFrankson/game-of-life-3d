class Spawner extends Prop {
    
    public get engine(): BABYLON.Engine {
        return this.scene.getEngine();
    }

    constructor(level: Level) {
        super("spawner", level);
        this.hasObstacle = false;
    }

    public start(): void {
        console.log("Start spawner");
        this.scene.onBeforeRenderObservable.add(this._update);
    }

    private _timer: number = 0;
    private _update = () => {
        let dt = this.engine.getDeltaTime() / 1000;
        this._timer += dt;
        if (this._timer > 3) {
            this._timer = 0;
            let creep = new Creep(this.level);
            creep.pos2D = this.pos2D;
            creep.instantiate();
            creep.start();
        }
    }
}