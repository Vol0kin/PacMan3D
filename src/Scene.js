/**
 * Clase que representa la escena.
 */
class Scene extends THREE.Scene {
    constructor (myCanvas) {
        super();

        //window.alert("Welcome to PacMan3D");
        this.objectsMap = [];
        this.correspondence = {
            '#': cellType.WALL,
            ' ': cellType.EMPTY,
            '.': cellType.SMALL_DOT,
            'o': cellType.BIG_DOT,
            'P': cellType.PACMAN,
            'G': cellType.GHOST 
        }
        this.canMovePacman = false;
        this.remainingPoints = 0;
        this.score = 0;
        this.SMALL_DOT_POINTS = 10;
        this.BIG_DOT_POINTS = 50;
        this.GHOST_POINTS = 100;
        this.pacmanLives = 3;
        this.ticksDirectionChange = [0, 0, 0, 0];
        this.pacmanSpawnPoint = new THREE.Vector3(0, 0, 0);
        this.ghostSpawnPoint = new THREE.Vector3(0, 0, 0);
        this.ghosts = [];
        this.eatenGhosts = 0;

        this.ghostSpeed = 2.5;
        this.pacmanSpeed = 3;

        
        for (let i = 0; i < this.pacmanLives; i++) {
            let life = document.createElement("img");
            life.src = "img/pacman_icon.png";
            document.getElementById("lives").appendChild(life);

        }
        
        // Lo primero, crear el visualizador, pasándole el lienzo sobre el que realizar los renderizados.
        this.renderer = this.createRenderer(myCanvas);
        
        // Construimos los distinos elementos que tendremos en la escena
        this.createGround();
        
        // Todo elemento que se desee sea tenido en cuenta en el renderizado de la escena debe pertenecer a esta. Bien como hijo de la escena (this en esta clase) o como hijo de un elemento que ya esté en la escena.
        // Tras crear cada elemento se añadirá a la escena con   this.add(variable)
        this.createLights ();
        
        this.pacman = new PacMan(this.pacmanSpeed);
        this.add(this.pacman);

        this.ghosts.push(new Ghost(this.ghostSpeed, 0xFF0000));
        this.ghosts.push(new Ghost(this.ghostSpeed, 0xFFA9E0));
        this.ghosts.push(new Ghost(this.ghostSpeed, 0x1AF2EF));
        this.ghosts.push(new Ghost(this.ghostSpeed, 0xFFBE29));

        this.createMap();

        this.ghosts.forEach((ghost) => {
            ghost.position.set(this.ghostSpawnPoint.x, this.ghostSpawnPoint.y, this.ghostSpawnPoint.z);
        });


        // Tendremos una cámara con un control de movimiento con el ratón
        this.createCamera ();
        
        document.getElementById('Score').textContent = this.score;

        var init = {x: 0};
        var end = {x: 1};
        this.nextGhost = 0;

        var beginningAudio = new Audio("audio/pacman_beginning.wav");
        beginningAudio.autoplay = true;
        beginningAudio.preload = "auto";
        beginningAudio.volume = 0.5;
        beginningAudio.play();

        this.eatGhostAudio = new Audio("audio/pacman_eatghost.wav");
        this.eatGhostAudio.preload = "auto";
        this.eatGhostAudio.volume = 0.5;

        this.deathAudio = new Audio("audio/pacman_death.wav");
        this.deathAudio.preload = "true";
        this.deathAudio.volume = 0.5;

        // Animacion que controla la aparicion inicial de los fantasmas
        this.spawnGhosts = new TWEEN.Tween(init)
            .to(end, 3000)
            .easing(TWEEN.Easing.Linear.None)
            .onUpdate(() => {
                if (init.x == end.x) {
                    this.add(this.ghosts[this.nextGhost]);
                    this._spawnGhost(this.ghosts[this.nextGhost]);
                    this.nextGhost++;
                }
            })
            .onComplete(() => {
                console.log('All ghosts spawned!')
            });
        
        var init2 = {x: 0};
        var wait = new TWEEN.Tween(init2)
            .to(end, 4500)
            .easing(TWEEN.Easing.Linear.None)
            .onComplete(() =>{
                this.canMovePacman = true;
                this.startGhostSpawn();
            }).start();
        
        var init3 = {x: 0};
        this.waitRespawnGhosts = new TWEEN.Tween(init3)
            .to(end, 2000)
            .easing(TWEEN.Easing.Linear.None)
            .onComplete(() => {
                this.canMovePacman = true;
                this.startGhostSpawn();
            });
    }

