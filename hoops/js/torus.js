var Torus = function (object) {
  this.radius = arguments[0];
  this.tubeD = 5;
  this.radialSeg = 20;
  this.tubularSeg = 20;
  this.arc = Math.PI * 2;
  var geometry = new THREE.TorusGeometry(
      this.radius, 
      this.tubeD, 
      this.radialSeg, 
      this.tubularSeg, 
      this.arc);
  var material = new THREE.MeshLambertMaterial( { color: 0xf5f5f5} );
  THREE.Mesh.apply(this,[geometry,material]);
  
  // Center Circle
  this.add(new THREE.Mesh(
      new THREE.SphereGeometry(3),
      new THREE.MeshBasicMaterial({color: 0xffffff})
      ));
};

Torus.prototype = Object.create(THREE.Mesh.prototype);
Torus.prototype.constructor = Torus;
