class RoadManager {

    public roadMeshes: Map<string, BABYLON.Mesh> = new Map<string, BABYLON.Mesh>();

    public async initialize(): Promise<void> {
        return new Promise<void>(resolve => {
            BABYLON.SceneLoader.ImportMesh("", "datas/meshes/roads.babylon", "", undefined, (meshes) => {
                let p = 0;
                meshes.forEach(mesh => {
                    if (mesh instanceof BABYLON.Mesh) {
                        let material = mesh.material;
                        if (material instanceof BABYLON.MultiMaterial) {
                            for (let i = 0; i < material.subMaterials.length; i++) {
                                let subMat = material.subMaterials[i];
                                if (subMat instanceof BABYLON.PBRMaterial) {
                                    let toonMat = new ToonMaterial(subMat.name, mesh.getScene());
                                    toonMat.setColor(subMat.albedoColor);
                                    material.subMaterials[i] = toonMat;
                                }
                            }
                        }
                        console.log(mesh.name);
                        this.roadMeshes.set(mesh.name, mesh);
                        mesh.position.y = - 10 - p;
                        p++;
                    }
                });
                resolve();
            });
        });
    }
}