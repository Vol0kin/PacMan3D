/**
 * Clase que representa un muro
 */
class Wall extends THREE.Object3D {
    constructor() {
        super();

        // Materiales del muro y del contorno
        var wallMaterial = new THREE.MeshPhongMaterial({color: 0x000000});
        var edgesMaterial = new THREE.LineBasicMaterial({color: 0x0000ff});

        // Geometria del muro y del contorno
        var wallGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
        wallGeometry.translate(0, 0.5, 0);
        
        var edgesGeometry = new THREE.EdgesGeometry(wallGeometry);

        var line = new THREE.LineSegments(edgesGeometry, edgesMaterial);
        var wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);

        this.add(wallMesh);
        this.add(line);
    }
}