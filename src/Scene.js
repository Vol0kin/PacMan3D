/**
 * Clase que representa la escena.
 */
class Scene extends THREE.Scene {
    /**
     * Constructor de la clase. Crea una nueva escena.
     * @param {canvas} myCanvas Canvas en el que se va a pintar la escena.
     */
    constructor (myCanvas) {
        super();

        // Crear el renderizador para visualizar la escena
        this.renderer = this.createRenderer(myCanvas);

        // Crear objeto que contiene informacion del juego
        this.game = new GameUtils();

        // Puntos de spawn del PacMan y de los fantasmas
        this.pacmanSpawnPoint = new THREE.Vector3(0, 0, 0);
        this.ghostSpawnPoint = new THREE.Vector3(0, 0, 0);

        // Crear el mapa
        // Guarda la informacion en this.objectsMap
        this.objectsMap = [];
        this.createMap();

        // Crear el suelo
        this.createGround();

        // Crear las luces
        this.createLights();

        // Atributo que indica si el PacMan puede moverse
        this.canMovePacman = false;

        // Atributo que indica el numero de ticks que han pasado desde la ultima vez
        // que un fantasma escogio una nueva direccion
        this.ticksDirectionChange = [0, 0, 0, 0];

        // Crear y posicionar PacMan
        this.pacman = new PacMan(this.game.getPacmanSpeed());
        this.pacman.position.set(this.pacmanSpawnPoint.x, this.pacmanSpawnPoint.y, this.pacmanSpawnPoint.z);
        this.add(this.pacman);

        // Crear y posicionar fantasmas
        this.ghosts = [
            new Ghost(this.game.getGhostSpeed(), 0xFF0000),
            new Ghost(this.game.getGhostSpeed(), 0xFFA9E0),
            new Ghost(this.game.getGhostSpeed(), 0x1AF2EF),
            new Ghost(this.game.getGhostSpeed(), 0xFFBE29)
        ];

        this.ghosts.forEach((ghost) => {
            ghost.position.set(this.ghostSpawnPoint.x, this.ghostSpawnPoint.y, this.ghostSpawnPoint.z);
        });

        // Crear camaras
        this.createCameras();
        
        // Escribir puntuacion inicial
        document.getElementById('Score').textContent = this.game.getScore();

        // Crear imagenes que representan la vida
        for (let i = 0; i < this.game.getRemainingLives(); i++) {
            let life = document.createElement("img");
            life.src = "img/pacman_icon.png";
            document.getElementById("lives").appendChild(life);
        }

        ////////////////////////////////////////////////////////////////////////
        // ANIMACIONES

        // Animacion 1: Spawnear fantasmas
        var initSpawn = {x: 0};
        var end = {x: 1};

        // Indice del siguiente fantasma que va a aparecer en la escena
        this.nextGhost = 0;

        // Animacion que controla la aparicion inicial de los fantasmas
        this.spawnGhosts = new TWEEN.Tween(initSpawn)
            .to(end, 3000)
            .easing(TWEEN.Easing.Linear.None)
            .onUpdate(() => {
                if (initSpawn.x == end.x) {
                    this.add(this.ghosts[this.nextGhost]);
                    this._spawnGhost(this.ghosts[this.nextGhost]);
                    this.nextGhost++;
                }
            })
            .onComplete(() => {
                console.log('All ghosts spawned!')
            });

        // Animacion 2: Esperar a comenzar la partida
        var initGameStart = {x: 0};

        // Reproducir audio de comienzo de partida
        this.game.playBeginningAudio();

        var waitGameStart = new TWEEN.Tween(initGameStart)
            .to(end, 4500)
            .easing(TWEEN.Easing.Linear.None)
            .onComplete(() =>{
                this.canMovePacman = true;
                this.startGhostSpawn();
            }).start();
        
        // Animacion 3: Esperar antes de hacer reaparecer los fantasmas
        var initBeforeSpawnGhosts = {x: 0};

        this.waitBeforeGhostsRespawn = new TWEEN.Tween(initBeforeSpawnGhosts)
            .to(end, 2000)
            .easing(TWEEN.Easing.Linear.None)
            .onComplete(() => {
                this.canMovePacman = true;
                this.startGhostSpawn();
            });
    }

