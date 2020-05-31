/**
 * Clase que representa la escena.
 */
class Scene extends THREE.Scene {
    constructor (myCanvas) {
        super();

        this.collision = false;
        this.objectsMap = [];
        this.correspondence = {
            '#': cellType.WALL,
            ' ': cellType.EMPTY,
            '.': cellType.SMALL_DOT,
            'o': cellType.BIG_DOT,
            'P': cellType.PACMAN,
            'G': cellType.GHOST 
        }
        this.remainingPoints = 0;
        this.score = 0;
        this.SMALL_DOT_POINTS = 10;
        this.BIG_DOT_POINTS = 50;
        
        // Lo primero, crear el visualizador, pasándole el lienzo sobre el que realizar los renderizados.
        this.renderer = this.createRenderer(myCanvas);
        
        // Se añade a la gui los controles para manipular los elementos de esta clase
        this.gui = this.createGUI ();
        
        // Construimos los distinos elementos que tendremos en la escena
        this.createGround();
        
        // Todo elemento que se desee sea tenido en cuenta en el renderizado de la escena debe pertenecer a esta. Bien como hijo de la escena (this en esta clase) o como hijo de un elemento que ya esté en la escena.
        // Tras crear cada elemento se añadirá a la escena con   this.add(variable)
        this.createLights ();
        
        // Y unos ejes. Imprescindibles para orientarnos sobre dónde están las cosas
        this.axis = new THREE.AxesHelper (5);
        this.add (this.axis);
        
        this.pacman = new PacMan();
        this.add(this.pacman);

        var ghost = new Ghost(0x1AF2EF);
        this.add(ghost);
        ghost.position.z = -1;

        // Tendremos una cámara con un control de movimiento con el ratón
        this.createCamera ();
        this.createMap();
        document.getElementById('Score').textContent = this.score;
    }
    
    createCamera () {
        // Para crear una cámara le indicamos
        //   El ángulo del campo de visión en grados sexagesimales
        //   La razón de aspecto ancho/alto
        //   Los planos de recorte cercano y lejano
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.add(this.camera);

        // Posicionar camara
        this.camera.position.set (this.pacman.position.x, 10, this.pacman.position.z + 10);
        
        // Indicar hacia donde mira la camara
        this.camera.lookAt(this.pacman.position);
    }
    
    createGround () {
        var groundGeometry = new THREE.BoxGeometry(100, 0.2, 100);
        var groundMaterial = new THREE.MeshPhongMaterial({color: 0x000000});

        var ground = new THREE.Mesh(groundGeometry, groundMaterial);

        ground.position.y = -0.1;
        
        // Que no se nos olvide añadirlo a la escena, que en este caso es  this
        this.add (ground);
    }
    
    createGUI () {
        // Se crea la interfaz gráfica de usuario
        var gui = new dat.GUI();
        
        // La escena le va a añadir sus propios controles. 
        // Se definen mediante una   new function()
        // En este caso la intensidad de la luz y si se muestran o no los ejes
        this.guiControls = new function() {
            // En el contexto de una función   this   alude a la función
            this.lightIntensity = 0.5;
            this.axisOnOff = true;
        }
    
        // Se crea una sección para los controles de esta clase
        var folder = gui.addFolder ('Luz y Ejes');
        
        // Se le añade un control para la intensidad de la luz
        folder.add (this.guiControls, 'lightIntensity', 0, 1, 0.1).name('Intensidad de la Luz : ');
        
        // Y otro para mostrar u ocultar los ejes
        folder.add (this.guiControls, 'axisOnOff').name ('Mostrar ejes : ');
        
        return gui;
    }
    
