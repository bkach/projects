// Remove scrollbars
document.documentElement.style.overflow = 'hidden';

// Scene
var scene = new THREE.Scene();

// Camera
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.z = 480;
scene.add(camera);

// Controls
trackball = new THREE.TrackballControls(camera);

// Renderer
var renderer = new THREE.WebGLRenderer({
  antialias: true
});
renderer.setPixelRatio( window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
document.body.appendChild(renderer.domElement);

// Point Lights
var sphereSize = 5;
var power = 700;
var rotation = Math.PI/6;

var pointLight1 = new THREE.PointLight(0xffffff,2,power);
pointLight1.position.y += 100.0;
scene.add(pointLight1);
var pointLightHelper1 = new THREE.PointLightHelper( pointLight1, sphereSize );
scene.add( pointLightHelper1 );

var pointLight2 = new THREE.PointLight(0xffffff,2,power);
pointLight2.position.y -= 100.0;
scene.add(pointLight2);
var pointLightHelper2 = new THREE.PointLightHelper( pointLight2, sphereSize );
scene.add( pointLightHelper2 );

var pointLight3 = new THREE.PointLight(0xffffff,2,power);
pointLight3.position.y -= 100.0;
scene.add(pointLight3);
var pointLightHelper3 = new THREE.PointLightHelper( pointLight3, sphereSize );
scene.add( pointLightHelper3 );

var pointLight4 = new THREE.PointLight(0xffffff,2,power);
pointLight4.position.y += 100.0;
scene.add(pointLight4);
var pointLightHelper4 = new THREE.PointLightHelper( pointLight4, sphereSize );
scene.add( pointLightHelper4 );

// Axis Helper
//var axisHelper = new THREE.AxisHelper(200);
//scene.add(axisHelper);

// Set uniforms
var uniforms = THREE.UniformsUtils.merge([
  THREE.ShaderLib.lambert.uniforms,
  {
    time : {type: 'f', value: 1.0}
  }
]);

// Set attributes
var attributes = {};

// Create shader material
function newSphereMaterial(vs,fs){
return new THREE.ShaderMaterial(
    {
        uniforms: uniforms,
        attributes: attributes,
        vertexShader: vs,
        fragmentShader: fs,
        transparent: false,
        color: 0xff0000,
        lights: true
    });
}
var shaderMaterialSphere = newSphereMaterial(vertexShaderSphere, fragmentShaderSphere);

// Create a sphere
var sphereRadius = 100;
var sphereGeometry = new THREE.SphereGeometry( sphereRadius, 128, 128 );
var sphereMaterial = shaderMaterialSphere;
var sphere         = new THREE.Mesh(sphereGeometry,sphereMaterial); 
scene.add( sphere );

// Create Plane
var shaderMaterialPlane = new THREE.ShaderMaterial(
{
    uniforms: uniforms,
    attributes: attributes,
    vertexShader: vertexShaderPlane,
    fragmentShader: fragmentShaderPlane,
    transparent: false,
    color: 0xff0000,
    lights: true,
    side: THREE.DoubleSide
});
var planeWidth    = sphereRadius * 2;
var planeHeight   = sphereRadius / 2;
var planeYPosition = -(sphereRadius + (sphereRadius/2));
var planeGeometry = new THREE.PlaneGeometry( planeWidth, planeHeight, 500 );
var planeMaterial = shaderMaterialPlane;
var plane         = new THREE.Mesh(planeGeometry,planeMaterial);
plane.position.set(0,planeYPosition,0);
//plane.lookAt(camera.position);
scene.add( plane );

// Create Text
var textFrontGeometry = new THREE.TextGeometry( "0                  0.5                  1" , 
    {
      font: "helvetiker",
      size: "12",
      height: 5
    });
var textFrontMaterial = new THREE.MeshLambertMaterial();
var textFront         = new THREE.Mesh(textFrontGeometry,textFrontMaterial);
textFront.position.set(-planeWidth / 2,planeYPosition + planeHeight/2 + 5,10);
scene.add( textFront );

var textBackGeometry = new THREE.TextGeometry( "1                  0.5                  0" , 
    {
      font: "helvetiker",
      size: "12",
      height: 5
    });
var textBackMaterial = new THREE.MeshLambertMaterial();
var textBack         = new THREE.Mesh(textBackGeometry,textBackMaterial);
textBack.rotation.y = Math.PI;
textBack.position.set(-planeWidth / 2 + 200,planeYPosition + planeHeight/2 + 5,0);

// postprocessing

//composer = new THREE.EffectComposer( renderer );
//var renderPass = new THREE.RenderPass( scene,camera );
//composer.addPass( renderPass );

//var effect = new THREE.ShaderPass( THREE.FXAAShader );
//effect.uniforms[ 'resolution' ].value = 
  //new THREE.Vector2(1/(window.innerWidth * window.devicePixelRatio),1/(window.innerHeight * window.devicePixelRatio));
//effect.renderToScreen = true;
//composer.addPass( effect );

// Rendering / Animation

function update(){
  requestAnimationFrame(update);

  // Rotate text based on camera
  if(camera.position.z < 0){
    scene.add(textBack);
    scene.remove(textFront);
  }
  else{
    scene.remove(textBack);
    scene.add(textFront);
  }
  //plane.position.set(camera.position.x,camera.position.y,camera.position.z - 200);
  //plane.lookAt(camera.position);

  // Rotate Sphere 
  //sphere.rotation.y += 0.3 * (Math.PI / 180);

  // Rotate Point Light
  //rotation += 0.01;
  pointLight1.position.x = Math.sin(rotation) * (power-200);
  pointLight1.position.z = Math.cos(rotation) * (power-200);
  pointLight1.lookAt(sphere.position);

  pointLight2.position.x = Math.sin(-rotation) * (power-200);
  pointLight2.position.z = Math.cos(-rotation) * (power-200);
  pointLight2.lookAt(sphere.position);

  pointLight3.position.x = Math.sin(Math.PI - rotation) * (power-200);
  pointLight3.position.z = Math.cos(Math.PI - rotation) * (power-200);
  pointLight3.lookAt(sphere.position);

  pointLight4.position.x = Math.sin(Math.PI + rotation) * (power-200);
  pointLight4.position.z = Math.cos(Math.PI + rotation) * (power-200);
  pointLight4.lookAt(sphere.position);

  uniforms.time.value += 0.5;

  renderer.render(scene, camera);
  //composer.render();
  trackball.update();
}

// Resize Window
function onWindowResize(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  //composer.setSize(window.innerWidth, window.innerHeight);
};

update();
window.addEventListener('resize', onWindowResize, false);

function replaceShader(finalCode){
  sphere.material = newSphereMaterial(
          [
          vertexInitializers,
          noiseCode,
          functionCode,
          colorBarGLSL,
          finalCode,
          threeVertexCode(vertexCode)
          ].join("\n"),

          [
          fragmentInitializers,
          noiseCode,
          functionCode,
          colorBarGLSL,
          finalCode,
          threeFragCode,
          fragmentCode,
          "}"
          ].join("\n"));
}

document.addEventListener("keydown", function(e) {
  // left
  if ( e.keyCode === 37 ){
  }
  // right
  else if ( e.keyCode === 39 ){
  }
  // 0
  else if ( e.keyCode === 48 ){
    replaceShader([
      'vec4 finalColor(){',
      '  return colorBar( ((vPosition.x + 100.0) / 200.0) ).color;',
      '}',
      'float finalDisplacement(){',
      '  return 1.0;',
      '}'
      ].join("\n"));
  }
  // 1
  else if ( e.keyCode === 49 ){
    replaceShader([
      'vec4 finalColor(){',
      '  return colorBar( ((vPosition.y + 100.0) / 200.0) ).color;',
      '}',
      'float finalDisplacement(){',
      '  return 1.0;',
      '}'
      ].join("\n"));
  }
  // 2
  else if ( e.keyCode === 50 ){
    replaceShader([
      'vec4 finalColor(){',
      '  return colorBar( ((vPosition.z + 100.0) / 200.0) ).color;',
      '}',
      'float finalDisplacement(){',
      '  return 1.0;',
      '}'
      ].join("\n"));
  }
  // 3
  else if ( e.keyCode === 51 ){
    replaceShader([
      'vec4 finalColor(){',
      '  return colorBar( mod(time,500.0) / 500.0 ).color;',
      '}',
      'float finalDisplacement(){',
      '  return 1.0;',
      '}'
      ].join("\n"));
  }
  // 4
  else if ( e.keyCode === 52 ){
    replaceShader([
      'vec4 finalColor(){',
      '  return colorBar( sinus(10.0,30.0,1.0,0.0) ).color;',
      '}',
      'float finalDisplacement(){',
      '  return 1.0;',
      '}'
      ].join("\n"));
  }
  // 5
  else if ( e.keyCode === 53 ){
    replaceShader([
      'vec4 finalColor(){',
      '  return colorBar(bound(turbulence(vec4(vPosition/50.0,1.0)))).color;',
      '}',
      'float finalDisplacement(){',
      '  return 1.0;',
      '}'
      ].join("\n"));
  }
  // 6
  else if ( e.keyCode === 54 ){
    replaceShader([
      'vec4 finalColor(){',
      '  return colorBar( ((vPosition.x + 100.0) / 200.0) ).color;',
      '}',
      'float finalDisplacement(){',
      '  return colorBar(bound(turbulence(vec4(vPosition/50.0,1.0)))).displacement;',
      '}'
      ].join("\n"));
  }
}, false);
