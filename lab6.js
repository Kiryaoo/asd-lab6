const variant = 3312;
const variantString = variant.toString();
const n1 = parseInt(variantString[0]);
const n2 = parseInt(variantString[1]);
const n3 = parseInt(variantString[2]);
const n4 = parseInt(variantString[3]);

const numTops = n3 + 10;
const coefficient = 1 - n3 * 0.01 - n4 * 0.005 - 0.05;


let matrixDirected = [];
let matrixUndirected = [];

for (let i = 0; i < numTops; i++) {
    let row = [];
    for (let j = 0; j < numTops; j++) {
        let elem = (Math.random() * 2) * coefficient;
        row.push(Math.floor(elem));
    }
    matrixDirected.push(row);
}

for (let i = 0; i < numTops; i++) {
    let row = [];
    for (let j = 0; j < numTops; j++) {
        row.push(matrixDirected[i][j] || matrixDirected[j][i]);
    }
    matrixUndirected.push(row);
}

console.log("Directed matrix:");
console.log(matrixDirected);
console.log("Undirected matrix:");
console.log(matrixUndirected);

// 1. Створення матриці B
let B = [];
for (let i = 0; i < numTops; i++) {
    let row = [];
    for (let j = 0; j < numTops; j++) {
        row.push(Math.random() * 2.0);

    }
    B.push(row);
}

console.log("Matrix B:");
console.log(B);

// 2. Створення матриці C
let C = [];
for (let i = 0; i < numTops; i++) {
    let row = [];
    for (let j = 0; j < numTops; j++) {
        row.push(Math.ceil(B[i][j] * 100 * matrixUndirected[i][j]));
    }
    C.push(row);
}

console.log("Matrix C:");
console.log(C);

// 3. Створення матриці D
let D = [];
for (let i = 0; i < numTops; i++) {
    let row = [];
    for (let j = 0; j < numTops; j++) {
        row.push(C[i][j] > 0 ? 1 : 0);
    }
    D.push(row);
}

console.log("Matrix D:");
console.log(D);

// 4. Створення матриці H
let H = [];
for (let i = 0; i < numTops; i++) {
    let row = [];
    for (let j = 0; j < numTops; j++) {
        row.push(D[i][j] !== D[j][i] ? 1 : 0);
    }
    H.push(row);
}

console.log("Matrix H:");
console.log(H);

// 5. Створення верхньої трикутної матриці Tr
let Tr = [];
for (let i = 0; i < numTops; i++) {
    let row = [];
    for (let j = 0; j < numTops; j++) {
        row.push(i < j ? 1 : 0);
    }
    Tr.push(row);
}

console.log("Upper triangular matrix Tr:");
console.log(Tr);

// 6. Створення симетричної матриці ваг W
let W = [];
for (let i = 0; i < numTops; i++) {
    let row = [];
    for (let j = 0; j < numTops; j++) {
        let wij = (D[i][j] + H[i][j] + Tr[i][j]) * C[i][j];
        row.push(wij);
    }
    W.push(row);
}

// Симетризація матриці W
for (let i = 0; i < numTops; i++) {
    for (let j = 0; j < i; j++) {
        W[i][j] = W[j][i];
    }
}

console.log("Weight matrix W:");
console.log(W);

// Функція для зображення ваги ребра на лінії
function drawEdgeWeight(x1, y1, x2, y2, weight) {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    ctx.fillStyle = 'black';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillText(weight, midX, midY);
}

// Функція для зображення графа з вагами ребер
function drawWeightedEdges() {
    for (let i = 0; i < numTops; i++) {
        for (let j = i; j < numTops; j++) {
            if (matrixUndirected[i][j] === 1) {
                const weight = W[i][j];
                if (i === j) {
                    drawSelfLoop(arrOfNode[j], weight);
                } else {
                    chooseLine(arrOfNode[i].x, arrOfNode[i].y, arrOfNode[j].x, arrOfNode[j].y, weight);
                }
            }
        }
    }
}

// Функція для зображення кістяка з вагами ребер
function drawMSTWeightedEdges() {
    ctx.strokeStyle='orange';
    ctx.fillStyle = 'black';
    for (const [u, v] of mst) {
        const weight = W[u][v];
        chooseLine(arrOfNode[u].x, arrOfNode[u].y, arrOfNode[v].x, arrOfNode[v].y, weight);
    }
    ctx.strokeStyle = 'black';
}

// Кнопка для покрокового виконання алгоритму Краскала
const stepButton = document.getElementById('stepButton');
stepButton.addEventListener('click', () => {
    kruskalStep();
    ctx.clearRect(-width / 2, -height / 1.25, width, height);
    createVertex();
    drawWeightedEdges();
    drawMSTWeightedEdges();
});

// Функція для виконання алгоритму Краскала
let edges = [];
for (let i = 0; i < numTops; i++) {
    for (let j = i + 1; j < numTops; j++) {
        if (W[i][j] > 0) {
            edges.push([i, j, W[i][j]]);
        }
    }
}
edges.sort((a, b) => a[2] - b[2]);

let parent = [];
for (let i = 0; i < numTops; i++) parent[i] = i;

function find(x) {
    if (parent[x] !== x) {
        parent[x] = find(parent[x]);
    }
    return parent[x];
}

function union(x, y) {
    parent[find(x)] = find(y);
}

