const negate = (v) => {
    return {
        x: -v.x,
        y: -v.y,
        z: -v.z
    };
};

const matrix_mul_vec = (M, v) => {
    return {
        x: M[0].x*v.x + M[1].x*v.y + M[2].x*v.z,
        y: M[0].y*v.x + M[1].y*v.y + M[2].y*v.z,
        z: M[0].z*v.x + M[1].z*v.y + M[2].z*v.z,
    };
};

const matrix_mul_matrix = (M1, M2) => {
    return [
        matrix_mul_vec(M1,M2[0]),
        matrix_mul_vec(M1,M2[1]),
        matrix_mul_vec(M1,M2[2]),
    ];
};

const cross_product = (v1, v2) => {
    let v = math.cross(
        [v1.x, v1.y, v1.z],
        [v2.x, v2.y, v2.z]
    );
    return {
        x: v[0],
        y: v[1],
        z: v[2]
    };
};

const inverse = (M) => {
    M = math.inv([
        [M[0].x, M[1].x, M[2].x],
        [M[0].y, M[1].y, M[2].y],
        [M[0].z, M[1].z, M[2].z],
    ]);
    return [
        {x: M[0][0], y: M[1][0], z: M[2][0]},
        {x: M[0][1], y: M[1][1], z: M[2][1]},
        {x: M[0][2], y: M[1][2], z: M[2][2]}
    ];
};

init({
    fullScreen: true,
});

let points = [
    {x:2,y:2,z:2},
    {x:4,y:5,z:3},
    {x:4,y:2,z:2},
    {x:3.5,y:1,z:2.5}
];
let triangles = [
    [0,1,2],
    [0,1,3],
    [0,2,3],
    [1,2,3],
];
let gridPoints = [];
for (let z=1; z<=5; z++) {
    gridPoints[z] = [];
    for (let y=0; y<5; y++) {
        gridPoints[z][y] = [];
        for (let x=0; x<5; x++) {
            gridPoints[z][y][x] = {x:x,y:y,z:z};
        }
    }
}

let camera = {
    x: 0,
    y: 0,
    z: 0,
    xbase: {
        x: 1,
        y: 0,
        z: 0
    },
    ybase: {
        x: 0,
        y: 1,
        z: 0
    }
};

const angle = (Math.PI/180)*30;
const szx = 5, szy = 5;
const f = Math.sqrt(szx*szx+szy*szy)/(2*Math.tan(angle/2));
//f/20+f * x =
//f/60+f * 3x 
//60+3f = 

const transform = (p,M) => {
    let pt = {
        x:p.x-camera.x,
        y:p.y-camera.y,
        z:p.z-camera.z
    };
    pt = matrix_mul_vec(
        M,
        pt
    );
    pt.x *= f/(f+pt.z);
    pt.y *= f/(f+pt.z);
    //pt.x /= pt.z;
    //pt.y /= pt.z;
    pt.x *= canvas.height/szx;
    pt.y *= canvas.height/szy;
    pt.y = canvas.height-pt.y;
    return pt;
};

const colors = ['red', 'green', 'blue', 'yellow', 'orange', 'brown', 'pink', 'purple', 'magenta', 'black', 'violet', 'mint', 'lime', 'navy', 'cobalt'];

