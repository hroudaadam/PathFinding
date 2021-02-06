const width = 600;
const height = 400;
const cellSize = 20;
let colors;
let vertexStates;
let graph = [];
let countXCells;
let countYCells;
let astar;
let dijkstra;

function setup() {

    initColors();
    initVertexStates();

    let canvas = createCanvas(width, height);
    canvas.parent("sketch");

    background(colors.white);
    frameRate(20);

    graph = createGraph();

    let startVert = randomStart();
    let endVert = randomEnd();

    dijkstra = new Dijkstra(startVert, endVert);
    astar = new AStar(startVert, endVert);

    showGraph();
}

function draw() {
    dijkstra.update();
    astar.update();
    if (dijkstra.finished && astar.finished) {
        noLoop();
        dijkstra.showResult();
        astar.showResult();
    }
}

function createGraph() {
    countXCells = Math.floor(width / cellSize) - 1;
    countYCells = Math.floor(height / cellSize) - 1;


    let output = [];
    for (let y = 0; y < countYCells; y++) {
        output.push([]);
        for (let x = 0; x < countXCells; x++) {
            rectMode(CORNER);
            let vertex = new Vertex(x, y, cellSize);
            output[y].push(vertex);
            if (int(random(4)) % 4 == 0) {
                vertex.state = vertexStates.blocked;
            }
        }
    }
    return output;
}

function randomStart() {
    let x;
    let y;

    do {
        x = int(random(countXCells));
        y = int(random(countYCells));
    } while (graph[y][x].state === vertexStates.end);

    graph[y][x].state = vertexStates.start;
    return graph[y][x];
}

function randomEnd() {
    let x;
    let y;

    do {
        x = int(random(countXCells));
        y = int(random(countYCells));
    } while (graph[y][x].state === vertexStates.start);

    graph[y][x].state = vertexStates.end;
    return graph[y][x];
}

function showGraph() {
    for (let y = 0; y < countYCells; y++) {
        for (let x = 0; x < countXCells; x++) {
            graph[y][x].show();
        }
    }
}

function getNeightbors(vertex) {
    let neightbors = [];

    // S
    if (vertex.y > 0) {
        let neightbor = graph[vertex.y - 1][vertex.x];
        neightbors.push(neightbor);
    }

    // V
    if (vertex.x < countXCells - 1) {
        let neightbor = graph[vertex.y][vertex.x + 1];
        neightbors.push(neightbor);
    }

    // J
    if (vertex.y < countYCells - 1) {
        let neightbor = graph[vertex.y + 1][vertex.x];
        neightbors.push(neightbor);
    }

    // Z
    if (vertex.x > 0) {
        let neightbor = graph[vertex.y][vertex.x - 1];
        neightbors.push(neightbor);
    }
    return neightbors;
}

function initColors() {
    colors = {
        black: color(0, 0, 0),
        white: color(255, 255, 255),
        color1: color(42, 237, 53),
        color2: color(230, 57, 70),
        color3: color(91, 93, 94),
        color4: color(12, 182, 238, 90),
        color5: color(234, 239, 50, 90)
    };
}

function initVertexStates() {
    vertexStates = {
        empty: 0,
        blocked: 1,
        start: 2,
        end: 3
    };
}

class Vertex {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.state = vertexStates.empty;
        this.prev = null;

        this.dist = Number.MAX_SAFE_INTEGER;

        this.g = null; // dálka aktuální optimální cesty
        this.f = null; // předpokládaná délka cesty mezi startem a cílem jdoucí přes vrchol
        this.h = null; // heuristický odhad k cíli
    }

    show(color = null) {
        if (color) {
            fill(color);
        }
        else {
            switch (this.state) {
                case vertexStates.empty:
                    fill(colors.white);
                    break;
                case vertexStates.blocked:
                    fill(colors.color3);
                    break;
                case vertexStates.start:
                    fill(colors.color1);
                    break;
                case vertexStates.end:
                    fill(colors.color2);
                    break;
            }
        }
        strokeWeight(0.5);
        rect(this.x * this.size, this.y * this.size, this.size, this.size);
    }
}

class Dijkstra {