    /**
     * Metodo que crea las camaras, una en perspectiva que va a seguir al PacMan
     * y una ortogonal que mostrará el mapa
     */
    createCameras() {
        // Crear camara en perspectiva que seguira al PacMan
        // Posicionarla, indicar hacia donde mira e insertarla en la escena
        this.pacmanCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        this.pacmanCamera.position.set(this.pacman.position.x, 10, this.pacman.position.z + 10);
        this.pacmanCamera.lookAt(this.pacman.position);
        this.add(this.pacmanCamera);

        // Obtener tamaños de las vistas en los ejes X, Y
        var viewSizeX = this.objectsMap[0].length;
        var viewSizeY = this.objectsMap.length; 

        // Crear camara ortogonal, posicionarla correctamente para que mire hacia abajo
        // e insertarla en la escena
        this.mapCamera = new THREE.OrthographicCamera(-viewSizeX / 2, viewSizeX / 2,
            viewSizeY / 2, - viewSizeY / 2, 1, 1000);
        
        this.mapCamera.position.set(13.5, 2, 15);
        this.mapCamera.lookAt(13.5, 0, 15);
        this.add(this.mapCamera);
    }
    
    /**
     * Metodo que crea el suelo y lo inserta en la escena.
     */
    createGround() {
        var groundGeometry = new THREE.BoxGeometry(100, 0.2, 100);
        var groundMaterial = new THREE.MeshPhongMaterial({color: 0x000000});

        var ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.position.y = -0.1;

        this.add(ground);
    }
    
    /**
     * Metodo que crea una luz ambiental y una luz focal y las inserta en
     * la escena.
     */
    createLights() {
        // Craer luz ambiental
        var ambientLight = new THREE.AmbientLight(0xccddee, 0.35);
        this.add(ambientLight);
        
        // Crear luz focal que apunta al (0, 0, 0)
        var spotLight = new THREE.SpotLight(0xffffff, 0.5);
        spotLight.position.set(20, 60, 40);
        this.add(spotLight);
    }
    
    /**
     * Metodo que crea un renderizador.
     * @param {canvas} myCanvas Canvas donde se renderizara la escena.
     */
    createRenderer(myCanvas) {        
        // Se instancia un Renderer WebGL
        var renderer = new THREE.WebGLRenderer();
        
        // Se establece un color de fondo en las imágenes que genera el render
        renderer.setClearColor(new THREE.Color(0xEEEEEE), 1.0);
        
        // Se establece el tamaño, se aprovecha la totalidad de la ventana del navegador
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        // La visualización se muestra en el lienzo recibido
        $(myCanvas).append(renderer.domElement);
        
        return renderer;  
    }

    /**
     * Metodo que crea el mapa, añadiendo los mesh no moviles a la escena y
     * guardando informacion extra.
     */
    createMap() {
        var correspondence = this.game.getCorrespondence();
        var that = this;

        this.game.getLevelMap().forEach(function(item, z) {
            let row = [];

            for (let x = 0; x < item.length; x++) {
                let meshType = correspondence[item.charAt(x)];
                row.push(meshType);

                switch(meshType) {
                    case cellType.WALL:
                        let wallMesh = new Wall();
                        wallMesh.position.set(x, 0, z);
                        that.add(wallMesh);
                        break;
                    case cellType.PACMAN:
                        that.pacmanSpawnPoint.x = x;
                        that.pacmanSpawnPoint.z = z;
                        break;
                    case cellType.SMALL_DOT:
                        that._createSmallDot(x, z);
                        break;
                    case cellType.BIG_DOT:
                        that._createBigDot(x, z);
                        break;
                    case cellType.GHOST:
                        that.ghostSpawnPoint.x = x;
                        that.ghostSpawnPoint.z = z;
                        break;
                }
            }

            that.objectsMap.push(row);
        });
    }

    /**
     * Metodo que crea un punto pequeño y lo añade a la escena.
     * @param {number} x Coordenada X del punto.
     * @param {number} z Coordenada Z del punto.
     */
    _createSmallDot(x, z) {
        var smallDotMesh = new Dot(0.1);
        smallDotMesh.position.set(x, 0, z);
        smallDotMesh.name = "smallDot_" + x + "_" + z;
        this.add(smallDotMesh);
        this.game.increaseRemainingDots();
    }