let mst = [];
let edgeIndex = 0;
let activeVertices = [];
let  totalWeight = 0;
function kruskalStep() {
    if (mst.length === numTops - 1 || edgeIndex >= edges.length) {
        return;
    }

    const [u, v, weight] = edges[edgeIndex++];

    activeVertices = [u, v];
    if (find(u) !== find(v)) {
        union(u, v);
        mst.push([u, v]);
        console.log(`Edge added: (${u}, ${v}) with weight ${weight}`);
        totalWeight+=weight;
        console.log(`Total weight: (${totalWeight})`);
    }
    else {
        console.log(`Self-loop ignored: (${u}, ${v})`);
    }
}


const width = 1000;
const height = 1000;
const vertexRadius = 30;
const arrOfNode = [];
const arrOfThreeNodes = [
    { x: -300, y: 0 },   // Coordinates for AC
    { x: 0, y: -600 },   // Coordinates for BC
    { x: 300, y: 0 }     // Coordinates for AB
];

const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');

canvas.width = width;
canvas.height = height;

function transformCoordinateArea() {
    ctx.translate(width / 2, height / 1.25);
}

function drawCircle(x, y, num, radius, isActive = false) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(num, x, y);
}

transformCoordinateArea();

function createVertex() {
    const lengthAB = Math.sqrt(((-300 - 300) ** 2) + (0 ** 2));
    const lengthBC = Math.sqrt(((300) ** 2) + (0 - (-600)) ** 2);
    const lengthAC = lengthBC;

    const cosAngle = 300 / lengthAC;
    const sinAngle = Math.sqrt(1 - cosAngle ** 2);

    const dXAC = (lengthAC * cosAngle) / 4;
    const dYAC = (lengthAC * sinAngle) / 4;

    const dXBC = (lengthAC * cosAngle) / 4;
    const dYBC = (lengthAC * sinAngle) / 4;

    const dXAB = lengthAB / 3;

    let XforAC = -300;
    let YforAC = 0;
    let XforBC = 0;
    let YforBC = -600;
    let XforAB = 300;

    for (let i = 0; i < 4; i++) {
        arrOfNode.push({ x: XforAC, y: YforAC });
        drawCircle(XforAC, YforAC, String.fromCharCode(65 + i), vertexRadius, activeVertices.includes(arrOfNode.length)); // A, B, C, D
        XforAC += dXAC;
        YforAC -= dYAC;
    }

    for (let i = 0; i < 4; i++) {
        arrOfNode.push({ x: XforBC, y: YforBC });
        drawCircle(XforBC, YforBC, String.fromCharCode(69 + i), vertexRadius, activeVertices.includes(arrOfNode.length)); // E, F, G, H
        XforBC += dXBC;
        YforBC += dYBC;
    }

    for (let i = 0; i < 3; i++) {
        arrOfNode.push({ x: XforAB, y: 0 });
        drawCircle(XforAB, 0, String.fromCharCode(73 + i), vertexRadius, activeVertices.includes(arrOfNode.length)); // I, J, K
        XforAB -= dXAB;
    }
}

createVertex();

function drawSelfLoop(coordinate, weight) {
    ctx.beginPath();
    ctx.arc(coordinate.x - 45, coordinate.y, 20, Math.PI / 6, (Math.PI * 11) / 6);
    ctx.stroke();
    ctx.closePath();
    drawEdgeWeight(coordinate.x - 45, coordinate.y - 20, coordinate.x - 45, coordinate.y + 20, weight);
}

function drawArcLine(start, end, bendAngle = Math.PI / 8) {
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;

    let controlX, controlY;

    if (start.x !== end.x && start.y !== end.y) {
        controlX = midX + Math.cos(bendAngle) * (midY - start.y);
        controlY = midY + Math.sin(bendAngle) * (midX - start.x);
    } else if (start.x === end.x) {
        controlX = midX + 100;
        controlY = midY;
    } else {
        controlX = midX;
        controlY = midY + 100;
    }

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.quadraticCurveTo(controlX, controlY, end.x, end.y);
    ctx.stroke();
    ctx.closePath();
}

function chooseLine(x1, y1, x2, y2, weight) {
    if (checkFunction({ x: x1, y: y1 }, { x: x2, y: y2 })) {
        drawArcLine({ x: x1, y: y1 }, { x: x2, y: y2 });
    } else {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.closePath();
    }
    drawEdgeWeight(x1, y1, x2, y2, weight);
}

function checkFunction(start, end) {
    const [A, B, C] = arrOfThreeNodes;

    function isPointOnLineSegment(P, A, B) {
        const crossProduct = (P.y - A.y) * (B.x - A.x) - (P.x - A.x) * (B.y - A.y);
        if (Math.abs(crossProduct) !== 0) return false;

        const dotProduct = (P.x - A.x) * (B.x - A.x) + (P.y - A.y) * (B.y - A.y);
        if (dotProduct < 0) return false;

        const squaredLengthBA = (B.x - A.x) ** 2 + (B.y - A.y) ** 2;
        if (dotProduct > squaredLengthBA) return false;

        return true;
    }

    function isOnSameEdge(P1, P2, A, B) {
        return isPointOnLineSegment(P1, A, B) && isPointOnLineSegment(P2, A, B);
    }

    return (
        isOnSameEdge(start, end, A, B) ||
        isOnSameEdge(start, end, B, C) ||
        isOnSameEdge(start, end, C, A)
    );
}
