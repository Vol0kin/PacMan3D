/**
 * Clase que representa un muro
 */
class Wall extends THREE.Object3D {
    /**
     * Constructor de la clase. Crea un nuevo muro.
     */
    constructor() {
        super();

        // Materiales del muro
        var wallMaterial = new THREE.MeshPhongMaterial({color: 0x05135a});

        // Geometria del muro
        var height = 0.75;
        var wallGeometry = new THREE.BoxBufferGeometry(1, height, 1);
        wallGeometry.translate(0, height/2, 0);

        var wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);

        this.add(wallMesh);
    }
}