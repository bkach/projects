// functionCode
//  - The code to be amended to the shaders
var functionCode = `
  #define PI 3.1415926535897932384626433832795

  struct ColorBarResult{
    vec4 color;
    float displacement;
  };

  float harmonicSeries(vec4 P){
    float noise = 0.0;
    float scale = 1.0;
    for(float i=0.0; i<4.0 ; i++){
      noise += snoise( P / scale ) * scale;
      scale /= 2.0;
    }
    return noise;
  }

  float turbulence(vec4 P){
    float noise = 0.0;
    float scale = 1.0;
    for(float i=0.0; i<4.0; i++){
      noise += abs(snoise( P / scale )) * scale;
      scale /= 2.0;
    }
    return noise;
  }

  float bound(float v){
    float res = (v * 0.5) + 0.5;
    if (res > 1.0){
      return 1.0;
    }
    else if(res < 0.0){
      return 0.0;
    }
    return res;
  }

  float combine(float a, float b){
    return (a + b) / 2.0;
  }


  // FUNCTION COMPOSITION
  float sinus(float rotation, float zoom, float power,float intensity){
      float radians = rotation * (PI/180.0);
      float sine = 
        pow(
          cos(
            (vPosition.x * sin(-radians) + 
             vPosition.y * cos(-radians)) / zoom + (turbulence(vec4(vPosition/zoom,1.0))) * intensity),
        power);
      return sine;
  }

  float myNoise(){
    return sinus(45.0,5.0,1.0,1.0);
  }

  float line(float rotation,float zoom, float power,float intensity){
      float radians = rotation * (PI/180.0);
      float line = 
        (vPosition.x * sin(-radians) + vPosition.y * cos(-radians)) / zoom;
      line += 20.0 * turbulence(vec4(vPosition/zoom,1.0)) * intensity;

      if(line > 1.0){
        line = 1.0;
      }
      if(line < 0.0){
        line = 0.0;
      }

      return pow(line,power);
  }
`;

//
// A ColorBar Object
//  - Contains breakpoints, functions, and the ability to be converted to GLSL
//
var ColorBar = function () {
  this.sections = [];
};

ColorBar.prototype.toString = function toString(){
  var result = "";
  var sns = this.sections;
  if(sns != [])
  {
    for( var i in sns ){
      // Low bound of the section
      var low = sns[i].lowBP;
      // High bound of the section
      var high = sns[i].highBP;
      if (i == 0)
      {
        result += `if`;
      }
      else{
        result += `else if`;
      }
      result += 
        `( val >= ` + low.location + ` && val <= ` + high.location + ` ){
            float percentage = ((val - ` + low.location + `) / (` + high.location + ` - ` + low.location + `));
                float mixValue = percentage;
            ` + sns[i].fn + `
            vec4 resultantColor = mix( ` + low.colorGLSL() + `, ` + high.colorGLSL() + `, mixValue);
            cbr.color = resultantColor;
            cbr.displacement = 
              mix( ` + low.displacement + `, ` + high.displacement + `, mixValue);
            return cbr;
          }
        `;
    }
    result +=
      `
      else{
        cbr.color = vec4(1.0,1.0,1.0,1.0);
        cbr.displacement = 1.0;
        return cbr;
      }
      `
  }
  return result;
}

// A Section Object
//  - Contains two breakpoints and a function
//
var Section = function ( lowBP, fn, highBP ) {
  this.lowBP  = lowBP;
  this.highBP = highBP;
  this.fn = fn;
}

// A BreakPoint Object
//  - Contains Color, displacement, and the ability to be converted to glsl
//
var BreakPoint = function (color,displacement,location) {
  this.location = location.toFixed(4);
  this.color = color;
  this.displacement = displacement.toFixed(4);
  this.colorGLSL = function(){
    return "vec4(" + this.color.x + "," + this.color.y + "," + this.color.z + ",1.0)";
  }
};



// TESTS

// Create an initial Color bar
var cb1 = new ColorBar();

