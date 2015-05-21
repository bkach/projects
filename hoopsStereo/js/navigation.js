var clock = new THREE.Clock();
var distance;
var tori = [];
var numTori = 30;
var torusRadius = 50;
var toriSpacing = 300;
var boxSize = numTori * (toriSpacing * 2);
var backgroundColor = 0x000000;
var testNum = 6;

// Full Screen
var fullscreen = false;
document.addEventListener('touchend', function() {
if (!fullscreen) {
    if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen();
    }
    fullscreen = true;
        }
}, false);

//var name = prompt("Enter Name");
clock.start();
             

// Resultant Data
var data = {
  hitPercent: [],
  time: []
};

// Create and style info and time fields
var info = document.getElementById("info");
info.style.zIndex = 1;
info.style.fontSize = "10px";
info.style.position = "absolute";
info.style.color = "white";


var time = document.getElementById("time");
time.style.zIndex = 1;
time.style.fontSize = "50px";
time.style.position= "absolute";
//time.style.right= String(window.innerWidth / 3) + "px";
//time.style.top = String(window.innerHeight / 2) + "px";
time.style.right = "10px";
time.style.top = "30px";
time.style.color = "white";


// Scene
var scene = new THREE.Scene();
//scene.fog = new THREE.Fog(backgroundColor, 1, 2000);

// Camera
var camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, boxSize * 2);
scene.add(camera);

// Renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(backgroundColor); // Background Color
document.body.appendChild(renderer.domElement);

// Effect
var effect = new THREE.StereoEffect(renderer);
effect.setSize(window.innerWidth, window.innerHeight);

// Controls
var controls;
if(testNum <= 3)
{
  controls = new THREE.FirstPersonControls(camera);
  //controls.movementSpeed = 2000;
  controls.lookSpeed = 0.5;
  // Rotate Camera to look down the Z direction
  controls.lon = 90;
  //controls.activeLook = false;
}
else{
    controls = new THREE.DeviceOrientationControls(camera);
    controls.connect();
}


// Tori
for(var i = 0; i < numTori; i++){
  torus = new Torus(torusRadius);
  if(testNum == 2 || testNum == 5){
    torus.position.set(0,Math.sin(i) * 100,toriSpacing * (i+1));
  }else{
    torus.position.set(0,0,toriSpacing * (i+1));
  }
  scene.add(torus);
  tori.push(torus);
}

//Light
var light = new THREE.PointLight(0xffffff,0.6);
light.position.set(0, 0, 0);
scene.add(light);

// boundingBox
var boxSize = numTori * (toriSpacing * 2);
geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize, 10, 10, 10);
material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true 
});
var boundingBox = new THREE.Mesh(geometry, material);
scene.add(boundingBox);

// Animations
var cameraPrevPos = camera.position.clone();
var dataPrinted = false;
var styled = false;
var render = function() {
  controls.update(clock.getDelta());

  if(testNum > 3)
    effect.render(scene,camera);
  else
    renderer.render(scene, camera);

  requestAnimationFrame(render);

  if(!dataPrinted){
    if(clock.elapsedTime > 10){
      camera.translateZ(-5);
      time.innerHTML = "<p> "
                      + String(Math.round(clock.elapsedTime)) 
                      + " Seconds<\p>\n";
      if(!styled){
        time.style.fontSize = "10px";
        time.style.left = "70px";
        time.style.top = "8px";
        styled = true;
      }
    }
    else{
      time.innerHTML = "<p> "
                      + String(11 - Math.round(clock.elapsedTime)) 
                      + "<\p>\n";
    }
  }


  // Set position of light at the camera
  light.position.set(camera.position.x,camera.position.y,camera.position.z);

  // Create a line from the previous to current positions
  var line = new THREE.Line3(camera.position,cameraPrevPos);

  for(var i = 0; i < numTori; i++){

    // Move the Tori
    if((testNum == 3 || testNum == 6) && !dataPrinted){
      sinus = Math.sin(clock.elapsedTime * 0.7 + i) * 100;
      tori[i].position.y = sinus;
    }

    // Create plane to intersect line
    var plane = new THREE.Plane(new THREE.Vector3(0,0,-1), tori[i].position.z);
    intersects = plane.intersectLine(line);
    
    // Check if the camera intersects the plane
    if(intersects){

      // Check if camera intersects torus
      if(intersectsTorus(intersects,tori[i].position)){
        // Create ball at intersection point
        var ball = new THREE.Mesh(
                    new THREE.SphereGeometry(5, 5),
                    new THREE.MeshBasicMaterial( { color: 0xff0000 })
                   );
        // Add ball to torus mesh
        tori[i].add(ball);
        
        // Change Torus Color to Green
        tori[i].material.color.setHex(0x00ff00);

        // Reset ball position relative to torus
        ball.position.set(intersects.x - tori[i].position.x,
                          intersects.y - tori[i].position.y,
                          0);

        // Record Hit Percentage and Time
        hitPercentage = 100 - Math.round(distance * 100/torusRadius);
        data.hitPercent.push(hitPercentage);
        data.time.push(clock.elapsedTime);
        //console.log(hitPercentage, clock.elapsedTime);
        info.innerHTML = "<p>"
                          //+ String(Math.round(clock.elapsedTime)) 
                          + "Loop " + String(i+1)
                          + " "
                          + String(hitPercentage)
                          + "%<\p>\n"
      }
      else
      {
        data.hitPercent.push(0);
        data.time.push(clock.elapsedTime);
      }
    }

    // Last lap
    if(dataPrinted){
      camera.position.z += 0.1;
    }

    // Print results if outside box
    if(!dataPrinted && camera.position.z > boxSize/2){
      console.log(data);
      dataPrinted = true;
      camera.position.set(0,0,-10);
      var dataString =
        name + "test" + testNum + '=' + JSON.stringify(data) + ';';
      // Set Expiration Date of cookie
      days = 1000; // How long (in days) the cookie should last
      d = new Date();
      d.setTime(d.getTime() + (days*24*60*60*1000));
      expires = "expires="+d.toUTCString();
      dataString += expires;
      document.cookie = dataString;
      console.log(dataString);
    }

  }

  // Get last position of camera to calculate difference
  if(!camera.position.equals(cameraPrevPos)){
    cameraPrevPos = camera.position.clone();
  }
}

// Check if inside torus
var intersectsTorus = function (intersection,torus){
  cx = intersection.x;
  cy = intersection.y;
  tx = torus.x;
  ty = torus.y;
  distance = Math.sqrt(Math.pow(cx-tx,2) + Math.pow(cy-ty,2));
  if(distance <= torusRadius){
    return true;
  }
  else{
    return false;
  }
}

// Go!
render();
