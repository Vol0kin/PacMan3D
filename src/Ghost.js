/**
 * Clase que representa un fantasma
 */
class Ghost extends THREE.Object3D {
    constructor(ghostColor) {
        // Llamar al constructor de la superclase
        super();

        // Crear materiales
        var ghostMaterial = new THREE.MeshPhongMaterial({color: ghostColor});
        var eyeMaterial = new THREE.MeshPhongMaterial({color: 0xffffff});
        var pupilMaterial = new THREE.MeshPhongMaterial({color: 0x0000ff});

        // Crear cabeza del fantasma
        var radius = 0.5;
        var segments = 25;
        var head = new THREE.SphereGeometry(radius, segments, segments, 0, Math.PI);

        var headMesh = new THREE.Mesh(head, ghostMaterial);

        headMesh.rotation.x = -Math.PI / 2;
        headMesh.position.y += 0.5;

        // Crear cuerpo
        var boydGeometry = new THREE.CylinderGeometry(radius, radius, 0.52, segments)
        var bodyMesh = new THREE.Mesh(boydGeometry, ghostMaterial);

        bodyMesh.position.y += 0.25;

        // Crear ojos
        var eyeGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, segments);

        eyeGeometry.scale(0.15, 0.5, 0.4);
        eyeGeometry.rotateX(Math.PI/2);
        eyeGeometry.translate(-0.15, 0.5, 0.5);

        var pupilGeometry = eyeGeometry.clone();

        pupilGeometry.scale(2/3, 2/3, 1);
        pupilGeometry.translate(-0.05, 0.175, 0.025);

        var eyeMesh = new THREE.Mesh(eyeGeometry, eyeMaterial);
        var pupilMesh = new THREE.Mesh(pupilGeometry, pupilMaterial);

        var leftEyeMesh = new THREE.Object3D();
        leftEyeMesh.add(eyeMesh);
        leftEyeMesh.add(pupilMesh);

        var rightEyeMesh = leftEyeMesh.clone();
        rightEyeMesh.position.x += 0.3;

        this.add(headMesh);
        this.add(bodyMesh);
        this.add(leftEyeMesh);
        this.add(rightEyeMesh)
    }

    update() {

    }
}