// Add multiple sections
  //cb1.sections.push(
      //new Section(
          //new BreakPoint(new THREE.Vector3(1.0,0.0,0.0), 1.0 , -0.0001),
          //`
          //float s1 = sinus(time/2.0,5.0,30.0,1.0);
          //float s2 = sinus(-time/2.0,5.0,30.0,1.0);
          //mixValue = (s1 + s2) / 2.0;
          //`,
          //new BreakPoint(new THREE.Vector3(0.0,0.5,1.0), 20.0, 0.125)
      //)
  //);

  //cb1.sections.push(
      //new Section(
          //new BreakPoint(new THREE.Vector3(1.0,0.5,0.0), 5.0 , 0.125),
          //`
          //vec3 P = vPosition * 2.0;
          //P.x += time/5.0;
          //mixValue = turbulence(vec4(P / 10.0,1.0));
          //`,
          //new BreakPoint(new THREE.Vector3(0.0,0.0,1.0), 3.0 , 0.250)
      //)
  //);

  //cb1.sections.push(
      //new Section(
          //new BreakPoint(new THREE.Vector3(0.0,0.0,1.0), 10.0 , 0.250),
          //`
          //float sinus1 = sin((vPosition.x-vPosition.y / 2.0)+time/2.0);
          //float sinus2 = sin((vPosition.y+vPosition.x / 2.0)+time/2.0);
          //mixValue = (sinus1 + sinus2) / 2.0;
          //`,
          //new BreakPoint(new THREE.Vector3(1.0,0.0,1.0), 7.0 , 0.375)
      //)
  //);

  //cb1.sections.push(
      //new Section(
          //new BreakPoint(new THREE.Vector3(1.0,0.0,1.0), 4.0 , 0.375),
          //`
          //vec3 P = vPosition;
          //P.y += time/5.0;
          //mixValue = turbulence(vec4(P / 20.0,1.0));
          //`,
          //new BreakPoint(new THREE.Vector3(0.0,0.0,1.0), 3.0 , 0.500)
      //)
  //);

  //cb1.sections.push(
      //new Section(
          //new BreakPoint(new THREE.Vector3(0.0,0.0,1.0), 5.0 , 0.500),
          //`
          //mixValue = snoise(vec4(vPosition / 30.0,1.0));
          //`,
          //new BreakPoint(new THREE.Vector3(0.0,1.0,0.0), 2.0 , 0.625)
      //)
  //);

  //cb1.sections.push(
      //new Section(
          //new BreakPoint(new THREE.Vector3(1.0,0.0,1.0), 7.0 , 0.625),
          //`
          //mixValue = harmonicSeries(vec4(vPosition + 20.0 / 30.0,1.0));
          //`,
          //new BreakPoint(new THREE.Vector3(0.0,1.0,0.0), 7.0 , 0.750)
      //)
  //);

  //cb1.sections.push(
      //new Section(
          //new BreakPoint(new THREE.Vector3(0.0,1.0,0.0), 9.0 , 0.750),
          //`
          //mixValue = snoise(vec4(vPosition / 30.0,1.0));
          //`,
          //new BreakPoint(new THREE.Vector3(1.0,0.0,0.0), 5.0 , 0.875)
      //)
  //);
  
  //var cb2 = new ColorBar();

  //cb2.sections.push(
      //new Section(
        //new BreakPoint(new THREE.Vector3(1.0,0.0,0.0), 5.0, 0.875),
        //`
        //mixValue = turbulence(vec4(vPosition / 30.0,1.0));
        //`,
        //new BreakPoint(new THREE.Vector3(0.0,0.0,1.0), 10.0, 0.9375)
      //)
  //);

  //cb2.sections.push(
      //new Section(
        //new BreakPoint(new THREE.Vector3(0.0,1.0,1.0), 0.0, 0.9375),
        //`
        //mixValue = sin(vPosition.x/2.0);
        //`,
        //new BreakPoint(new THREE.Vector3(0.0,0.0,1.0), 10.0, 1.0001)
      //)
  //);

  //cb1.sections.push(
    //new Section(
      //new BreakPoint(new THREE.Vector3(1.0,0.0,0.0), 0.0 , 0.875),
      //cb2,
      //new BreakPoint(new THREE.Vector3(1.0,1.0,0.0), 10.0 , 1.0001)
    //)
  //);


cb1.sections.push(
    new Section(
      new BreakPoint(new THREE.Vector3(1.0,0.0,0.0), 0.0, -0.0001),
      `
      float line1 = line(90.0,1.0,1.0,0.0);
      mixValue = line1;
      float line2 = line(0.0,1.0,2.0,0.0);
      mixValue = combine(mixValue , line2);
      //float noise = turbulence(vec4(vPosition/5.0,1.0));
      //mixValue = combine(mixValue , noise);
      //float sine = sinus(45.0,5.0,1.0,4.0);
      //mixValue = combine(mixValue , sine);
      //mixValue = percentage;
      `,
      new BreakPoint(new THREE.Vector3(0.0,0.0,1.0), 10.0, 1.0001)
    )
);


// Convert to GLSL code
colorBarGLSL = 
`
ColorBarResult colorBar(float val){
  ColorBarResult cbr;
  ` + cb1 + `
}
`;


var finalValuesSphere =
`
  vec4 finalColor(){
    // Const
    return colorBar( 0.5 ).color;
    //return colorBar( mod(time,500.0) / 500.0 ).color;
    // x-Pos
    //return colorBar( ((vPosition.x + 100.0) / 200.0) ).color; 
    // y-Pos
    //return colorBar( ((vPosition.y + 100.0) / 200.0) ).color; 
    // Sine
    //return colorBar( sinus(10.0,30.0,1.0,1.0) ).color;
    // Noise
    //return colorBar( bound(snoise(vec4(vPosition/10.0,1.0))) ).color;
    // Turb
    //return colorBar(bound(turbulence(vec4(vPosition/10.0,1.0)))).color;
  }
  float finalDisplacement(){
    // Const
    return colorBar( 0.5 ).displacement;
    // x-Pos
    //return colorBar( ((vPosition.x + 100.0) / 200.0) ).displacement; 
    // y-Pos
    //return colorBar( ((vPosition.y + 100.0) / 200.0) ).displacement; 
    // Sine
    //return colorBar( sinus(10.0,30.0,1.0,1.0) ).displacement;
    // Noise
    //return colorBar( bound(snoise(vec4(vPosition/10.0,1.0))) ).displacement;
    // Turb
    //return colorBar(bound(turbulence(vec4(vPosition/10.0,1.0)))).displacement;
    //return colorBar( mod(time,500.0) / 500.0 ).displacement;
    return 1.0;
  }
`;

var finalValuesPlane =
`
  vec4 finalColor(){
    return colorBar( ((vPosition.x + 100.0) / 200.0) ).color; 
  }
  float finalDisplacement(){
    return colorBar( ((vPosition.x + 100.0) / 200.0) ).displacement; 
  }
`;



var functionCodeSphere = functionCode + colorBarGLSL + finalValuesSphere;
var functionCodePlane  = functionCode + colorBarGLSL + finalValuesPlane;
