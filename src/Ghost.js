/**
 * Clase que representa un fantasma.
 */
class Ghost extends Character3D {
    /**
     * Constructor de la clase. Crea un nuevo fantasma de un determinado color
     * junto con la animacion de cuando es comestible.
     * @param {number} speed Velocidad a la que se mueve el personaje.
     * @param {number} ghostColor Numero hexadecimal que representa el color base
     * del fantasma.
     */
    constructor(speed, ghostColor) {
        super(speed, orientations.LEFT);
        
        ////////////////////////////////////////////////////////////////////////
        // Establecer atributos

        // Indica si el fantasma ha spawneado
        this.spawned = false;

        // Indica si el fantasma es comestible o no
        this.edible = false;

        // Este atributo se utiliza en la animacino de cuando es comestible para
        // crear el efeto de intermitencia entre dos materiales
        // Cuenta el numero de llamadas que se han producido al metodo de acualizar
        // la animacion a partir de cierto momento
        this.ticksChange = 0;

        // Materiales base y del estado comestible del fantasma
        this.ghostMaterial = new THREE.MeshPhongMaterial({color: ghostColor});
        this.edibleMaterials = [
            new THREE.MeshPhongMaterial({color: 0x0037C2}),
            new THREE.MeshPhongMaterial({color: 0xEEEEEE})
        ];

        // Siguiente material que tendra el fantasma durante el estado de comestible
        this.nextEdibleMaterial = 0;

        // Materiales de los ojos
        var eyeMaterial = new THREE.MeshPhongMaterial({color: 0xffffff});
        var pupilMaterial = new THREE.MeshPhongMaterial({color: 0x0000ff});

        // Crear cabeza del fantasma y posicionarla
        var radius = 0.5;
        var segments = 25;
        var head = new THREE.SphereBufferGeometry(radius, segments, segments, 0, Math.PI);

        this.headMesh = new THREE.Mesh(head, this.ghostMaterial);

        this.headMesh.rotation.x = -Math.PI / 2;
        this.headMesh.position.y += 0.5;

        // Crear cuerpo y posicionarlo
        var boydGeometry = new THREE.CylinderBufferGeometry(radius, radius, 0.52, segments)
        this.bodyMesh = new THREE.Mesh(boydGeometry, this.ghostMaterial);

        this.bodyMesh.position.y += 0.25;

        // Crear ojos y posicionarlos
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

        // Nodo que representa al fantasma
        var ghostMesh = new THREE.Object3D();
        
        ghostMesh.add(this.headMesh);
        ghostMesh.add(this.bodyMesh);
        ghostMesh.add(leftEyeMesh);
        ghostMesh.add(rightEyeMesh);
        ghostMesh.rotation.y = Math.PI/2;

        this.add(ghostMesh);

        // Animacion que se lanza cuando el fantasma es comestible
        // Tiene una duaracion de 8 segundos
        var init = {x: 0};
        var end = {x: 1};

        this.ediblePeriod = new TWEEN.Tween(init)
            .to(end, 8000)
            .onUpdate(() => {
                // Cuando haya pasado el 70% del tiempo en el que el fantasma
                // es comestible, cada 100 ticks (llamadas a este metodo) se
                // cambia el color del fantasma, dando una sensacion de intermitencia
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
                // Indicar que el fantasma ya no es comestible y restaurar
                // material base
                this.edible = false;
                this._restoreBaseMaterial();

                console.log("Ghost is no longer edible!");
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

    /**
     * Metodo que establece si el fantasma es comestible o no e inicia o detiene
     * la animacion en funcion del valor de entrada.
     * @param {boolean} edible Booleano que indica si el fantasma es comestible
     * o no.
     */
    setEdible(edible) {
        this.edible = edible;

        if (this.edible) {
            // Iniciar animacion con el primer material de la lista
            this.nextEdibleMaterial = 0;
            this.ticksChange = 0;

            this.headMesh.material = this.edibleMaterials[this.nextEdibleMaterial];
            this.bodyMesh.material = this.edibleMaterials[this.nextEdibleMaterial];

            this.nextEdibleMaterial++;

            this.ediblePeriod.start();
        } else {
            // Detener animacion y restaurar material base
            this.ediblePeriod.stop();
            this._restoreBaseMaterial();    
        }
    }

    /**
     * Metodo que permite restaurar el material base del fantasma.
     */
    _restoreBaseMaterial() {
        this.headMesh.material = this.ghostMaterial;
        this.bodyMesh.material = this.ghostMaterial;
    }

    /**
     * Metodo que actualiza el estado del fantasma (posicion y animacion de
     * cuando es comestible)
     */
    update() {
        // Obtener incremento en la distancia recorrida desde la ultima acutalizacion
        var currentTime = Date.now();
        var deltaTime = (currentTime - this.lastUpdateTime) / 1000;
        var distanceIncrement = this.speed * deltaTime;

        // Si el fantasma ha spawneado, actualizar posicion
        if (this.spawned) {
            // Rotar personaje de acuerdo a su orientacion
            this.updateOrientation();
    
            // Actualizar orientacion
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