/**
 * Clase que representa un punto (grande o peque en funcion del radio)
 */
class Dot extends THREE.Object3D {
    constructor(radius) {
        super();

        var material = new THREE.MeshPhongMaterial({color: 0xfeffae});
        var geometry = new THREE.SphereBufferGeometry(radius, 15, 15);

        var mesh = new THREE.Mesh(geometry, material);

        mesh.position.y = 0.5;

        this.add(mesh)
    }
}