function draw() {
    context.strokeRect(0,0,canvas.width,canvas.height);

    const M = inverse([
        camera.xbase,
        camera.ybase,
        cross_product(
            camera.xbase,
            camera.ybase
        )
    ]);

    let trPoints = points.map((p)=>transform(p,M));
    let trgPoints = gridPoints.map((l)=>l.map((r)=>r.map((p)=>transform(p,M))));

    let segs = [];
    for (let tr of triangles) 
        for (let seg of tr.map((p,i) => [trPoints[tr[i]],trPoints[tr[(i+1)%3]]])) {
            segs.push(seg);
        }

    for (let z=1; z<=5; z++)
        for (let y=0; y<5; y++)
            for (let x=0; x<5; x++) {
                if (x+1<5) {
                    segs.push([trgPoints[z][y][x], trgPoints[z][y][x+1]]); 
                }
                if (y+1<5) {
                    segs.push([trgPoints[z][y][x], trgPoints[z][y+1][x]]); 
                }
                if (z+1<=5) {
                    segs.push([trgPoints[z][y][x], trgPoints[z+1][y][x]]); 
                }
            }

    for (let i=0; i<trPoints.length; i++) {
        context.fillStyle = colors[i];
        context.beginPath();
        context.arc(trPoints[i].x, trPoints[i].y, 5, 0, 2*Math.PI);
        context.fill();
    }

    for (let seg of segs) {
        context.beginPath();
        context.moveTo(seg[0].x, seg[0].y);
        context.lineTo(seg[1].x, seg[1].y);
        context.stroke();
    }
};

const move = (vec) => {
    camera.x += vec.x*0.1;
    camera.y += vec.y*0.1;
    camera.z += vec.z*0.1;
};

// f/f+50 * 8 = f/f+200 * 50
// 1/f+50 = 1/f+200 * 4
// 4*(f+50) = f+200

function update() {
    if (keyPressed['w']) {
        const dir = cross_product(camera.xbase, camera.ybase);
        dir.y = 0;
        move(dir);
    }
    if (keyPressed['s']) {
        const dir = cross_product(camera.ybase, camera.xbase);
        dir.y = 0;
        move(dir);
    }
    if (keyPressed['a']) {
        move(negate(camera.xbase));
    }
    if (keyPressed['d']) {
        move(camera.xbase);
    }
    if (keyPressed[' ']) {
        move({
            x: 0,
            y: 1,
            z: 0
        });
    }
    if (keyPressed['Shift']) {
        move({
            x: 0,
            y: -1,
            z: 0
        });
    }
    if (keyPressed['ArrowUp']) {
        changeLook(0, -0.001);
    }
    if (keyPressed['ArrowDown']) {
        changeLook(0, 0.001);
    }
    if (keyPressed['ArrowLeft']) {
        changeLook(0.001, 0);
    }
    if (keyPressed['ArrowRight']) {
        changeLook(-0.001, 0);
    }
};

const changeLook = (hor, ver) => {
    hor *= Math.PI*2;
    ver *= Math.PI*2;
    let H = [
        {x:Math.cos(hor), y:0, z:Math.sin(hor)},
        {x:0, y:1, z:0},
        {x:-Math.sin(hor), y:0, z:Math.cos(hor)},
    ];
    let V = [
        {x:1, y:0, z:0},
        {x:0, y:Math.cos(ver), z:Math.sin(ver)},
        {x:0, y:-Math.sin(ver), z:Math.cos(ver)},
    ];
    let M = [
        camera.xbase,
        camera.ybase,
        cross_product(camera.xbase, camera.ybase)
    ];
    M = matrix_mul_matrix(H, M);
    M = matrix_mul_matrix(M, V);
    camera.xbase = M[0];
    camera.ybase = M[1];
};

setInterval(1000, () => {
    let x = [camera.xbase.x, camera.xbase.y, camera.xbase.z];
    let y = [camera.ybase.x, camera.ybase.y, camera.ybase.z];
    x = x.map((a) => a/math.dot(x,x));
    y = y.map((a) => a/math.dot(y,y));
    camera.xbase = {x:x[0], y:x[1], z:x[2]};
    camera.ybase = {x:y[0], y:y[1], z:y[2]};
});

let prevMouseX = -1, prevMouseY = -1;

function mousemove() {
    let dx = prevMouseX - mouseX;
    let dy = mouseY - prevMouseY;
    let goahead = true;
    if (prevMouseX == -1 && prevMouseY == -1) {
        goahead = false;
    }
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    if (goahead) {
        changeLook(dx/canvas.width, dy/canvas.height);
    }
}

let keyPressed = {};

function keydown(key) {
    keyPressed[key] = true;
}

function keyup(key) {
    keyPressed[key] = false;
}
