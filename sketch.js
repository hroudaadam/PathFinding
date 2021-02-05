const width = 600;
const height = 400;
const cellSize = 30;
let colors;
let vertexStates;
let graph = [];
let countXCells;
let countYCells;
let dijkstra;

function setup() {
    
    initColors();
    initVertexStates();
    
    createCanvas(width, height);
    background(colors.white);
    frameRate(10);
    
    graph = createGraph();
    dijkstra = new Dijkstra(graph[3][0], graph[4][6]);
    showGraph();
}

function draw() {
    dijkstra.update();
    if (dijkstra.finished) {
        noLoop();
        dijkstra.showResult();
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
        }
    }
    return output;
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
        color1: color(42, 157, 143),
        color2: color(230, 57, 70),
        color3: color(141, 153, 174),
        color4: color(204, 219, 253),
        color5: color(72, 202, 228),
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
                vertex.dist = Number.MAX_SAFE_INTEGER;
                this.openedVerteces.push(vertex);
            }
        }

        // nastavení vlastností startového vrcholu
        this.startVertex.dist = 0;
        this.startVertex.prev = null;
        this.startVertex.state = vertexStates.start;
        // uzavření startového vrcholu
        this.closedVerteces.push(this.startVertex);
        let index = this.openedVerteces.indexOf(this.startVertex);
        this.openedVerteces.splice(index, 1);
        // nastavení koncového vrcholu
        this.endVertex.state = vertexStates.end;
    }

    update() {
        if (this.openedVerteces.length > 0) {
            // kontrola sousedních vrcholů
            let neightbors = getNeightbors(this.current);
            for (let neightbor of neightbors) {
                // sousední vrchol ještě není uzavřený
                if (this.closedVerteces.indexOf(neightbor) < 0) {
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
    }

    showResult() {
        let prev = this.endVertex.prev;
        while (prev.prev) {
            prev.show(colors.color5);
            prev = prev.prev;
        }

    }
}