let width = 600;
let height = 400;
const cellSize = 30;
let colors;
let vertexStates;
let graph = [];
let countXCells;
let countYCells;
let simIsRunning = false;

let startVertex;
let endVertex;
let algorithm;

let selectAlgo;
let runButton;
let newButton;

function setup() {
    width = windowWidth * 0.7;
    height = windowHeight * 0.7;
    frameRate(20);
    createControls();
    initVertexStates();
    initColors();

    let canvas = createCanvas(width, height);
    canvas.parent("sketch");

    newButtonClick();
}

function draw() {
    if (simIsRunning) {
        algorithm.update();
        if (algorithm.finished) {
            algorithm.showResult();
            simIsRunning = false;
        }
    }
}

// create controls
function createControls() {
    textAlign(CENTER);
    background(200);
    selectAlgo = createSelect();
    selectAlgo.position(15, height);
    selectAlgo.option('Dijkstra');
    selectAlgo.option('A*');
    selectAlgo.selected("Dijkstra")

    runButton = createButton("Start");
    runButton.position(100, height);
    runButton.mousePressed(runButtonClick)

    newButton = createButton("New graph");
    newButton.position(200, height);
    newButton.mousePressed(newButtonClick);
}

// run button click
function runButtonClick() {
    if (selectAlgo.value() === "Dijkstra") {
        algorithm = new Dijkstra(startVertex, endVertex);
    }
    else if (selectAlgo.value() === "A*") {
        algorithm = new AStar(startVertex, endVertex);
    }
    background(colors.white);
    showGraph();
    simIsRunning = true;
}

// new button click
function newButtonClick() {
    createGraph();
    startVertex = randomStart();
    endVertex = randomEnd();
    background(colors.white);
    showGraph();
}


// create new graph
function createGraph() {
    countXCells = Math.floor(width / cellSize) - 1;
    countYCells = Math.floor(height / cellSize) - 1;


    graph = [];
    for (let y = 0; y < countYCells; y++) {
        graph.push([]);
        for (let x = 0; x < countXCells; x++) {
            rectMode(CORNER);
            let vertex = new Vertex(x, y, cellSize);
            graph[y].push(vertex);
            if (int(random(4)) % 4 == 0) {
                vertex.state = vertexStates.blocked;
            }
        }
    }
}

// get random start
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

// get random end
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

// render graph
function showGraph() {
    for (let y = 0; y < countYCells; y++) {
        for (let x = 0; x < countXCells; x++) {
            graph[y][x].show();
        }
    }
}

// get neightbors of vertex
function getNeightbors(vertex) {
    let neightbors = [];

    // N
    if (vertex.y > 0) {
        let neightbor = graph[vertex.y - 1][vertex.x];
        neightbors.push(neightbor);
    }

    // E
    if (vertex.x < countXCells - 1) {
        let neightbor = graph[vertex.y][vertex.x + 1];
        neightbors.push(neightbor);
    }

    // S
    if (vertex.y < countYCells - 1) {
        let neightbor = graph[vertex.y + 1][vertex.x];
        neightbors.push(neightbor);
    }

    // W
    if (vertex.x > 0) {
        let neightbor = graph[vertex.y][vertex.x - 1];
        neightbors.push(neightbor);
    }
    return neightbors;
}

// initialize colors const
function initColors() {
    colors = {
        black: color(0, 0, 0),
        white: color(255, 255, 255),
        color1: color(42, 237, 53),
        color2: color(230, 57, 70),
        color3: color(91, 93, 94),
        color4: color(12, 182, 238),
        color5: color(234, 239, 50)
    };
}

// init vertex states const
function initVertexStates() {
    vertexStates = {
        empty: 0,
        blocked: 1,
        start: 2,
        end: 3
    };
}

// vertex class
class Vertex {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.state = vertexStates.empty;
        this.prev = null;

        // current distance to this vertex from the start
        this.dist = Number.MAX_SAFE_INTEGER;

        // lenght of current optimal path
        this.g = null;
        // presuming lenght of path between start and end going through this vertex
        this.f = null;
        // heuristic guess to end
        this.h = null;
    }

    // render vertex
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

// dijkstra algorithm
class Dijkstra {

    constructor(stVert, enVert) {
        this.closedVerteces = [];
        this.openedVerteces = [];
        this.startVertex = stVert;
        this.endVertex = enVert;
        this.current = this.startVertex;
        this.finished = false;

        // fill open verteces
        for (let y = 0; y < countYCells; y++) {
            for (let x = 0; x < countXCells; x++) {
                let vertex = graph[y][x];
                this.openedVerteces.push(vertex);
            }
        }

        // init properties
        this.startVertex.dist = 0;
        // close start vertex
        this.closedVerteces.push(this.startVertex);
        let index = this.openedVerteces.indexOf(this.startVertex);
        this.openedVerteces.splice(index, 1);
    }

    // step of dijkstra
    update() {
        if (this.openedVerteces.length > 0) {
            // neightbors
            let neightbors = getNeightbors(this.current);
            for (let neightbor of neightbors) {
                //  neightbor is still open && neightbor is not blocked
                if ((this.closedVerteces.indexOf(neightbor) < 0) && neightbor.state !== vertexStates.blocked) {

                    let altDist = this.current.dist + 1;
                    // new distance is better then current
                    if (altDist < neightbor.dist) {
                        neightbor.dist = altDist;
                        neightbor.prev = this.current;
                    }
                }
            }

            // select nearest vertex
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

            // close nearest vertex
            this.closedVerteces.push(nearestVertex);
            let index = this.openedVerteces.indexOf(nearestVertex);
            this.openedVerteces.splice(index, 1);

            // repeat for nearest vertex
            this.current = nearestVertex;
        }
        else {
            this.finished = true;
        }
    }

    // render result
    showResult() {
        let prev = this.endVertex.prev;
        while (prev.prev) {
            prev.show(colors.color5);
            prev = prev.prev;
        }
    }
}

// a* algortihm
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
            // open vertex with smallest F
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

            if (current !== this.startVertex) {
                current.show(colors.color4);
            }

            // close current vertex
            let index = this.openedVerteces.indexOf(current);
            this.openedVerteces.splice(index, 1);
            this.closedVertece.push(current);

            let neighbours = getNeightbors(current);
            for (let neighbour of neighbours) {
                // if neightbor is close || neightbor is blocked
                if ((this.closedVertece.indexOf(neighbour) > -1) ||
                    neighbour.state === vertexStates.blocked) {
                    continue;
                }

                let currG = current.g + 1;

                let currIsBetter;
                // if neightbor is not open
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

    // heuristic function
    heuristic(vertex) {
        let a = Math.abs(vertex.x - this.endVertex.x);
        let b = Math.abs(vertex.y - this.endVertex.y);
        let c = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
        return c;
    }

    // render result
    showResult() {
        let prev = this.endVertex.prev;
        while (prev.prev) {
            prev.show(colors.color5);
            prev = prev.prev;
        }
    }
}