    constructor(stVert, enVert) {
        this.closedVerteces = [];
        this.openedVerteces = [];
        this.startVertex = stVert;
        this.endVertex = enVert;
        this.current = this.startVertex;
        this.finished = false;

        // naplnění polí
        for (let y = 0; y < countYCells; y++) {
            for (let x = 0; x < countXCells; x++) {
                let vertex = graph[y][x];
                this.openedVerteces.push(vertex);
            }
        }

        // nastavení vlastností startového vrcholu
        this.startVertex.dist = 0;
        // uzavření startového vrcholu
        this.closedVerteces.push(this.startVertex);
        let index = this.openedVerteces.indexOf(this.startVertex);
        this.openedVerteces.splice(index, 1);
    }

    update() {
        if (this.openedVerteces.length > 0) {
            // kontrola sousedních vrcholů
            let neightbors = getNeightbors(this.current);
            for (let neightbor of neightbors) {
                // sousední vrchol ještě není uzavřený A ZÁROVEŃ není blokovaný
                if ((this.closedVerteces.indexOf(neightbor) < 0) && neightbor.state !== vertexStates.blocked) {

                    let altDist = this.current.dist + 1;
                    // nová vzdálenost je lepší než uložená
                    if (altDist < neightbor.dist) {
                        neightbor.dist = altDist;
                        neightbor.prev = this.current;
                    }
                }
            }

            // výběr nejbližšího vrcholu
            let nearestVertex = this.openedVerteces[0];
            for (let vertex of this.openedVerteces) {
                if (vertex.dist < nearestVertex.dist) {
                    nearestVertex = vertex;
                }
            }

            if (nearestVertex === this.endVertex) {
                this.finished = true;
                return;
            }

            nearestVertex.show(colors.color4);

            // uzavření nejbližšího souseda
            this.closedVerteces.push(nearestVertex);
            let index = this.openedVerteces.indexOf(nearestVertex);
            this.openedVerteces.splice(index, 1);

            // opakovat pro nejbližšího souseda
            this.current = nearestVertex;
        }
        else {
            this.finished = true;
        }
    }

    showResult() {
        let prev = this.endVertex.prev;
        while (prev.prev) {
            prev.show(colors.color5);
            prev = prev.prev;
        }
    }
}

class AStar {
    constructor(stVert, enVert) {
        this.startVertex = stVert;
        this.endVertex = enVert;
        this.finished = false;
        this.current = this.startVertex;
        this.openedVerteces = [];
        this.closedVertece = [];

        this.startVertex.g = 0;
        this.startVertex.h = this.heuristic(this.startVertex);
        this.startVertex.f = this.startVertex.h;

        this.openedVerteces.push(this.startVertex);
    }

    update() {
        if (this.openedVerteces.length > 0) {
            // otevřený vrchol s nejmenší hodnotou F
            let current = this.openedVerteces[0];
            for (let vertex of this.openedVerteces) {
                if (vertex.f < current.f) {
                    current = vertex;
                }
            }

            if (current === this.endVertex) {
                this.finished = true;
                return;
            }

            // uzavření současného vrcholu
            let index = this.openedVerteces.indexOf(current);
            this.openedVerteces.splice(index, 1);
            this.closedVertece.push(current);

            let neighbours = getNeightbors(current);
            for (let neighbour of neighbours) {
                // pokud soused je v uzavřených NEBO je blokovaný
                if ((this.closedVertece.indexOf(neighbour) > -1) || 
                     neighbour.state === vertexStates.blocked) {
                    continue;
                }

                let currG = current.g + 1;

                let currIsBetter;
                // pokud soused není v otevřených
                if (this.openedVerteces.indexOf(neighbour) < 0) {
                    this.openedVerteces.push(neighbour);
                    currIsBetter = true;
                }
                else if (currG < neighbour.g) {
                    currIsBetter = true;
                }
                else {
                    currIsBetter = false;
                }

                if (currIsBetter) {
                    neighbour.show(colors.color4);
                    neighbour.prev = current;
                    neighbour.g = currG;
                    neighbour.h = this.heuristic(neighbour);
                    neighbour.f = neighbour.g + neighbour.h;
                }
            }

        }
        else {
            this.finished = true;
        }

    }

    heuristic(vertex) {
        let a = Math.abs(vertex.x - this.endVertex.x);
        let b = Math.abs(vertex.y - this.endVertex.y);
        let c = Math.sqrt(Math.pow(a,2) + Math.pow(b, 2));
        return c;
    }

    showResult() {
        let prev = this.endVertex.prev;
        while (prev.prev) {
            prev.show(colors.color5);
            prev = prev.prev;
        }
    }
}