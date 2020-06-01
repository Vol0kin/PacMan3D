/**
 * Clase que representa un personaje
 */
class Character3D extends THREE.Object3D {
    constructor(speed, orientation) {
        super();

        this.speed = speed;
        this.orientation = orientation;
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