    createLights () {
        // Se crea una luz ambiental, evita que se vean complentamente negras las zonas donde no incide de manera directa una fuente de luz
        // La luz ambiental solo tiene un color y una intensidad
        // Se declara como   var   y va a ser una variable local a este método
        //    se hace así puesto que no va a ser accedida desde otros métodos
        var ambientLight = new THREE.AmbientLight(0xccddee, 0.35);
        // La añadimos a la escena
        this.add (ambientLight);
        
        // Se crea una luz focal que va a ser la luz principal de la escena
        // La luz focal, además tiene una posición, y un punto de mira
        // Si no se le da punto de mira, apuntará al (0,0,0) en coordenadas del mundo
        // En este caso se declara como   this.atributo   para que sea un atributo accesible desde otros métodos.
        this.spotLight = new THREE.SpotLight( 0xffffff, this.guiControls.lightIntensity );
        this.spotLight.position.set( 60, 60, 40 );
        this.add (this.spotLight);
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

        stringMap.forEach(function(item, index) {
            let row = [];

            for (let i = 0; i < item.length; i++) {
                var meshType = that.correspondence[item.charAt(i)];
                row.push(meshType);

                let zPos = index;

                switch(meshType) {
                    case cellType.WALL:
                        let wallMesh = new Wall();
                        wallMesh.position.set(i, 0, zPos);
                        that.add(wallMesh);
                        break;
                    case cellType.PACMAN:
                        that.pacman.position.set(i, 0, zPos);
                        break;
                    case cellType.SMALL_DOT:
                        let smallDotMesh = new Dot(0.1);
                        smallDotMesh.position.set(i, 0, zPos);
                        smallDotMesh.name = "smallDot_" + i + "_" + zPos;
                        that.add(smallDotMesh);
                        that.remainingPoints++;
                        break;
                    case cellType.BIG_DOT:
                        let bigDotMesh = new Dot(0.2);
                        bigDotMesh.position.set(i, 0, zPos);
                        bigDotMesh.name = "bigDot_" + i + "_" + zPos;
                        that.add(bigDotMesh);
                        that.remainingPoints++;
                        break;
                }
            }

            that.objectsMap.push(row);
        });
    }
    
    getCamera () {
        // En principio se devuelve la única cámara que tenemos
        // Si hubiera varias cámaras, este método decidiría qué cámara devuelve cada vez que es consultado
        return this.camera;
    }
    
    setCameraAspect (ratio) {
        // Cada vez que el usuario modifica el tamaño de la ventana desde el gestor de ventanas de
        // su sistema operativo hay que actualizar el ratio de aspecto de la cámara
        this.camera.aspect = ratio;
        // Y si se cambia ese dato hay que actualizar la matriz de proyección de la cámara
        this.camera.updateProjectionMatrix();
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

        if (adjustPosition) {
            this.pacman.position.round();
        }
    }
  
    update() {
        // Este método debe ser llamado cada vez que queramos visualizar la escena de nuevo.
        
        // Literalmente le decimos al navegador: "La próxima vez que haya que refrescar la pantalla, llama al método que te indico".
        // Si no existiera esta línea,  update()  se ejecutaría solo la primera vez.
        requestAnimationFrame(() => this.update())
    
        // Se actualizan los elementos de la escena para cada frame
        // Se actualiza la intensidad de la luz con lo que haya indicado el usuario en la gui
        this.spotLight.intensity = this.guiControls.lightIntensity;
        
        // Se muestran o no los ejes según lo que idique la GUI
        this.axis.visible = this.guiControls.axisOnOff;
        
        // Se actualiza el resto del modelo
        
        var collision = this.checkCollisionWithWall();
        this.pacman.update(collision);
        
        this.updateGameMap();

        var pacmanPos = this.pacman.position.clone();
        pacmanPos.floor();

        // Pasar de un lado del mapa al otro
        if (pacmanPos.z == 14 && pacmanPos.x > this.objectsMap[0].length - 1) {
            this.pacman.position.x = 0;
        } else if (pacmanPos.z == 14 && pacmanPos.x < -1) {
            this.pacman.position.x = this.objectsMap[0].length - 1;
        }        

        // Actualizar camara
        this.updateCamara();        
        
        // Le decimos al renderizador "visualiza la escena que te indico usando la cámara que te estoy pasando"
        this.renderer.render (this, this.getCamera());
        document.getElementById('Score').textContent = this.score;
    }

    updateCamara() {
        this.camera.position.set(this.pacman.position.x, 10, this.pacman.position.z + 10);
        this.camera.lookAt(this.pacman.position);
    }

    updateGameMap() {
        var xPos = Math.floor(this.pacman.position.x + 0.5);
        var zPos = Math.floor(this.pacman.position.z + 0.5);

        //console.log(xPos, zPos);

        var selectedSmallDot = this.getObjectByName("smallDot_" + xPos + "_" + zPos);
        var selectedBigDot = this.getObjectByName("bigDot_" + xPos + "_" + zPos);

        if (selectedSmallDot != undefined) {
            this.remainingPoints--;
            this.score += this.SMALL_DOT_POINTS;
        }

        if (selectedBigDot != undefined) {
            this.remainingPoints--;
            this.score += this.BIG_DOT_POINTS;
        }

        this.remove(selectedSmallDot);
        this.remove(selectedBigDot);
    }

    checkCollisionWithWall() {
        var collided = false;

        var xPos = Math.round(this.pacman.position.x - 0.5);
        var zPos = Math.round(this.pacman.position.z - 0.5);

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

        console.log(collided);

        return collided;
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