    _loadSmallDot(x, z) {
        var smallDotMesh = new Dot(0.1);
        smallDotMesh.position.set(x, 0, z);
        smallDotMesh.name = "smallDot_" + x + "_" + z;
        this.add(smallDotMesh);
        this.remainingPoints++;
    }

    _loadBigDot(x, z) {
        var bigDotMesh = new Dot(0.2);
        bigDotMesh.position.set(x, 0, z);
        bigDotMesh.name = "bigDot_" + x + "_" + z;
        this.add(bigDotMesh);
        this.remainingPoints++;
    }

    loadNextStage() {
        // Volver a pner los puntos en el mapa
        for (let z = 0; z < this.objectsMap.length; z++) {
            for (let x = 0; x < this.objectsMap[z].length; x++) {
                var mesh = this.objectsMap[z][x];
                switch(mesh) {
                    case cellType.SMALL_DOT:
                        this._loadSmallDot(x, z);
                        break;
                    case cellType.BIG_DOT:
                        this._loadBigDot(x, z);
                        break;
                }
            }
        }

        if (this.pacmanSpeed < 5.5) {
            this.pacmanSpeed += 0.5;
        }

        if (this.ghostSpeed < 5.0) {
            this.ghostSpeed += 0.5;
        }

        // Resetear PacMan y fantasmas
        this.resetCharacters();
    }

    startGhostSpawn() {
        this.spawnGhosts.repeat(3).start();
    }

    _spawnGhost(ghost) {
        ghost.setSpawned(true);
        ghost.setSpeed(this.ghostSpeed);
        var possibleOrientations = [orientations.LEFT, orientations.RIGHT];
        var initOrientation = possibleOrientations[Math.floor(Math.random() * possibleOrientations.length)];
        ghost.setOrientation(initOrientation);
    }

    removeGhosts() {
        this.ghosts.forEach((ghost) => {
            this.remove(ghost)
            ghost.position.set(this.ghostSpawnPoint.x, this.ghostSpawnPoint.y, this.ghostSpawnPoint.z);
            ghost.setSpawned(false);
            ghost.setEdible(false);
        });
        this.nextGhost = 0;
        this.spawnGhosts.stop();      
    }

    respawnSingleGhost(ghost) {
        ghost.setEdible(false);
        ghost.position.set(this.ghostSpawnPoint.x, this.ghostSpawnPoint.y, this.ghostSpawnPoint.z);
        this._spawnGhost(ghost);
    }

    respawnPacMan() {
        this.remove(this.pacman);
        this.pacman = new PacMan(this.pacmanSpeed);
        this.add(this.pacman);
        this.pacman.position.set(this.pacmanSpawnPoint.x, this.pacmanSpawnPoint.y, this.pacmanSpawnPoint.z);
    }

    resetCharacters() {
        this.canMovePacman = false;
        this.removeGhosts();
        this.respawnPacMan();
        this.waitRespawnGhosts.start();
    }
    
    createCamera () {
        // Para crear una cámara le indicamos
        //   El ángulo del campo de visión en grados sexagesimales
        //   La razón de aspecto ancho/alto
        //   Los planos de recorte cercano y lejano
        this.camera1 = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.add(this.camera1);

        // Posicionar camara
        this.camera1.position.set (this.pacman.position.x, 10, this.pacman.position.z + 10);
        
        // Indicar hacia donde mira la camara
        this.camera1.lookAt(this.pacman.position);

        this.camera2 = new THREE.OrthographicCamera((-this.objectsMap[0].length)/2, (this.objectsMap[0].length)/2, this.objectsMap.length/2, -this.objectsMap.length/2, 1, 1000);
        this.add(this.camera2);
        this.camera2.position.set(13.5, 2, 15);
        this.camera2.lookAt(13.5, 0, 15);
    }
    
