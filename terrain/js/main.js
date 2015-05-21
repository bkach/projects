// Scene
var scene = new THREE.Scene();

// Camera
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.z = 400;
camera.lookAt(new THREE.Vector3(0, 0, 0));
scene.add(camera);


// Clock
var clock = new THREE.Clock();

// Renderer
var renderer = new THREE.WebGLRenderer({
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff);

document.body.appendChild(renderer.domElement);

// Controls
controls = new THREE.TrackballControls(camera);

// Create Attributes
var attributes = {
  displacement: {
    type: 'f', // a float
    value: [] // an empty array
  },
  randomNum: {
    type: 'f',
    value: []
  }
};

// Create Uniforms
var uniforms = 
  THREE.UniformsUtils.merge([
    THREE.ShaderLib.lambert.uniforms,
    {
      amplitude: {
        type: 'f', // a float
        value: 0
      },
      //color: { type: "c", value: new THREE.Color( 0xdddddd ) },
      diffuse: { type: "c", value: new THREE.Color( 0x964b00 ) }
    }
  ]);

// Create Vertex Shader
vShader =
    ["attribute float displacement;",
     "attribute float randomNum;",
     "uniform float amplitude;",
     "varying vec3 vNewPosition;",
     "varying float vRandomNum;",
     THREE.ShaderLib.lambert.vertexShader.replace(/\r?\n?[^\r\n]*$/, ""), // Remove last line 
     "vec3 newPosition = position + normal * vec3(displacement * amplitude);",
     "vNewPosition = newPosition;",
     "vRandomNum = randomNum;",
     "gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition,1.0);",
		 "}"
      ].join("\n")
    ;

fShader =
  [
     "varying vec3 vNewPosition;",
     "varying float vRandomNum;",
     THREE.ShaderLib.lambert.fragmentShader.replace(/\r?\n?[^\r\n]*$/, ""), // Remove last line 
     "gl_FragColor = mix( gl_FragColor, vec4(150.0/255.0,75.0/255.0,0.0,1.0), vNewPosition.z / 63.0);",
     "if(vNewPosition.z > 30.0 + 5.0 * vRandomNum){",
       "gl_FragColor = mix( gl_FragColor, vec4(1.0,1.0,1.0,1.0), vNewPosition.z / 63.0);",
     "}",
   "}"

  ].join("\n")
  ;

// Create Shader Material
var shaderMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    attributes: attributes,
    vertexShader: vShader,
    fragmentShader: fShader,
    color: 0xff0000,
    lights: true
});
// Plane
var width,height;
width = height = 300;
var geometry = new THREE.PlaneGeometry(width, height, width, height);
var plane = new THREE.Mesh(geometry,shaderMaterial); 
plane.rotation.x = -Math.PI/4;
scene.add(plane);

// Populates the Array of attributes
var verts = geometry.vertices;
var values = attributes.displacement.value;

function generateHeight( width, height ) {
  var size = width * height, data = new Uint8Array( size ),
  perlin = new ImprovedNoise(), quality = 0.3, z = Math.random() * 100;
  for ( var j = 0; j < 4; j ++ ) {
    for ( var i = 0; i < size; i ++ ) {
      var x = i % width, y = ~~ ( i / width );
      data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );
    }
    quality *= 5;
  }
  return data;
}

data = generateHeight(width,height);
maxValue = 0

for (var v = 0; v < verts.length; v++) {
  if(data[v] > maxValue){
    maxValue = data[v];
  }
  values.push(data[v]);
  attributes.randomNum.value.push(Math.random());
}

// Lights
var light = new THREE.PointLight( 0xffffff, 1, 500 );
light.position.set( 0, 175, 300 );
scene.add( light );

// Animation
frame = 0;
paused = false;
function update() {
  if(!paused){
    uniforms.amplitude.value = Math.abs(Math.sin(frame));
    frame += 0.01;
  }
  requestAnimationFrame(update);
  renderer.render(scene, camera);
  controls.update(clock.getDelta());
}

// Handle Resize
window.addEventListener('resize', onWindowResize, false);
function onWindowResize(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  controls.handleResize();
};

// Keyboard Listeners
document.addEventListener("keydown", function(e) {
  // up
  if ( e.keyCode === 38 ){
    uniforms.amplitude.value += 0.1;
  } 
  // down
  if ( e.keyCode === 40 ){
    uniforms.amplitude.value -= 0.1;
  }
  // left
  if ( e.keyCode === 37 ){
    plane.rotation.y += 0.01
  }
  // right
  if ( e.keyCode === 39 ){
    plane.rotation.y -= 0.01
  }
  // space
  if ( e.keyCode === 32 ){
    paused = !paused;
  }
}, false);

//document.addEventListener("keyup", keyUp, false);

update();
