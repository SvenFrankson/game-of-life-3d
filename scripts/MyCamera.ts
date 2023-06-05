class MyCamera extends BABYLON.ArcRotateCamera {

    public get scene(): BABYLON.Scene {
        return this._scene;
    }

    constructor(name: string, alpha: number, beta: number, radius: number, target: BABYLON.Vector3, scene?: BABYLON.Scene, setActiveOnSceneIfNoneActive?: boolean) {
        super(name, alpha, beta, radius, target, scene, setActiveOnSceneIfNoneActive);
    }
}