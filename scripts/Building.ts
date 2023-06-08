/// <reference path="Prop.ts"/>

class Building extends Prop {
    
    public elementIndexes: number[] = [1, 1, 2, 3, 2, 3, 1];
    public get groundIndex(): number {
        return this.elementIndexes[0];
    }
    public get roofIndex(): number {
        return this.elementIndexes[this.elementIndexes.length - 1];
    }

    constructor(_modelName: string, level: Level) {
        super(_modelName, level);
        this.elementIndexes = [1];
        let h = Math.floor(Math.random() * 5);
        for (let i = 0; i < h; i++) {
            this.elementIndexes.push(Math.floor(Math.random() * 3 + 1));
        }
        this.elementIndexes.push(1);
    }

    public async instantiate(): Promise<void> {
        return new Promise<void>(resolve => {
            BABYLON.SceneLoader.ImportMesh("", "datas/meshes/" + this._modelName + ".babylon", "", this.scene, (meshes) => {

                meshes.forEach(mesh => {
                    if (mesh instanceof BABYLON.Mesh) {
                        let material = mesh.material;
                        if (material instanceof BABYLON.MultiMaterial) {
                            for (let i = 0; i < material.subMaterials.length; i++) {
                                let subMat = material.subMaterials[i];
                                if (subMat instanceof BABYLON.PBRMaterial) {
                                    let toonMat = new ToonMaterial(subMat.name + "-3-toon", this.scene);
                                    toonMat.setDiffuseColor(subMat.albedoColor);
                                    material.subMaterials[i] = toonMat;
                                }
                            }
                        }
                    }
                });

                let groundMeshBase = meshes.find(m => { return m.name === this._modelName + "-ground-" + this.groundIndex.toFixed(0); });
                if (groundMeshBase instanceof BABYLON.Mesh) {
                    let mesh = groundMeshBase.clone();
                    mesh.position.copyFromFloats(0, 0, 0);
                    mesh.parent = this;

                    groundMeshBase.getChildMeshes().forEach(groundMeshChildBase => {
                        if (groundMeshChildBase instanceof BABYLON.Mesh) {
                            let mesh = groundMeshChildBase.clone();
                            mesh.position.copyFromFloats(0, 0, 0);
                            mesh.parent = this;
                        }
                    })
                }

                for (let n = 1; n < this.elementIndexes.length - 1; n++) {
                    let elementIndex = this.elementIndexes[n];
                    let floorMeshBase = meshes.find(m => { return m.name === this._modelName + "-floor-" + elementIndex.toFixed(0); });
                    if (floorMeshBase instanceof BABYLON.Mesh) {
                        let y = 2.7 + 3 * (n - 1);

                        let mesh = floorMeshBase.clone();
                        mesh.position.copyFromFloats(0, y, 0);
                        mesh.parent = this;

                        floorMeshBase.getChildMeshes().forEach(floorMeshChildBase => {
                            if (floorMeshChildBase instanceof BABYLON.Mesh) {
                                let mesh = floorMeshChildBase.clone();
                                mesh.position.copyFromFloats(0, y, 0);
                                mesh.parent = this;
                            }
                        })
                    }
                }

                let roofMeshBase = meshes.find(m => { return m.name === this._modelName + "-roof-" + this.roofIndex.toFixed(0); });
                if (roofMeshBase instanceof BABYLON.Mesh) {
                    let y = 2.7 + 3 * (this.elementIndexes.length - 2);

                    let mesh = roofMeshBase.clone();
                    mesh.position.copyFromFloats(0, y, 0);
                    mesh.parent = this;

                    roofMeshBase.getChildMeshes().forEach(roofMeshChildBase => {
                        if (roofMeshChildBase instanceof BABYLON.Mesh) {
                            let mesh = roofMeshChildBase.clone();
                            mesh.position.copyFromFloats(0, y, 0);
                            mesh.parent = this;
                        }
                    })
                }

                meshes.forEach(mesh => {
                    mesh.dispose();
                });

                this._instantiated = true;
                resolve();
            });
        });
    }
}