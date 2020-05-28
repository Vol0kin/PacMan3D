/**
 * Clase que representa al PacMan.
 */
class PacMan extends THREE.Object3D {
    constructor() {
        super();

        // Establecer orientacion
        this.orientation = orientations.DOWN;
        this.speed = 1;
        this.lastUpdateTime = Date.now();

        // Materiales del cuerpo y el ojo
        var bodyMaterial = new THREE.MeshPhongMaterial({color: 0xF2F21A});
        var eyeMaterial = new THREE.MeshPhongMaterial({color: 0x000000});

        // El material del cuerpo se tiene que poder ver por dentro y por fuera
        bodyMaterial.side = THREE.DoubleSide;

        // Crear parte superior e inferior de la boca
        var radiusMouth = 0.5;
        var segmentsMouth = 25;
        var uppperMouthGeometry = new THREE.SphereGeometry(radiusMouth, segmentsMouth, segmentsMouth, 0, Math.PI);

        uppperMouthGeometry.rotateX(-Math.PI / 2);

        var lowerMouthGeometry = uppperMouthGeometry.clone();
        lowerMouthGeometry.rotateX(Math.PI);

        var upperMouthMesh = new THREE.Mesh(uppperMouthGeometry, bodyMaterial);
        var lowerMouthMesh = new THREE.Mesh(lowerMouthGeometry, bodyMaterial);

        // Crear y posicionar los ojos
        var radiusEyes = 0.05;
        var segmentsEyes = 15;
        var eyeAngle = (40 * Math.PI) / 180;

        var leftEyeGeometry = new THREE.SphereGeometry(radiusEyes, segmentsEyes, segmentsEyes);
        var rightEyeGeometry = leftEyeGeometry.clone();
        
        var leftEyeMesh = new THREE.Mesh(leftEyeGeometry, eyeMaterial);
        var rightEyeMesh = new THREE.Mesh(rightEyeGeometry, eyeMaterial);

        leftEyeMesh.position.set(-0.1, radiusMouth * Math.sin(eyeAngle), -radiusMouth * Math.cos(eyeAngle));
        rightEyeMesh.position.set(-0.1, radiusMouth * Math.sin(eyeAngle), radiusMouth * Math.cos(eyeAngle));

        // Crear nodo que representa el PacMan
        this.pacman = new THREE.Object3D();
        
        this.pacman.add(upperMouthMesh);
        this.pacman.add(lowerMouthMesh);
        this.pacman.add(leftEyeMesh);
        this.pacman.add(rightEyeMesh);
        this.pacman.position.y += 0.5;
        this.pacman.rotation.y = -Math.PI / 2;

        this.add(this.pacman);

        // Animacion de la boca
        var initMouthPosition = {alfa: 0};
        var endMouthPosition = {alfa: Math.PI / 6};
        
        var mouthAnimation = new TWEEN.Tween(initMouthPosition)
            .to(endMouthPosition, 1000)
            .easing(TWEEN.Easing.Linear.None)
            .onUpdate(() => {
                upperMouthMesh.rotation.z = initMouthPosition.alfa;
                lowerMouthMesh.rotation.z = -initMouthPosition.alfa;
            })
            .repeat(Infinity)
            .yoyo(true)
            .start();
    }

    setOrientation(orientation) {
        this.orientation = orientation;
    }

    update() {
        // Obtener incremento de tiempo (en segundos)
        var currentTime = Date.now();
        var deltaTime = (currentTime - this.lastUpdateTime) / 1000;
        var distanceIncrement = this.speed * deltaTime;

        switch(this.orientation) {
            case orientations.UP:
                this.pacman.rotation.y = Math.PI / 2;
                this.position.z -= distanceIncrement;
                break;
            case orientations.DOWN:
                this.pacman.rotation.y = -Math.PI / 2;
                this.position.z += distanceIncrement;
                break;
            case orientations.LEFT:
                this.pacman.rotation.y = Math.PI;
                this.position.x -= distanceIncrement;
                break;
            case orientations.RIGHT:
                this.pacman.rotation.y = 0;
                this.position.x += distanceIncrement;
                break;
        }
        
        TWEEN.update();

        this.lastUpdateTime = currentTime;
    }
}