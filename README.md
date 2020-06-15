# PacMan3D
Proyecto desarrollado para la asignatura de Sistemas Gráficos impartida en la Universidad de Granada durante el curso 2019/20.

## Cómo jugar

Para jugar hay dos opciones. La primera sería clonar el repositorio con:

```sh
git clone https://github.com/Vol0kin/PacMan3D.git
```

Una vez hecho esto hace falta situarse en el directorio `PacMan3D` y ejecutar la siguiente orden:

```sh
python -m SimpleHTTPServer
```

Dicha orden abre un servidor en `localhost:8000`. Si se quiere usar `python3` para levantar el servidor,
se debe usar la siguiente orden:

```sh
python3 -m http.server
```

La otra opción es acceder a la siguiente página web: https://vol0kin.github.io/PacMan3D/

Los controles son los siguientes:

- <kbd>W</kbd> para girar al personaje hacia arriba.
- <kbd>A</kbd> para girar al personaje hacia la izquierda.
- <kbd>S</kbd> para girar al personaje hacia abajo.
- <kbd>D</kbd> para girar al personaje hacia la derecha.

