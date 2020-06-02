/**
 * Clase que representa un fantasma
 */
class Ghost extends Character3D {
    constructor(ghostColor) {
        super(2, orientations.LEFT);
        this.spawned = false;
        this.edible = false;
        this.ticksChange = 0;

        // Crear materiales
        this.ghostMaterial = new THREE.MeshPhongMaterial({color: ghostColor});
        this.edibleMaterials = [
            new THREE.MeshPhongMaterial({color: 0x05135A}),
            new THREE.MeshPhongMaterial({color: 0xEEEEEE})
        ];
        this.nextEdibleMaterial = 0;
        var eyeMaterial = new THREE.MeshPhongMaterial({color: 0xffffff});
        var pupilMaterial = new THREE.MeshPhongMaterial({color: 0x0000ff});

        // Crear cabeza del fantasma
        var radius = 0.5;
        var segments = 25;
        var head = new THREE.SphereBufferGeometry(radius, segments, segments, 0, Math.PI);

        this.headMesh = new THREE.Mesh(head, this.ghostMaterial);

        this.headMesh.rotation.x = -Math.PI / 2;
        this.headMesh.position.y += 0.5;

        // Crear cuerpo
        var boydGeometry = new THREE.CylinderBufferGeometry(radius, radius, 0.52, segments)
        this.bodyMesh = new THREE.Mesh(boydGeometry, this.ghostMaterial);

        this.bodyMesh.position.y += 0.25;

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
        
        this.ghost.add(this.headMesh);
        this.ghost.add(this.bodyMesh);
        this.ghost.add(leftEyeMesh);
        this.ghost.add(rightEyeMesh);
        this.ghost.rotation.y = Math.PI/2;

        this.add(this.ghost);

        var init = {x: 0};
        var end = {x: 1};
        this.ediblePeriod = new TWEEN.Tween(init)
            .to(end, 7000)
            .onUpdate(() => {
                if (init.x > 0.7) {
                    this.ticksChange++;

                    if (this.ticksChange > 100) {
                        this.ticksChange = 0;
                        this.bodyMesh.material = this.edibleMaterials[this.nextEdibleMaterial];
                        this.headMesh.material = this.edibleMaterials[this.nextEdibleMaterial];
                        this.nextEdibleMaterial = (this.nextEdibleMaterial + 1) % this.edibleMaterials.length;
                    }
                }
            })
            .onComplete(() => {
                this.edible = false;
                this.headMesh.material = this.ghostMaterial;
                this.bodyMesh.material = this.ghostMaterial;
                console.log("Ghosts are no longer edible!");
            });
    }
    
    getSpawned() {
        return this.spawned;
    }
    setSpawned(spawned) {
        this.spawned = spawned;
    }

    getEdible() {
        return this.edible;
    }

    setEdible(edible) {
        this.edible = edible;

        if (this.edible) {
            this.nextEdibleMaterial = 0;
            this.headMesh.material = this.edibleMaterials[this.nextEdibleMaterial];
            this.bodyMesh.material = this.edibleMaterials[this.nextEdibleMaterial];
            this.nextEdibleMaterial++;
            this.ediblePeriod.start();
        } else {
            this.ediblePeriod.stop();
            this.headMesh.material = this.ghostMaterial;
            this.bodyMesh.material = this.ghostMaterial;
        }
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

        TWEEN.update();

        this.lastUpdateTime = currentTime;
    }
}