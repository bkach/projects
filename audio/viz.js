var resultPath;
var gradient = 
{
    gradient: {
      stops: ['red', 'orange', 'yellow']
    },
    origin: 0,
    destination: this.view.size.width,
};

var path = new Path({
  strokeColor : gradient
});
var path2 = new Path({
  strokeColor : gradient
});
var wavePath = new Path({
  strokeColor : gradient
});
var width = this.view.size.width;
var height = this.view.size.height;
var segmentSize = width / 1024;
for(var i = 0; i < 1024; i++){
  path.add(new Point(segmentSize * i, 0));
  path2.add(new Point(segmentSize * i, 0));
  wavePath.add(new Point(segmentSize * i, 0));
}

var text = new PointText({
    point: [50, 50],
    content: '0',
    fillColor: 'black',
    fontFamily: 'Courier New',
    fontWeight: 'bold',
    fontSize: 25
});

function onResize(event) {
	path.position = view.center;
	path2.position = view.center;
}

function onFrame(event){
  if ( gotUserMedia ){
    text.content = "Average: " + avg(frequencyData);
    for(var i=0; i < 1024; i++){
      path.segments[i].point.y = height/2 - frequencyData[i];
      path2.segments[i].point.y = height/2 + frequencyData[i];
      wavePath.segments[i].point.y = height/2 + waveForm[i] - 128;
    }
  }
}
