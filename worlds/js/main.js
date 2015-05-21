// Scene
var scene = new THREE.Scene();

var controlsEnabled = true;
var mouse = {
  x: 0,
  y: 0
};
var clock = new THREE.Clock();

// Camera
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
scene.add(camera);
camera.position.z = 400;
camera.lookAt(new THREE.Vector3(0, 0, 0));


// Renderer
var renderer = new THREE.WebGLRenderer({
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff);
renderer.shadowMapEnabled = true;
renderer.shadowMapType = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

if (controlsEnabled) {
  controls = new THREE.TrackballControls(camera);
}

var boxSize = 5000;

// Bounding Box
var geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize, 10, 10, 10);
var material = new THREE.MeshBasicMaterial({
  color: 0x000000,
  wireframe: true,
  transparent: false
});
var boundingBox = new THREE.Mesh(geometry, material);
scene.add(boundingBox);

function distance(p1,p2){
  return Math.sqrt(Math.pow(p2.x - p1.x,2) + Math.pow(p2.y - p1.y,2));
}

numSegments = 100;
var geometry = new THREE.SphereGeometry(50, numSegments, numSegments, 0, Math.PI, Math.PI/2, Math.PI/2);
heightMap = generateHeight(numSegments,numSegments);
for (var i = (geometry.vertices.length - 1); i >= 0; i--) {
  if(geometry.vertices[i].y >= 0)
    geometry.vertices[i].y == 0;
  else
    geometry.vertices[i].y -= heightMap[i];
};
geometry.applyMatrix( new THREE.Matrix4().makeScale( 1.5, 1.0, 1.0 ) );
var material = new THREE.MeshLambertMaterial( { 
    color: 0xa52a2a,
    side: THREE.DoubleSide,
    map: THREE.ImageUtils.loadTexture('img/rock.jpg') 
} );
var terrain = new THREE.Mesh( geometry, material );
terrain.castShadow = true;
terrain.receiveShadow = true;
// scene.add( terrain );

geometry = terrain.geometry.clone();
geometry.applyMatrix( new THREE.Matrix4().makeRotationY( Math.PI ));
var mS = (new THREE.Matrix4()).identity();
mS.elements[0] = -1;
geometry.applyMatrix( mS );
material = new THREE.MeshLambertMaterial( { 
    color: 0xa52a2a,
    side: THREE.DoubleSide,
    map: THREE.ImageUtils.loadTexture('img/grass.jpg') 
} );
terrain2 = new THREE.Mesh( geometry, material )
terrain2.castShadow = true;
terrain2.receiveShadow = true;
// scene.add(terrain2);


geometry = new THREE.SphereGeometry(50, numSegments, numSegments, 0, Math.PI, Math.PI/2, Math.PI);
geometry.applyMatrix( new THREE.Matrix4().makeRotationX( Math.PI ));
geometry.applyMatrix( new THREE.Matrix4().makeScale( 1.5, 1.0, 1.0 ) );
var material = new THREE.MeshLambertMaterial( { 
    side: THREE.DoubleSide,
    map: THREE.ImageUtils.loadTexture('img/grass.jpg')
});
var dome = new THREE.Mesh( geometry, material );
dome.castShadow = true;
dome.receiveShadow = true;

combined = new THREE.Mesh( new THREE.Geometry(), material );
combined.geometry.merge(dome.geometry);
combined.geometry.merge(terrain.geometry);
combined.geometry.merge(terrain2.geometry);

group = new THREE.Object3D();
group.add( terrain );
group.add( terrain2 );
group.add( dome );
scene.add( group );

group2 = new THREE.Object3D();
group2.translateZ(-200);
group2.add( combined );
scene.add( group2 );

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

var light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

var light = new THREE.SpotLight( 0xffffff, 4, 5000 );
light.position.set( 200, 200, 300 );
light.castShadow = true;
light.shadowDarkness = 0.5;
light.shadowCameraVisible = true;
scene.add( light );

var light = new THREE.SpotLight( 0xffffff, 4, 5000 );
light.position.set( -200, -200, -300 );
light.castShadow = true;
light.shadowDarkness = 0.5;
light.shadowCameraVisible = true;
scene.add( light );

document.addEventListener('mousemove', onDocumentMouseMove, false);


function onDocumentMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
};

// Raycasting
update = function() {
  var INTERSECTED, intersects, ray, vector;
  vector = new THREE.Vector3(mouse.x, mouse.y, 1);
  ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
  intersects = ray.intersectObjects(scene.children);
  if (intersects.length > 0) {
    if (intersects[0].object !== INTERSECTED) {
      if (INTERSECTED) {
        INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
      }
      INTERSECTED = intersects[0].object;
      INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
      // INTERSECTED.material.color.setHex(0xffff00);
    }
  } else {
    if (INTERSECTED) {
      INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
    }
    INTERSECTED = null;
  }
  if (controlsEnabled) {
    controls.update();
  }
};

var loc = {y:0, z:1};
var tween = TweenLite.to(loc, 3, {y:10, onUpdate:moveLoc, onComplete:finished,ease:Power1.easeInOut, onReverseComplete:finished2});
function moveLoc(){
  group.position.y = loc.y;
}
function finished(){
  tween.reverse();
}
function finished2(){
  tween.restart();
}

function render() {
  if (controlsEnabled) {
    controls.update(clock.getDelta());
  }
  requestAnimationFrame(render);
  renderer.render(scene, camera);
  update();
};

window.addEventListener('resize', onWindowResize, false);

var onWindowResize = function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (controlsEnabled) {
    controls.handleResize();
  }
};

render();
