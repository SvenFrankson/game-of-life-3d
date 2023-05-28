class ToonMaterial extends BABYLON.ShaderMaterial {

    constructor(name: string, scene: BABYLON.Scene) {
        super(
            name,
            scene,
            {
                vertex: "toon",
                fragment: "toon",
            },
            {
                attributes: ["position", "normal", "uv", "color"],
                uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "lightInvDirW", "diffuseColor"]
            }
        );

        this.setVector3("lightInvDirW", (new BABYLON.Vector3(0.5, 2.5, 1.5)).normalize());
    }

    private _lightInvDirW: BABYLON.Vector3 = BABYLON.Vector3.Up();
    public getLightInvDir(): BABYLON.Vector3 {
        return this._lightInvDirW;
    }

    public setLightInvDir(color: BABYLON.Vector3): void {
        this._lightInvDirW = color;
        this.setVector3("lightInvDirW", this._lightInvDirW);
    } 

    private _color: BABYLON.Color3 = BABYLON.Color3.White();
    public getColor(): BABYLON.Color3 {
        return this._color;
    }

    public setColor(color: BABYLON.Color3): void {
        this._color = color;
        this.setColor3("diffuseColor", this._color);
    } 
}