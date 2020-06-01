/**
 * Clase que representa un fantasma
 */
class Ghost extends Character3D {
    constructor(ghostColor) {
        super(2, orientations.LEFT);
        this.spawned = false;

        // Crear materiales
        var ghostMaterial = new THREE.MeshPhongMaterial({color: ghostColor});
        var eyeMaterial = new THREE.MeshPhongMaterial({color: 0xffffff});
        var pupilMaterial = new THREE.MeshPhongMaterial({color: 0x0000ff});

        // Crear cabeza del fantasma
        var radius = 0.5;
        var segments = 25;
        var head = new THREE.SphereBufferGeometry(radius, segments, segments, 0, Math.PI);

        var headMesh = new THREE.Mesh(head, ghostMaterial);

        headMesh.rotation.x = -Math.PI / 2;
        headMesh.position.y += 0.5;

        // Crear cuerpo
        var boydGeometry = new THREE.CylinderBufferGeometry(radius, radius, 0.52, segments)
        var bodyMesh = new THREE.Mesh(boydGeometry, ghostMaterial);

        bodyMesh.position.y += 0.25;

        // Crear ojos
        var eyeGeometry = new THREE.CylinderBufferGeometry(0.5, 0.5, 0.1, segments);

        eyeGeometry.scale(0.15, 0.5, 0.4);
        eyeGeometry.rotateX(-Math.PI/2);
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

        this.ghost = new THREE.Object3D();
        
        this.ghost.add(headMesh);
        this.ghost.add(bodyMesh);
        this.ghost.add(leftEyeMesh);
        this.ghost.add(rightEyeMesh);
        this.ghost.rotation.y = Math.PI/2;

        this.add(this.ghost);
    }

    setSpawned(spawned) {
        this.spawned = spawned;
    }

    getSpawned() {
        return this.spawned;
    }

    update() {
        // Obtener incremento en la distancia recorrida desde la ultima acutalizacion
        var currentTime = Date.now();
        var deltaTime = (currentTime - this.lastUpdateTime) / 1000;
        var distanceIncrement = this.speed * deltaTime;

        if (this.spawned) {

            this.updateOrientation();
    
            switch(this.orientation) {
                case orientations.UP:
                    this.position.z -= distanceIncrement;
                    break;
                case orientations.DOWN:
                    this.position.z += distanceIncrement;
                    break;
                case orientations.LEFT:
                    this.position.x -= distanceIncrement;
                    break;
                case orientations.RIGHT:
                    this.position.x += distanceIncrement;
                    break;
            }
        }

        this.lastUpdateTime = currentTime;
    }
}