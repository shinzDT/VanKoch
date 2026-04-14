const canvas = document.getElementById("glcanvas");

let lines = [];

const gl = canvas.getContext("webgl");
if (!gl) { 
    alert("WebGL không hỗ trợ ");
}

const vertexShaderSource = `

attribute vec2 position;

void main()
{
    gl_Position =
        vec4(position, 0.0, 1.0);
}

`;

const fragmentShaderSource = `

precision mediump float;

void main()
{
    gl_FragColor =
        vec4(0.0, 1.0, 1.0, 1.0);
}

`;

function createShader(type, source) {
    const shader =
        gl.createShader(type);

    gl.shaderSource(
        shader,
        source
    );
    
    gl.compileShader(shader);

    return shader;
}

function createProgram(vsSource, fsSource) {
    const program =
        gl.createProgram();

    const vertexShader =
        createShader(
            gl.VERTEX_SHADER,
            vsSource
        );

    const fragmentShader =
        createShader(
            gl.FRAGMENT_SHADER,
            fsSource
        );

    gl.attachShader(
        program,
        vertexShader
    );

    gl.attachShader(
        program,
        fragmentShader
    );

    gl.linkProgram(program);

    return program;
}

const program =
    createProgram(
        vertexShaderSource,
        fragmentShaderSource
    );

gl.useProgram(program);

function toWebGLX(x) {
    return (x / canvas.width) * 2 - 1;
}

function toWebGLY(y) {
    return 1 - (y / canvas.height) * 2;
}

function main() {
    lines = [];

    const levelInput =
        document.getElementById("level-input");

    const level =
        parseInt(levelInput.value);

    const centerX =
        canvas.width / 2;

    const centerY =
        canvas.height / 2;

    const edgeLength =
        300;

    // Tam giác đều

    const p1 =
    {
        x: centerX - edgeLength / 2,
        y: centerY + (edgeLength * Math.sqrt(3)) / 6
    };

    const p2 =
    {
        x: centerX + edgeLength / 2,
        y: centerY + (edgeLength * Math.sqrt(3)) / 6
    };

    const p3 =
    {
        x: centerX,
        y: centerY - (edgeLength * Math.sqrt(3)) / 3
    };

    recursiveKoch(p1, p2, level);
    recursiveKoch(p2, p3, level);
    recursiveKoch(p3, p1, level);

    drawLines();
}
function recursiveKoch(p1, p2, depth) {
    if (depth === 0) {
        lines.push(
            {
                x1: p1.x,
                y1: p1.y,
                x2: p2.x,
                y2: p2.y
            });

        return;
    }

    const dx =
        (p2.x - p1.x) / 3;

    const dy =
        (p2.y - p1.y) / 3;

    const A =
    {
        x: p1.x + dx,
        y: p1.y + dy
    };

    const B =
    {
        x: p1.x + 2 * dx,
        y: p1.y + 2 * dy
    };

    const angle =
        Math.PI / 3;

    const C =
    {
        x:
            A.x +
            dx * Math.cos(angle) -
            dy * Math.sin(angle),

        y:
            A.y +
            dx * Math.sin(angle) +
            dy * Math.cos(angle)
    };

    recursiveKoch(p1, A, depth - 1);
    recursiveKoch(A, C, depth - 1);
    recursiveKoch(C, B, depth - 1);
    recursiveKoch(B, p2, depth - 1);
}

function drawLines() {
    let vertices = [];

    for (const line of lines) {
        vertices.push(
            toWebGLX(line.x1),
            toWebGLY(line.y1)
        );

        vertices.push(
            toWebGLX(line.x2),
            toWebGLY(line.y2)
        );
    }

    const vertexArray =
        new Float32Array(vertices);

    const buffer =
        gl.createBuffer();

    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        buffer
    );

    gl.bufferData(
        gl.ARRAY_BUFFER,
        vertexArray,
        gl.STATIC_DRAW
    );

    const positionLocation =
        gl.getAttribLocation(
            program,
            "position"
        );

    gl.enableVertexAttribArray(
        positionLocation
    );

    gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
    ); // Mỗi vertex có 2 giá trị x và y 

    gl.clearColor(0,0,0,1);

    gl.clear(
        gl.COLOR_BUFFER_BIT
    );

    gl.drawArrays(
        gl.LINES,
        0,
        vertexArray.length / 2
    );
}