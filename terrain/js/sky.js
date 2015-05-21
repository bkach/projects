vShader = [
"varying vec2 vUV;",

"void main() {",
  "vUV = uv;",
  "vec4 pos = vec4(position, 1.0);",
  "gl_Position = projectionMatrix * modelViewMatrix * pos;",
"}"].join("\n");

fShader = [
"uniform sampler2D texture;",
"varying vec2 vUV;",

"void main() {",
  "vec4 sample = texture2D(texture, vUV);",
  "gl_FragColor = vec4(sample.xyz, sample.w);",
"}"].join("\n");

var geometry = new THREE.SphereGeometry(3000, 60, 40);
var skyUniforms = {
  texture: { type: 't', value: THREE.ImageUtils.loadTexture('img/milky-way-mid.jpg') }
};

var material = new THREE.ShaderMaterial( {
  uniforms:       skyUniforms,
  vertexShader:   vShader,
  fragmentShader: fShader
});

skyBox = new THREE.Mesh(geometry, material);
skyBox.scale.set(-1, 1, 1);
skyBox.rotation.order = 'XZY';
skyBox.renderDepth = 1000.0;
scene.add(skyBox);
