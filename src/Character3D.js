/**
 * Clase base que representa un personaje 3D.
 */
class Character3D extends THREE.Object3D {
    /**
     * Constructor de la clase. Crea un nuevo personaje 3D.
     * @param {number} speed Velocidad del personaje.
     * @param {orientation} orientation Orientacion del personaje.
     */
    constructor(speed, orientation) {
        super();

        this.speed = speed;
        this.orientation = orientation;

        // Se obtiene tambien el tiempo en el que se ha creado el objeto
        // Se usa en los metodos update() de las clases derivadas.
        this.lastUpdateTime = Date.now();
    }

    getOrientation() {
        return this.orientation;
    }

    setOrientation(orientation) {
        this.orientation = orientation;
    }

    getSpeed() {
        return this.speed;
    }

    setSpeed(speed) {
        this.speed = speed;
    }

    /**
     * Metodo para actualizar la orientacion. Se utiliza en el metodo update()
     * de las clases derivadas para orientar correctamente al personaje.
     */
    updateOrientation() {
        switch(this.orientation) {
            case orientations.UP:
                this.rotation.y = Math.PI / 2;
                break;
            case orientations.DOWN:
                this.rotation.y = -Math.PI / 2;
                break;
            case orientations.LEFT:
                this.rotation.y = Math.PI;
                break;
            case orientations.RIGHT:
                this.rotation.y = 0;
                break;
        }
    }
}