    /**
     * Metodo que crea un punto grande y lo añade a la escena.
     * @param {number} x Coordenada X del punto.
     * @param {number} z Coordenada Z del punto.
     */
    _createBigDot(x, z) {
        var bigDotMesh = new Dot(0.2);
        bigDotMesh.position.set(x, 0, z);
        bigDotMesh.name = "bigDot_" + x + "_" + z;
        this.add(bigDotMesh);
        this.game.increaseRemainingDots();
    }

    /**
     * Metodo que carga la siguiente fase una vez que el PacMan se ha comido todos
     * los puntos del nivel
     */
    loadNextStage() {
        // Recrear los puntos y posicionarlos correctamente
        for (let z = 0; z < this.objectsMap.length; z++) {
            for (let x = 0; x < this.objectsMap[z].length; x++) {
                var mesh = this.objectsMap[z][x];
                switch(mesh) {
                    case cellType.SMALL_DOT:
                        this._createSmallDot(x, z);
                        break;
                    case cellType.BIG_DOT:
                        this._createBigDot(x, z);
                        break;
                }
            }
        }

        // Incrementar velocidad del PacMan (si no se ha sobrepasado el limite)
        this.game.increasePacmanSpeed();

        // Incrementar velocidad de los fantasmas (si no se ha sobrepasado el limite)
        this.game.increaseGhostSpeed();

        // Resetear PacMan y fantasmas
        this.resetCharacters();
    }

    /**
     * Metodo que resetea todos los personajes del juego, devolviendolos a su estado
     * y posicion inicial
     */
    resetCharacters() {
        // El PacMan no puede moverse cuando se resetean los personajes
        this.canMovePacman = false;

        // Resetear personajes
        this.removeGhosts();
        this.respawnPacMan();

        // Iniciar animacion de espera antes de respawnear a los fantasmas
        this.waitBeforeGhostsRespawn.start();
    }

    /**
     * Metodo que elimina a los fantasmas de la escena, detiene la animacion
     * que controla el spawn de estos y resetea sus parametros.
     */
    removeGhosts() {
        this.ghosts.forEach((ghost) => {
            this.remove(ghost);

            ghost.position.set(this.ghostSpawnPoint.x, this.ghostSpawnPoint.y, this.ghostSpawnPoint.z);

            ghost.setSpawned(false);
            ghost.setEdible(false);
        });

        // Resetear indice del siguiente fantasma a spawnear
        this.nextGhost = 0;

        this.spawnGhosts.stop();      
    }

    /**
     * Metodo que inicia la animacion de spawneo de los fantasmas. Se repite 3
     * veces mas, ejecutandose asi para los 4 fantasmas.
     */
    startGhostSpawn() {
        this.spawnGhosts.repeat(3).start();
    }

    /**
     * Metodo que respawnea a un unico fantasma. Se llama cuando el PacMan se
     * come a un fantasma.
     * @param {Ghost} ghost Fantasma que va a respawnear.
     */
    respawnSingleGhost(ghost) {
        ghost.setEdible(false);
        ghost.position.set(this.ghostSpawnPoint.x, this.ghostSpawnPoint.y, this.ghostSpawnPoint.z);
        this._spawnGhost(ghost);
    }

    /**
     * Metodo auxiliar utilizado para respawnear a un fantasma.
     * @param {Ghost} ghost Fanstasma que va a respawnear.
     */
    _spawnGhost(ghost) {
        // Establecer que el fantasma ha spawneado
        ghost.setSpawned(true);

        // Establecer velocidad
        ghost.setSpeed(this.game.getGhostSpeed());

        // Elegir una posible orientacion inicial (izquierda o derecha) aleatoriamente
        var possibleOrientations = [orientations.LEFT, orientations.RIGHT];
        var initOrientation = possibleOrientations[Math.floor(Math.random() * possibleOrientations.length)];
        ghost.setOrientation(initOrientation);
    }

