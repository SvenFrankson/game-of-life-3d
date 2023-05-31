class ToonMaterial extends BABYLON.ShaderMaterial {

    constructor(name: string, public scene: BABYLON.Scene) {
        super(
            name,
            scene,
            {
                vertex: "toon",
                fragment: "toon",
            },
            {
                attributes: ["position", "normal", "uv", "color"],
                uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "lightInvDirW", "diffuseColor"],
                defines: ["#define INSTANCES"]
            }
        );

        this.setVector3("lightInvDirW", this._lightInvDirW);
        this.setColor3("diffuseColor", this._color);

        this.scene.onBeforeRenderObservable.add(this.update);
    }

    public update = () => {
        let lights = this.scene.lights;
        
        for (let i = 0; i < lights.length; i++) {
            let light = lights[i];
            if (light instanceof BABYLON.HemisphericLight) {
                this.setLightInvDir(light.direction);
            }
        }
    }

    private _lightInvDirW: BABYLON.Vector3 = BABYLON.Vector3.Up();
    public getLightInvDir(): BABYLON.Vector3 {
        return this._lightInvDirW;
    }

    public setLightInvDir(lightInvDirW: BABYLON.Vector3): void {
        if (BABYLON.Vector3.DistanceSquared(lightInvDirW, this._lightInvDirW) > 0) {
            this._lightInvDirW.copyFrom(lightInvDirW);
            this.setVector3("lightInvDirW", this._lightInvDirW);
        }
    } 

    private _color: BABYLON.Color3 = BABYLON.Color3.White();
    public getColor(): BABYLON.Color3 {
        return this._color;
    }

    public setColor(color: BABYLON.Color3): void {
        if (color.r != this._color.r || color.g != this._color.g || color.b != this._color.b) {
            this._color.copyFrom(color);
            this.setColor3("diffuseColor", this._color);
        }
    } 
}