/**
 * Clase que representa al PacMan.
 */
class PacMan extends Character3D {
    /**
     * Constructor de la clase. Crea un nuevo modelo del PacMan junto con la
     * animacion de la boca y el sonido del movimiento.
     * @param {number} speed Velocidad a la que se mueve el personaje.
     */
    constructor(speed) {
        super(speed, orientations.LEFT);

        // Materiales del cuerpo y el ojo
        var bodyMaterial = new THREE.MeshPhongMaterial({color: 0xF2F21A});
        var eyeMaterial = new THREE.MeshPhongMaterial({color: 0x000000});

        // El material del cuerpo se tiene que poder ver por dentro y por fuera
        bodyMaterial.side = THREE.DoubleSide;

        // Crear parte superior e inferior de la boca
        var radiusMouth = 0.5;
        var segmentsMouth = 25;
        var uppperMouthGeometry = new THREE.SphereBufferGeometry(radiusMouth, segmentsMouth, segmentsMouth, 0, Math.PI);

        uppperMouthGeometry.rotateX(-Math.PI / 2);

        var lowerMouthGeometry = uppperMouthGeometry.clone();
        lowerMouthGeometry.rotateX(Math.PI);

        var upperMouthMesh = new THREE.Mesh(uppperMouthGeometry, bodyMaterial);
        var lowerMouthMesh = new THREE.Mesh(lowerMouthGeometry, bodyMaterial);

        // Crear y posicionar los ojos
        var radiusEyes = 0.05;
        var segmentsEyes = 15;
        var eyeAngle = (40 * Math.PI) / 180;

        var leftEyeGeometry = new THREE.SphereBufferGeometry(radiusEyes, segmentsEyes, segmentsEyes);
        var rightEyeGeometry = leftEyeGeometry.clone();
        
        var leftEyeMesh = new THREE.Mesh(leftEyeGeometry, eyeMaterial);
        var rightEyeMesh = new THREE.Mesh(rightEyeGeometry, eyeMaterial);

        leftEyeMesh.position.set(-0.1, radiusMouth * Math.sin(eyeAngle), -radiusMouth * Math.cos(eyeAngle));
        rightEyeMesh.position.set(-0.1, radiusMouth * Math.sin(eyeAngle), radiusMouth * Math.cos(eyeAngle));

        // Crear nodo que representa al personaje
        var pacmanNode = new THREE.Object3D();
        
        pacmanNode.add(upperMouthMesh);
        pacmanNode.add(lowerMouthMesh);
        pacmanNode.add(leftEyeMesh);
        pacmanNode.add(rightEyeMesh);
        pacmanNode.position.y += 0.5;

        this.add(pacmanNode);

        // Animacion de la boca
        var initMouthPosition = {alfa: 0};
        var endMouthPosition = {alfa: Math.PI / 6};
        
        this.mouthAnimation = new TWEEN.Tween(initMouthPosition)
            .to(endMouthPosition, 250)
            .easing(TWEEN.Easing.Linear.None)
            .onUpdate(() => {
                upperMouthMesh.rotation.z = initMouthPosition.alfa;
                lowerMouthMesh.rotation.z = -initMouthPosition.alfa;
            })
            .repeat(Infinity)
            .yoyo(true)
            .start();
        
        // Sonido del personaje al moverse
        this.chompSound = new Audio("audio/pacman_chomp.wav");
        this.chompSound.preload = "auto";
        this.chompSound.volume = 0.5;
    }

    /**
     * Metodo que actualiza el estado del personaje (su posicion, rotacion y la
     * animacion de la boca).
     * @param {boolean} collided Boleano que indica si el personaje ha colisionado
     * o no con algun muro.
     */
    update(collided) {
        // Obtener incremento en la distancia recorrida desde la ultima acutalizacion
        var currentTime = Date.now();
        var deltaTime = (currentTime - this.lastUpdateTime) / 1000;
        var distanceIncrement = this.speed * deltaTime;

        // Rotar personaje de acuerdo a su orientacion
        this.updateOrientation();

        // Controlar estado de la animacion
        if (collided && !this.mouthAnimation.isPaused()) {
            this.mouthAnimation.pause();
        } else if (!collided && this.mouthAnimation.isPaused()){
            this.mouthAnimation.resume();
        }
        
        // Si no ha colisionado, actualizar posicion, reproducir sonido y actualizar
        // animacion de la boca
        if (!collided) {
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

            this.chompSound.play();
            
            TWEEN.update();
        } else {
            // Pausar sonido en caso de que haya colisionado
            this.chompSound.pause();
        }

        this.lastUpdateTime = currentTime;
    }
}