let cols, rows;
let scl = 40;
let grid = [];
let current;
let stack = [];
let speed = 10;
let speedSlider;
let end, start;
let rowcount, colcount, scalar, startbutton;
let auto;
let openSet = [];
let closedSet = [];
let path = [];
let done = false;
let pathfound;
let red, blue;
let startColor;
let endColor;
let pathColor;
let count = 0;
let astar = false;
let walkercount = 0;
let s, e;
let display;
let me;
let startImg, endImg;
let images = ['baby-trex', 'trex', 'plesiosaur', 'mosasaur', 'stegosaurus', 'orca', 'shark', 'whale', 'anglerfish'];
let sounds = ['eating', 'bite1', 'bite2'];
let winSound;
let startedPlaying = false;
let stepCount;

function restart(seednum) {
  if (seednum === undefined) {
    let url = new URL(window.location.href);
    seednum = Math.round(10000*random());
    url.searchParams.set('id', seednum);
    history.pushState({},'',url.href);
  }
  randomSeed(seednum);

  preload();
  count = 0;
  stepCount = 0;
  walkercount = 0;
  startedPlaying = false;
  s = 1;
  e = 2;
  cols = int(colcount.value());
  rows = int(rowcount.value());
  scl = int(scalar.value());
  resizeCanvas(cols * scl, rows * scl);
  red = color(255, 0, 0);
  blue = color(0, 0, 255);
  startColor = color(0, 0, 255);
  endColor = color(0, 250, 0);
  pathColor = color(80, 80, 250); 
  done = false;
  pathfound = false;
  astar = false;
  grid = [];
  stack = [];
  closedSet = [];
  openSet = [];
  for (var j = 0; j < rows; j++) {
    for (var i = 0; i < cols; i++) {
      var c = new cell(i * scl, j * scl, i, j, scl);
      grid.push(c);
    }
  }
  current = random(grid);
  start = current;
  end = random(grid);
  me = new person(current.pos.x, current.pos.y, current.i, current.j, current.size);
  // startbutton.hide();
}

function touchStarted() {
  let a = atan2(mouseY - me.pos.y, mouseX - me.pos.x);
  if (a < 0) { a += 360; }
  if (a > 45 && a < 135) {
    me.update(0, 1); // down
  } else if (a > 135 && a < 225) {
    me.update(-1, 0); // left
  } else if (a > 225 && a < 315) {
    me.update(0, -1); // up
  } else if (a > 315 || a < 45) {
    me.update(1, 0); // right
  }
}

function keyPressed() { 
  if (keyCode === LEFT_ARROW) {
    me.update(-1, 0);
  } else if (keyCode === RIGHT_ARROW) {
    me.update(1, 0);
  } else if (keyCode === UP_ARROW) {
    me.update(0, -1);
  } else if (keyCode === DOWN_ARROW) {
    me.update(0, 1);
  } else if (keyCode === ENTER) {
    restart();
  }
}

function controls() {
  let newline;
  newline = createDiv("Rows");
  newline.parent("main-controls");
  newline.addClass('item');
  rowcount = createSlider(2, 20, 5);
  rowcount.style('width', '15%');
  rowcount.parent("main-controls");
  rowcount.addClass('item');

  newline = createDiv("Columns");
  newline.parent("main-controls");
  newline.addClass('item');
  colcount = createSlider(2, 20, 5);
  colcount.style('width', '15%');
  colcount.parent("main-controls");
  colcount.addClass('item');

  newline = createDiv("Scale");
  newline.parent("main-controls");
  newline.addClass('item');
  scalar = createSlider(1, 100, 100);
  scalar.style('width', '15%');
  scalar.parent("main-controls");
  scalar.addClass('item');

  restartButton = createButton("New maze");
  restartButton.mousePressed(restart);
  restartButton.parent("go");
  restartButton.addClass('button');
}

function getRandomFilePath(names, ext) {
  return 'assets/' + random(names) + '.' + ext;
}

function preload() {
  startImg = loadImage(getRandomFilePath(images, 'png'));
  endImg = loadImage(getRandomFilePath(images, 'png'));
  soundFormats('mp3', 'ogg');
  winSound = loadSound(getRandomFilePath(sounds, 'mp3'));
}

function checkForSeed() {
  let searchParams = new URLSearchParams(window.location.search);
  if (searchParams.has('id')) {
    let seed = searchParams.get('id');
    let seednum = parseInt(seed);
    return seednum;
  }
}

function setup() {
  let cx = createCanvas(windowWidth, windowHeight);
  cx.parent("canvas-content");
  textSize(64);
  textAlign(CENTER, CENTER);
  angleMode(DEGREES);
  controls();
  let seednum = checkForSeed();
  restart(seednum);
}

function heuristic(a, b) {
  // var d = dist(a.i, a.j, b.i, b.j);
  var d = abs(a.i - b.i) + abs(a.j - b.j);
  return d;
}

function removeFromArray(arr, elt) {
  arr.splice(arr.indexOf(elt), 1);
}

function readyastar() {
  for (let cell of grid) {
    cell.addNeighbors();
  }
  openSet.push(start);
}