    /**
     * Metodo que respawnea al PacMan cuando ha muerto o se ha pasado de fase.
     */
    respawnPacMan() {
        // Eliminar PacMan de la escena
        this.remove(this.pacman);

        // Crear nuevo PacMan (asi se reinicia la animacion de la boca)
        this.pacman = new PacMan(this.game.getPacmanSpeed());
        this.add(this.pacman);

        // Posicionar al PacMan
        this.pacman.position.set(this.pacmanSpawnPoint.x, this.pacmanSpawnPoint.y, this.pacmanSpawnPoint.z);
    }
    
    /**
     * Metodo que gestiona el evento que se produce al cambiar el tamaño de la ventana.
     */
    onWindowResize () {
        // Actualizar el ratio de aspecto de la camara
        this.setCameraAspect(window.innerWidth / window.innerHeight);
        
        // Actualizar el tamaño del renderizador
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Metodo que modifica el ratio de aspecto de las camaras.
     */
    setCameraAspect(ratio) {
        // Actualizar ratio de aspecto de la camara que sigue al PacMan y actualizar
        // su matriz de proyeccion
        this.pacmanCamera.aspect = ratio;
        this.pacmanCamera.updateProjectionMatrix();

        // La camara ortogonal tiene un ratio de aspecto de 1 (es cuadrada)
        this.mapCamera.aspect = 1;
        this.mapCamera.updateProjectionMatrix();
    }

    /**
     * Metodo que gestiona la pulsacion de una tecla.
     * @param {event} event Evento que se ha producido. Contiene la tecla pulsada.
     */
    onKeyPress(event) {
        // Obtener tecla
        var key = event.which;

        // Obtener orientacion anterior y establecer booleano para ajusatr la
        // posicion del PacMan
        var prevOrientation = this.pacman.getOrientation();
        var adjustPosition = false;

        // Procesar evento si el PacMan puede moverse
        if (this.canMovePacman) {
            switch(String.fromCharCode(key).toUpperCase()) {
                case "A":
                    this.pacman.setOrientation(orientations.LEFT);
                    adjustPosition = prevOrientation != orientations.RIGHT && prevOrientation != orientations.LEFT;
                    break;
                case "S":
                    this.pacman.setOrientation(orientations.DOWN);
                    adjustPosition = prevOrientation != orientations.UP && prevOrientation != orientations.DOWN;
                    break;
                case "D":
                    this.pacman.setOrientation(orientations.RIGHT);
                    adjustPosition = prevOrientation != orientations.LEFT && prevOrientation != orientations.RIGHT;
                    break;
                case "W":
                    this.pacman.setOrientation(orientations.UP);
                    adjustPosition = prevOrientation != orientations.DOWN && prevOrientation != orientations.UP;
                    break;
            }
        }

        // Se ajusta la posicion del personaje redondeandola si se ha producido
        // un giro en una direccion perpendicular a la que tenia anteriormente
        if (adjustPosition) {
            this.pacman.position.round();
        }
    }

    /**
     * Metodo que actualiza la posicion del PacMan, comprobando en el proceso si
     * ha colisionado o no contra una pared.
     */
    updatePacMan() {
        var collidedWithWall = this.checkCollisionWithWall();

        // Si el PacMan se puede mover, actualizar en funcion de si hay o no colision
        if (this.canMovePacman) {
            this.pacman.update(collidedWithWall);
        } else {
            // Si el PacMan no se puede mover, indicar que ha colisionado
            this.pacman.update(true)
        };
    }

    /**
     * Metodo que comprueba si el PacMan colisiona con una pared o no.
     * @returns True si va a colisionar y false en caso contrario.
     */
    checkCollisionWithWall() {
        var collided = false;

        // Truncar posicion del PacMan
        // Despues de bastantes pruebas se ha visto que esta es la mejor forma de
        // detectar colisiones con muros.
        // Se tendra que sumar 1 a la respectiva coordenada mas adelante si el
        // PacMan esta orientado hacia abajo o la derecha, ya que al truncar
        // en estas direcciones se pierde un poco de precision (nos quedamos una
        // casilla mas cortos ya que el PacMan tendria que meterse dentro del muro
        // para ver que ha colisionado, lo cual no tiene sentido)
        var xPos = Math.floor(this.pacman.position.x);
        var zPos = Math.floor(this.pacman.position.z);

        switch(this.pacman.getOrientation()) {
            case orientations.UP:
                collided = this.objectsMap[zPos][xPos] == cellType.WALL;
                break;
            case orientations.DOWN:
                collided = this.objectsMap[zPos + 1][xPos] == cellType.WALL;
                break;
            case orientations.LEFT:
                collided = this.objectsMap[zPos][xPos] == cellType.WALL;
                break;
            case orientations.RIGHT:
                collided = this.objectsMap[zPos][xPos + 1] == cellType.WALL;
                break;
        }

        return collided;
    }

    /**
     * Metodo que actualiza los fantasmas. Actualiza la direccion que van
     * a escoger en caso de encontrarse en un cruce y actualiza la posicion
     * de estos. Un cruce es una casilla que tiene casillas contiguas a esta
     * sin muros y estas casillas vecinas tienen trayectorias perpendiculares.
     */
    updateGhosts() {
        var that = this;
        this.ghosts.forEach(function(ghost, index) {
            that.ghostSelectNextDirection(ghost, index);
            ghost.update();
        });
    }

    /**
     * Metodo que escoge la siguiente orientacion de un fantasma den un cruce de
     * forma aleatoria. Se escoge de forma que el fantasma no vuelva por donde ha
     * venido (que no se de la vuelta).
     * @param {Ghost} ghost Fantasma del que se va a escoger la siguiente direccion.
     * @param {number} index Indice del fantasma dentro del vector de fantasmas.
     */
    ghostSelectNextDirection(ghost, index) {
        var orientation = ghost.getOrientation();

        // Obtener orientacion del fantasma truncando la suya (se le suma 0.5 antes)
        // Despues de algunas pruebas, se ha visto que esta es la mejor forma de hacerlo
        var xGhost = Math.floor(ghost.position.x + 0.5);
        var zGhost = Math.floor(ghost.position.z + 0.5);

        // Obtener celdas contiguas
        var upCell = this.objectsMap[zGhost - 1][xGhost];
        var downCell = this.objectsMap[zGhost + 1][xGhost];
        var leftCell = this.objectsMap[zGhost][xGhost - 1];
        var rightCell = this.objectsMap[zGhost][xGhost + 1];

        // Tienen que haber pasado mas de 25 ticks desde la ultima actualizacion
        // para ese fantasma y tiene que encontrarse dentro del mapa, es decir, no
        // puede estar en las zonas donde se puede teletransportar
        if (this.ticksDirectionChange[index] > 25 && xGhost >= 0 && xGhost <= this.objectsMap[0].length - 1) {
            // Comprobar si hay casillas sin muros en la direccion perpendicular
            // a la suya
            if (((orientation == orientations.LEFT || orientation == orientations.RIGHT) 
                    && (upCell != cellType.WALL || downCell != cellType.WALL)) ||
                ((orientation == orientations.UP || orientation == orientations.DOWN) 
                    && (leftCell != cellType.WALL || rightCell != cellType.WALL)))
            {
                // Las orientaciones se añaden siempre y cuando no permitan volver
                // hacia atras
                var nextOrientations = [];

                if (upCell != cellType.WALL && orientation != orientations.DOWN) {
                    nextOrientations.push(orientations.UP);
                }
    
                if (downCell != cellType.WALL && orientation != orientations.UP) {
                    nextOrientations.push(orientations.DOWN);
                }
    
                if (leftCell != cellType.WALL && orientation != orientations.RIGHT) {
                    nextOrientations.push(orientations.LEFT);
                }
    
                if (rightCell != cellType.WALL && orientation != orientations.LEFT) {
                    nextOrientations.push(orientations.RIGHT);
                }

                var newOrientation = nextOrientations[Math.floor(Math.random() * nextOrientations.length)];

                // En caso de que la nueva orientacion sea distinta, cambiar orientacion
                // y redondear posicion, de forma que pueda girar correctamente
                if (newOrientation != orientation) {
                    ghost.setOrientation(newOrientation);
                    ghost.position.round();
                }
    
                // Reiniciar el numero de ticks del fantasma correspondiente
                this.ticksDirectionChange[index] = 0;
            }
        }
    }

    /**
     * Metodo que actualiza los puntos del mapa.
     */
    updateDots() {
        // Obtener posicion del PacMan truncandola tras haberle sumado 0.5
        // Se ha visto que esta es la mejor forma de hacrelo
        var xPos = Math.floor(this.pacman.position.x + 0.5);
        var zPos = Math.floor(this.pacman.position.z + 0.5);

        // Obtener punto pequeño y grande con el que puede haber colisionado
        // el PacMan en la posicion actual, si es que hay alguno
        // Se obtiene a partir del nombre
        var selectedSmallDot = this.getObjectByName("smallDot_" + xPos + "_" + zPos);
        var selectedBigDot = this.getObjectByName("bigDot_" + xPos + "_" + zPos);

        // Actualizar puntuacion si se ha comido un punto pequeño
        if (selectedSmallDot != undefined) {
            this.game.decreaseRemainingDots();
            this.game.updateScoreSmallDot();
        }

        // Actualizar puntuacion si se ha comido un punto grande e indicar que
        // los fantasmas son comestibles
        if (selectedBigDot != undefined) {
            this.game.decreaseRemainingDots();
            this.game.updateScoreBigDot();

            this.ghosts.forEach(ghost => ghost.setEdible(true));
            this.game.resetEatenGhosts();
        }

        this.remove(selectedSmallDot);
        this.remove(selectedBigDot);
    }

    /**
     * Metodo que comprueba si el PacMan ha colisionado con un fantasma.
     * @returns Devuelve el fantasma con el que ha colisionado.
     */
    checkCollisionWithGhosts() {
        var collided = false;
        var collidedGhost = undefined;

        // Obtener posicion truncada del PacMan
        // Se sigue una estrategia similar a la colision con los puntos
        var xPacMan = Math.floor(this.pacman.position.x + 0.5);
        var zPacMan = Math.floor(this.pacman.position.z + 0.5);

        // Buscar entre los fantasmas spawneados si ha colisionado con alguno
        this.ghosts.filter(ghost => ghost.getSpawned()).forEach(function(ghost) {
            // Obtener posicion truncada del fantasma
            var xGhost = Math.floor(ghost.position.x + 0.5);
            var zGhost = Math.floor(ghost.position.z + 0.5);

            // Se busca la primera colision y se guarda el fantasma, en caso
            // de que colisionen
            if (!collided) {
                collided = xPacMan == xGhost && zPacMan == zGhost;

                if (collided) {
                    collidedGhost = ghost;
                }
            }
        });

        return collidedGhost;
    }

    /**
     * Metodo para actualizar las vidas restantes. Decrementa la vida en 1 y elimina
     * el ultimo icono de la lista que representa una vida.
     */
    updateLives() {
        this.game.decreaseRemainingLives();
        var divLives = document.getElementById("lives").getElementsByTagName("img");
        divLives[this.game.getRemainingLives()].style.display = "none";
    }

    /**
     * Metodo que comprueba si un determinado personaje puede pasar de un lado del
     * mapa al otro y realiza dicha teleportacion en caso positivo.
     * @param {Character3D} character Personaje que se va a comprobar si puede
     * ser teletransportado.
     */
    checkTeleportCharacter(character) {
        var position = character.position.clone();
        position.floor();

        // Pasar de un lado del mapa al otro si esta en las posiciones correctas
        if (position.z == 14 && position.x > this.objectsMap[0].length - 1) {
            character.position.x = 0;
        } else if (position.z == 14 && position.x < -1) {
            character.position.x = this.objectsMap[0].length - 1;
        }
    }

    /**
     * Metodo que actualiza la camara que sigue al PacMan.
     */
    updatePacManCamera() {
        this.pacmanCamera.position.set(this.pacman.position.x, 10, this.pacman.position.z + 10);
        this.pacmanCamera.lookAt(this.pacman.position);
    }

    /**
     * Metodo que visualiza un Viewport.
     * @param {THREE.Scene} scene Escena que renderizar.
     * @param {THREE.Camera} camera Camara desde la que se va a renderizar
     * la escena.
     * @param {number} left Esquina izquierda del viewport.
     * @param {number} top Esquina superior del viewport.
     * @param {number} width Anchura del viweport.
     * @param {number} height Altura del viewport.
     * @param {boolean} squareView Indica si el viewport va a ser cuadrado
     * o no.
     */
    renderViewport(scene, camera, left, top, width, height, squareView) {
        var l, w, t, h;
        
        // Obtener pixeles sin normalizar
        if (squareView) {
            l = left * window.innerHeight;
            t = top * window.innerHeight;

            w = width * window.innerHeight;
            h = height * window.innerHeight;            
        } else {
            l = left * window.innerWidth;
            t = top * window.innerHeight;

            w = width * window.innerWidth;
            h = height * window.innerHeight;
        };

        // Indicar al renderer qué viewport debe usar y recortar el resto
        // de la imagen
        this.renderer.setViewport(l, t, w, h);
        this.renderer.setScissor(l, t, w, h);
        this.renderer.setScissorTest(true);

        // Actualizar ratio de aspecto y matriz de proyeccion de la camara
        camera.aspect = w/h;
        camera.updateProjectionMatrix();

        // Visualizar escena segun la camara
        this.renderer.render(scene, camera);
    }

    /**
     * Metodo que actualiza la escena.
     */
    update() {
        // Actualizar el numero de ticks para el cambio de direccion de los fantasmas
        this.ticksDirectionChange = this.ticksDirectionChange.map(element => element + 1);
        
        // Actualizar los elementos de la escena
        this.updatePacMan();
        this.updateGhosts();
        this.updateDots();

        // Si quedan puntos, realizar resto de actualizaciones
        if (this.game.getRemainingDots() > 0) {
            // Comprobar colision PacMan-Fantasma
            var collidedGhost = this.checkCollisionWithGhosts();
            var collidedWithGhost = collidedGhost != undefined;
    
            // Comprobar que tipo de interaccion se produce en caso de colision
            if (collidedWithGhost) {
                if (collidedGhost.getEdible()) {
                    this.game.playEatGhostAudio();

                    this.game.increaseEatenGhosts();
                    this.game.updateScoreEatenGhost();

                    this.respawnSingleGhost(collidedGhost);
                } else {
                    this.game.playDeathAudio();
                    this.updateLives();

                    // Si quedan vidas, resetear los personajes
                    if (this.game.getRemainingLives() > 0) {
                        this.resetCharacters();
                    } else {
                        window.alert("You lost :c. Total score: " + this.game.getScore() + " points.\nPress F5  to play again!");
                    }
                }
            } else {
                // Comprobar teletransportacion de los personajes
                this.checkTeleportCharacter(this.pacman);
                this.ghosts.forEach(ghost => this.checkTeleportCharacter(ghost));
            }
        } else {
            // Se carga la siguiente fase en caso de haberse comido todos los puntos
            window.alert("Stage cleared! Starting new stage...")
            this.loadNextStage();
        }

        // Indicar que se tiene que renderizar la escena de nuevo si quedan vidas
        if (this.game.getRemainingLives() > 0) {
            requestAnimationFrame(() => this.update());
        }

        // Actualizar camara del PacMan
        this.updatePacManCamera();        
        
        // Renderizar escena y minimapa
        this.renderViewport(this, this.pacmanCamera, 0, 0, 1, 1, false);
        this.renderViewport(this, this.mapCamera, 0, 0, 0.25, 0.25, true);

        // Actualizar puntuacion
        document.getElementById('Score').textContent = this.game.getScore();

        // Actualizar animaciones de Tween
        TWEEN.update();
    }
}
  
// Funcion principal que se ejecuta cuando el documento esta listo
// Version corta de: $(document).ready(function() { ... })
$(function () {
    // Se instancia la escena pasándole el  div  que se ha creado en el html para visualizar
    var scene = new Scene("#WebGL-Output");
    
    // Se añaden los listener de la aplicación: un listener para los cambios del
    // tamaño de ventana y uno para la pulsacion de teclas
    window.addEventListener ("resize", () => scene.onWindowResize());
    window.addEventListener("keypress", (event) => scene.onKeyPress(event));
    
    // Visualizacion de la escena
    scene.update();
});