    createGround () {
        var groundGeometry = new THREE.BoxGeometry(100, 0.2, 100);
        var groundMaterial = new THREE.MeshPhongMaterial({color: 0x000000});

        var ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.position.y = -0.1;

        this.add (ground);
    }
    
    createLights () {
        // Craer luz ambiental
        var ambientLight = new THREE.AmbientLight(0xccddee, 0.35);
        this.add (ambientLight);
        
        // Crear luz focal que apunta al (0, 0, 0)
        var spotLight = new THREE.SpotLight(0xffffff, 0.5);
        spotLight.position.set(20, 60, 40);
        this.add(spotLight);
    }
    
    createRenderer (myCanvas) {
        // Se recibe el lienzo sobre el que se van a hacer los renderizados. Un div definido en el html.
        
        // Se instancia un Renderer   WebGL
        var renderer = new THREE.WebGLRenderer();
        
        // Se establece un color de fondo en las imágenes que genera el render
        renderer.setClearColor(new THREE.Color(0xEEEEEE), 1.0);
        
        // Se establece el tamaño, se aprovecha la totalidad de la ventana del navegador
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        // La visualización se muestra en el lienzo recibido
        $(myCanvas).append(renderer.domElement);
        
        return renderer;  
    }

    createMap() {
        var stringMap = [
            "############################",
            "#............##............#",
            "#.####.#####.##.#####.####.#",
            "#o####.#####.##.#####.####o#",
            "#.####.#####.##.#####.####.#",
            "#..........................#",
            "#.####.##.########.##.####.#",
            "#.####.##.########.##.####.#",
            "#......##....##....##......#",
            "######.##### ## #####.######",
            "     #.##### ## #####.#     ",
            "     #.##     G    ##.#     ",
            "     #.## ######## ##.#     ",
            "######.## #      # ##.######",
            "      .   #      #   .      ",
            "######.## #      # ##.######",
            "     #.## ######## ##.#     ",
            "     #.##          ##.#     ",
            "     #.## ######## ##.#     ",
            "######.## ######## ##.######",
            "#............##............#",
            "#.####.#####.##.#####.####.#",
            "#.####.#####.##.#####.####.#",
            "#o..##....... P.......##..o#",
            "###.##.##.########.##.##.###",
            "###.##.##.########.##.##.###",
            "#......##....##....##......#",
            "#.##########.##.##########.#",
            "#.##########.##.##########.#",
            "#..........................#",
            "############################"
        ];

        var that = this;

        stringMap.forEach(function(item, z) {
            let row = [];

            for (let x = 0; x < item.length; x++) {
                let meshType = that.correspondence[item.charAt(x)];
                row.push(meshType);

                switch(meshType) {
                    case cellType.WALL:
                        let wallMesh = new Wall();
                        wallMesh.position.set(x, 0, z);
                        that.add(wallMesh);
                        break;
                    case cellType.PACMAN:
                        that.pacman.position.set(x, 0, z);
                        that.pacmanSpawnPoint = that.pacman.position.clone();
                        break;
                    case cellType.SMALL_DOT:
                        that._loadSmallDot(x, z);
                        break;
                    case cellType.BIG_DOT:
                        that._loadBigDot(x, z);
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
    
    getCamera () {
        // En principio se devuelve la única cámara que tenemos
        // Si hubiera varias cámaras, este método decidiría qué cámara devuelve cada vez que es consultado
        return this.camera1;
    }
    
    setCameraAspect (ratio) {
        // Cada vez que el usuario modifica el tamaño de la ventana desde el gestor de ventanas de
        // su sistema operativo hay que actualizar el ratio de aspecto de la cámara
        this.camera1.aspect = ratio;
        // Y si se cambia ese dato hay que actualizar la matriz de proyección de la cámara
        this.camera1.updateProjectionMatrix();

        this.camera2.aspect = 1;
        this.camera2.updateProjectionMatrix();
    }
    
    onWindowResize () {
        // Este método es llamado cada vez que el usuario modifica el tamapo de la ventana de la aplicación
        // Hay que actualizar el ratio de aspecto de la cámara
        this.setCameraAspect (window.innerWidth / window.innerHeight);
        
        // Y también el tamaño del renderizador
        this.renderer.setSize (window.innerWidth, window.innerHeight);
    }

    onKeyPress(event) {
        // Obtener tecla
        var key = event.which;

        var prevOrientation = this.pacman.getOrientation();
        var adjustPosition = false;

        // Procesar evento
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

        if (adjustPosition) {
            this.pacman.position.round();
        }
    }

    updateLives() {
        this.pacmanLives--;
        var divLives = document.getElementById("lives").getElementsByTagName('img');
        divLives[this.pacmanLives].style.display = 'none';
    }
  
    update() {
        this.ticksDirectionChange = this.ticksDirectionChange.map(element => element + 1);
        // Este método debe ser llamado cada vez que queramos visualizar la escena de nuevo.
        
        // Literalmente le decimos al navegador: "La próxima vez que haya que refrescar la pantalla, llama al método que te indico".
        // Si no existiera esta línea,  update()  se ejecutaría solo la primera vez.
        
        // Se actualiza el resto del modelo
        
        this.updatePacMan();
        this.updateGhosts();
        this.updateDots();

        if (this.remainingPoints > 0) {
            var collidedGhost = this.checkCollisionWithGhosts();
            var collidedWithGhost = collidedGhost != undefined;
    
            if (collidedWithGhost) {
                if (collidedGhost.getEdible()) {
                    this.eatGhostAudio.play();
                    this.eatenGhosts++;
                    this.score += Math.pow(2, this.eatenGhosts) * this.GHOST_POINTS;
                    this.respawnSingleGhost(collidedGhost);
                } else {
                    this.deathAudio.play();
                    this.updateLives();

                    if (this.pacmanLives > 0) {
                        this.resetCharacters();
                    } else {
                        window.alert("You lost :c. Press F5  to play again!");
                    }
                }
            } else {
                this.checkTeleportCharacter(this.pacman);
                this.ghosts.forEach(ghost => this.checkTeleportCharacter(ghost));
            }

        } else {
            window.alert("Stage cleared! Starting new stage...")
            this.loadNextStage();
        }

        if (this.pacmanLives > 0) {
            requestAnimationFrame(() => this.update());
        }

        // Actualizar camara
        this.updateCamara();        
        
        // Le decimos al renderizador "visualiza la escena que te indico usando la cámara que te estoy pasando"
        this.renderViewport(this, this.camera1, 0, 0, 1, 1, false);
        this.renderViewport(this, this.camera2, 0, 0, 0.25, 0.25, true);
        document.getElementById('Score').textContent = this.score;

        TWEEN.update();
    }

    checkTeleportCharacter(character) {
        var position = character.position.clone();
        position.floor();

        // Pasar de un lado del mapa al otro
        if (position.z == 14 && position.x > this.objectsMap[0].length - 1) {
            character.position.x = 0;
        } else if (position.z == 14 && position.x < -1) {
            character.position.x = this.objectsMap[0].length - 1;
        }
    }

    updateCamara() {
        this.camera1.position.set(this.pacman.position.x, 10, this.pacman.position.z + 10);
        this.camera1.lookAt(this.pacman.position);
    }

    updateDots() {
        var xPos = Math.floor(this.pacman.position.x + 0.5);
        var zPos = Math.floor(this.pacman.position.z + 0.5);

        var selectedSmallDot = this.getObjectByName("smallDot_" + xPos + "_" + zPos);
        var selectedBigDot = this.getObjectByName("bigDot_" + xPos + "_" + zPos);

        if (selectedSmallDot != undefined) {
            this.remainingPoints--;
            this.score += this.SMALL_DOT_POINTS;
        }

        if (selectedBigDot != undefined) {
            this.remainingPoints--;
            this.score += this.BIG_DOT_POINTS;
            this.ghosts.forEach(ghost => ghost.setEdible(true));
            this.eatenGhosts = 0;
        }

        this.remove(selectedSmallDot);
        this.remove(selectedBigDot);
    }

    checkCollisionWithWall() {
        var collided = false;

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

    ghostSelectNextDirection(ghost, index) {
        var orientation = ghost.getOrientation();
        var xGhost = Math.floor(ghost.position.x + 0.5);
        var zGhost = Math.floor(ghost.position.z + 0.5);

        var upCell = this.objectsMap[zGhost-1][xGhost];
        var downCell = this.objectsMap[zGhost+1][xGhost];
        var leftCell = this.objectsMap[zGhost][xGhost-1];
        var rightCell = this.objectsMap[zGhost][xGhost+1];

        // Tienen que haber pasado mas de 25 ticks desde la ultima actualizacion
        // y el fantasma tiene que encontrarse en el mapa (no esta en las zonas
        // donde puede transportarse de una punta a la otra)
        if (this.ticksDirectionChange[index] > 25 && xGhost >= 0 && xGhost <= this.objectsMap[0].length - 1) {
            // Comprobar si tienen casillas en la direccion perpendicular a la suya
            if (((orientation == orientations.LEFT || orientation == orientations.RIGHT) && (upCell != cellType.WALL || downCell != cellType.WALL)) ||
                ((orientation == orientations.UP || orientation == orientations.DOWN) && (leftCell != cellType.WALL || rightCell != cellType.WALL))) {
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

                if (newOrientation != orientation) {
                    ghost.setOrientation(newOrientation);
                    ghost.position.round();
                }
    
                this.ticksDirectionChange[index] = 0;
            }
        }
    }

    updateGhosts() {
        var that = this;
        this.ghosts.forEach(function(ghost, index) {
            that.ghostSelectNextDirection(ghost, index);
            ghost.update();
        });
    }

    updatePacMan() {
        var collision = this.checkCollisionWithWall();
        if (this.canMovePacman) {
            this.pacman.update(collision);

        } else {this.pacman.update(true)};
    }

    checkCollisionWithGhosts() {
        var collided = false;
        var collidedGhost = undefined;
        var xPacMan = Math.floor(this.pacman.position.x + 0.5);
        var zPacMan = Math.floor(this.pacman.position.z + 0.5);

        this.ghosts.filter(ghost => ghost.getSpawned()).forEach(function(ghost) {
            var xGhost = Math.floor(ghost.position.x + 0.5);
            var zGhost = Math.floor(ghost.position.z + 0.5);

            if (!collided) {
                collided = xPacMan == xGhost && zPacMan == zGhost;

                if (collided) {
                    collidedGhost = ghost;
                }
            }
        });

        return collidedGhost;
    }

    renderViewport(scene, camera, left, top, width, height, squareView) {
        var l, w, t, h;
        
        if (squareView) {
            l = left * window.innerHeight;
            w = width * window.innerHeight;
    
            t = top * window.innerHeight;
            h = height * window.innerHeight;            
        } else {
            l = left * window.innerWidth;
            w = width * window.innerWidth;
    
            t = top * window.innerHeight;
            h = height * window.innerHeight;
        };

        this.renderer.setViewport(l, t, w, h);
        this.renderer.setScissor(l,t,w,h);
        this.renderer.setScissorTest(true);
        camera.aspect = w/h;
        camera.updateProjectionMatrix();
        this.renderer.render(scene, camera);
    }
}
  
// Funcion principal que se ejecuta cuando el documento esta listo
// Version corta de: $(document).ready(function() { ... })
$(function () {
    // Se instancia la escena pasándole el  div  que se ha creado en el html para visualizar
    var scene = new Scene("#WebGL-Output");
    
    // Se añaden los listener de la aplicación. En este caso, el que va a comprobar cuándo se modifica el tamaño de la ventana de la aplicación.
    window.addEventListener ("resize", () => scene.onWindowResize());
    window.addEventListener("keypress", (event) => scene.onKeyPress(event));
    
    // Visualizacion de la escena
    scene.update();
});