function pathfinder() {
  let currentCell;
  if (openSet.length > 0) {

    // Best next option
    var winner = 0;
    for (var i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[winner].f) {
        winner = i;
      }
    }
    currentCell = openSet[winner];

    // Did I finish?
    if (pathfound) {
      return;
    }
    if (currentCell === end) {
      pathfound = true;
      console.log("DONE!");
    }

    // Best option moves from openSet to closedSet
    removeFromArray(openSet, currentCell);
    closedSet.push(currentCell);

    // Check all the neighbors
    var neighbors = currentCell.neighbors;
    for (let i = 0; i < neighbors.length; i++) {
      var neighbor = neighbors[i];

      // Valid next spot?
      if (!closedSet.includes(neighbor) && !neighbor.wall) {
        var tempG = currentCell.g + heuristic(neighbor, currentCell);

        // Is this a better path than before?
        var newPath = false;
        if (openSet.includes(neighbor)) {
          if (tempG < neighbor.g) {
            neighbor.g = tempG;
            newPath = true;
          }
        } else {
          neighbor.g = tempG;
          newPath = true;
          openSet.push(neighbor);
        }

        // Yes, it's a better path
        if (newPath) {
          neighbor.h = heuristic(neighbor, end);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.previous = currentCell;
        }
      }

    }
    // Uh oh, no solution
  } else {
    console.log('no solution');
    return;
  }

  // Find the path by working backwards
  path = [];
  var temp = currentCell;
  path.push(temp);
  while (temp.previous) {
    path.push(temp.previous);
    temp = temp.previous;
  }
  
  for(let c of closedSet)
  {
   c.show(color(255, 0, 200, 100)); 
  }
  stroke(255);
  stroke(scl);
  noFill();
  beginShape();
  for(let c of path)
  {
    vertex(c.pos.x+scl/2, c.pos.y+scl/2);
  }
  endShape();
}

function pathwalker() {
  fill(blue);
  stroke(blue);
  let l = path.length;
  let current = path[l-s];
  let next = path[l-e];
  if(current && next)
  {
    let currentpos = createVector(current.i * scl + scl / 2, current.j * scl + scl / 2);
    let nextpos = createVector(next.i * scl + scl / 2, next.j * scl + scl / 2);
    let p = map(walkercount, 0, 200, 0, 1);
    let pos = p5.Vector.lerp(currentpos, nextpos, p);
    circle(pos.x, pos.y, scl/2);
    if(walkercount >= 200)
    {
     walkercount = 0;
      s++;
      e++;
    }
    let speed = sqrt(20*(int(rows)+int(cols)));
    walkercount+=(speed*1.5);
  }
}

function showpath() {
  noFill();
  // stroke(255, 0, 200);
  strokeWeight(scl / 4);
  count += 0.25;
  beginShape();
  for (let i = 0; i < min(path.length, count); i++) {
    let p = map(i, 0, path.length, 0, 1);
    stroke(blue);
    vertex(path[i].i * scl + scl / 2, path[i].j * scl + scl / 2);
  }
  endShape();
}

function draw() {
  background(251);
  for (let cell of grid) {
    cell.show();
  }

  while (!finished()) {
      generateMaze();
    }

  if (finished()) {
    if (astar) {
      if (!done) {
        readyastar();
        done = true;
      }
      if (!pathfound)
        pathfinder();
      
    }
    current = start;
  }
  
  if (s >= path.length) {
   showpath(); 
  }
  
  for (let cell of grid) {
    cell.node();
  }
  
  if (pathfound) {
    if (s < path.length) {
      pathwalker();
    }
  }

  if(finished()) {
    endMarker();
    me.render();
  }
  showScore();
  if (me.pos.x === end.pos.x && me.pos.y == end.pos.y) {
    handleWin();
  }
}

function showScore() {
  $('#score').html('Steps: ' + stepCount.toString());
}

function handleWin() {
  fill(250, 0, 0);
  strokeWeight(8);
  stroke('black');
  textSize(64);
  text('YOU WON!', width/2, height/2);
  // noStroke();
  text('in ' + stepCount.toString() + ' steps', width/2, 2*height/3);
  if (winSound.isLoaded()) {
    if (!startedPlaying) {
      winSound.play();
      startedPlaying = true;
    }
  }
}

function generateMaze() {
  // let val = speedSlider.value();
  let val = 10;
  for (let i = 0; i < val; i++) {
    current.visited = true;
    let next = current.checkNeighbors();
    if (next !== undefined) {
      
      // next.visited = true;

      stack.push(current);

      removeWalls(current, next);

      current = next;

    } else if (stack.length > 0) {
      current = stack.pop();
    }
  }
}

function finished() {
  for (let cell of grid) {
    if (!cell.visited) {
      return false
    }
  }
  return true;
}


function removeWalls(a, b) {
  var x = a.i - b.i;
  if (x === 1) {
    a.walls[3] = false;
    b.walls[1] = false;
  } else if (x === -1) {
    a.walls[1] = false;
    b.walls[3] = false;
  }
  var y = a.j - b.j;
  if (y === 1) {
    a.walls[0] = false;
    b.walls[2] = false;
  } else if (y === -1) {
    a.walls[2] = false;
    b.walls[0] = false;
  }
}