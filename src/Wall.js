/**
 * Clase que representa un muro
 */
class Wall extends THREE.Object3D {
    constructor() {
        super();

        // Materiales del muro y del contorno
        var wallMaterial = new THREE.MeshPhongMaterial({color: 0x05135a});

        // Geometria del muro y del contorno
        var wallGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
        wallGeometry.translate(0, 0.5, 0);
        
        var wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);

        this.add(wallMesh);
    }
}