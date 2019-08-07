var gl;

var recursiveLevel = 5;

var halfway = [];
halfway.push(vec2(0, 0));
halfway.push(vec2(2, 0));
halfway.push(vec2(1, 0));

window.onload = function init() {
  var canvas = document.getElementById( "gl-canvas" );

  gl = WebGLUtils.setupWebGL( canvas );
  if ( !gl ) { alert( "WebGL isn't available" ); }

  // Configure WebGL
  gl.viewport( 0, 0, canvas.width, canvas.height );
  gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

  // Load shaders and initialize attribute buffers
  var program = initShaders( gl, "vertex-shader", "fragment-shader" );
  gl.useProgram( program );

  // Fill vertex array using recursive function
  var vertices = [];
  vertices.push(vec2(-1, -1));
  vertices.push(vec2(0, 1));
  vertices.push(vec2(1, -1));
  vertices = vertices.concat(sierpinskiCoords(recursiveLevel, vertices));
  numPoints = vertices.length;

  // Make large triangle red and make other points white
  var colors = [];
  colors.push(vec3(1.0, 0.0, 0.0));
  colors.push(vec3(1.0, 0.0, 0.0));
  colors.push(vec3(1.0, 0.0, 0.0));
  for (var i = 0; i < (numPoints - 3); i++) {
    colors.push(vec3(1.0, 1.0, 1.0));
  }

  // Load coordinates into the GPU
  gl.bindBuffer( gl.ARRAY_BUFFER, gl.createBuffer() );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
  // Associate shader variables with data buffer
  var vPosition = gl.getAttribLocation( program, "vPosition" );
  gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vPosition );

  // Load colors into the GPU
  gl.bindBuffer( gl.ARRAY_BUFFER, gl.createBuffer() );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
  // Associate shader variables with data buffer
  var vColor = gl.getAttribLocation( program, "vColor" );
  gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vColor );

  render();
};

function sierpinskiCoords(level, bigTriCoords) {
  if (level == 0) {
    return [];
  }

  var vertices = [];
  var params = [];
  params.push(halfway[0]);
  params.push(halfway[1]);
  params.push(bigTriCoords[0]);
  params.push(bigTriCoords[1]);
  params.push(halfway[2]);
  vertices.push(map_point(params));
  params = [];
  params.push(halfway[0]);
  params.push(halfway[1]);
  params.push(bigTriCoords[1]);
  params.push(bigTriCoords[2]);
  params.push(halfway[2]);
  vertices.push(map_point(params));
  params = [];
  params.push(halfway[0]);
  params.push(halfway[1]);
  params.push(bigTriCoords[0]);
  params.push(bigTriCoords[2]);
  params.push(halfway[2]);
  vertices.push(map_point(params));

  if (level > 1) {
    var tri1 = [];
    tri1.push(bigTriCoords[0]);
    tri1.push(vertices[0]);
    tri1.push(vertices[2]);
    var tri2 = [];
    tri2.push(vertices[0]);
    tri2.push(bigTriCoords[1]);
    tri2.push(vertices[1]);
    var tri3 = [];
    tri3.push(vertices[2]);
    tri3.push(vertices[1]);
    tri3.push(bigTriCoords[2]);

    vertices = vertices.concat(sierpinskiCoords(level - 1, tri1));
    vertices = vertices.concat(sierpinskiCoords(level - 1, tri2));
    vertices = vertices.concat(sierpinskiCoords(level - 1, tri3));
  }

  return vertices;
}

function map_point(params) {
  var P = params[0];
  var Q = params[1];
  var A = params[2];
  var B = params[3];
  var X = params[4];

  var xDiffPart = P[0] - X[0];
  var yDiffPart = P[1] - X[1];
  var pxDist = Math.sqrt(xDiffPart * xDiffPart + yDiffPart * yDiffPart);
  var xDiffWhole = P[0] - Q[0];
  var yDiffWhole = P[1] - Q[1];
  var pqDist = Math.sqrt(xDiffWhole * xDiffWhole + yDiffWhole * yDiffWhole);

  var fraction = pxDist / pqDist;
  return mix(A, B, fraction);
}

function render() {
  gl.clear( gl.COLOR_BUFFER_BIT );
  gl.drawArrays( gl.TRIANGLES, 0, numPoints );
}
