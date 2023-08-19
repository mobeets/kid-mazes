
class cell {

  constructor(x, y, i, j, s) {
    this.pos = createVector(x, y);
    this.i = i;
    this.j = j;
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.previous = undefined;
    this.size = s;
    this.walls = [true, true, true, true];
    this.visited = false;
    this.neighbors = [];
  }

  show(col) {

    let val = 'Maze';//display.value();
    stroke(0);
    strokeWeight(1);
    if (val == 'Maze' || (!val)) {
      stroke(0);
      strokeWeight(1);
      if (!col) {

        this.top = this.walls[0];
        this.left = this.walls[3];
        this.right = this.walls[1];
        this.bottom = this.walls[2];
        let pos = this.pos;
        let size = this.size;
        if (this.top)
          line(pos.x, pos.y, pos.x + size, pos.y);
        if (this.left)
          line(pos.x, pos.y, pos.x, pos.y + size);
        if (this.bottom)
          line(pos.x, pos.y + size, pos.x + size, pos.y + size);
        if (this.right)
          line(pos.x + size, pos.y, pos.x + size, pos.y + size);

        if (!this.visited) {
          fill('#7f00ff5a');
          noStroke();
          rect(this.pos.x, this.pos.y, this.size, this.size);
        }
      } else {
        fill(col);
        noStroke();
        rect(this.pos.x, this.pos.y, this.size, this.size);
      }
    } else {

      let r = this.size / 2;

      fill(255);
      stroke(255, 0, 0);
      strokeWeight(2);
      // line(this.pos.x, this.pos.y, 0, 0);
      for (let n of this.addNeighbors()) {
        line(this.pos.x + r, this.pos.y + r, n.pos.x + r, n.pos.y + r);
      }
    }
  }

  node() {
    let val = 'Maze'; // display.value();
    if (val == 'Graph') {
      let r = this.size / 2;
      if (!this.visited) {
          fill('#7f00ff5a');
      }else
      {
       fill(255); 
      }
          
      noStroke();
      circle(this.pos.x + r, this.pos.y + r, r / 1.25);
    }
  }

  addNeighbors() {

    this.neighbors = [];
    let i = this.i;
    let j = this.j;
    let top = grid[index(i, j - 1)];
    let right = grid[index(i + 1, j)];
    let bottom = grid[index(i, j + 1)];
    let left = grid[index(i - 1, j)];
    this.top = this.walls[0];
    this.right = this.walls[1];
    this.bottom = this.walls[2];
    this.left = this.walls[3];

    if (!this.top && top) {
      this.neighbors.push(top);
    }

    if (!this.right && right) {
      this.neighbors.push(right);
    }

    if (!this.bottom && bottom) {
      this.neighbors.push(bottom);
    }

    if (!this.left && left) {
      this.neighbors.push(left);
    }

    return this.neighbors
  }

  checkNeighbors() {
    let neighbors = []

    let i = this.i;
    let j = this.j;
    let top = grid[index(i, j - 1)];
    let right = grid[index(i + 1, j)];
    let bottom = grid[index(i, j + 1)];
    let left = grid[index(i - 1, j)];

    if (top && !top.visited) {
      neighbors.push(top);
    }
    if (right && !right.visited) {
      neighbors.push(right);
    }
    if (bottom && !bottom.visited) {
      neighbors.push(bottom);
    }
    if (left && !left.visited) {
      neighbors.push(left);
    }

    if (neighbors.length > 0) {
      return random(neighbors);
    } else {
      return undefined;
    }
  }
}

function walker() {
  fill(startColor);
  noStroke();

  circle(current.pos.x + current.size / 2, current.pos.y + current.size / 2, current.size / 2);
}

class person {
  constructor(x, y, i, j, s) {
    this.pos = createVector(x, y);
    this.i = i;
    this.j = j;
    this.size = s;
    this.visited = [];
    this.addToPath(this.pos.x, this.pos.y);
  }
  render() {
    this.renderPath();
    fill(startColor);
    noStroke();
    // circle(this.pos.x + this.size / 2, this.pos.y + this.size / 2, this.size / 2);
    image(startImg, this.pos.x, this.pos.y, scl, scl, 0, 0, startImg.width, startImg.height);
  }
  
  update(dx, dy) {
    let cNeighbor = grid[index(this.i + dx, this.j + dy)];
    if (cNeighbor) { // neighboring cell exists
      
      // check if there is a wall in the dir we want to move
      let cCell = grid[index(this.i, this.j)];
      let wallInd;
      // top right bottom left
      if (dx < 0) { wallInd = 3; }
      else if (dx > 0) { wallInd = 1; }
      else if (dy < 0) { wallInd = 0; }
      else { wallInd = 2; }
      
      if (!cCell.walls[wallInd]) {
        // no wall, so we can move
        this.i += dx;
        this.j += dy;
        this.pos.x += scl*dx;
        this.pos.y += scl*dy;
        this.addToPath(this.pos.x, this.pos.y);
      } 
    }
  }
  
  addToPath(x, y) {
    this.visited.push(createVector(x, y));
  }
  
  renderPath() {
    
    noFill();
    strokeWeight(scl / 4);
    for (let i = 0; i < this.visited.length-1; i++) {
      let c = 255 - 2*(this.visited.length - 1 - i);
      let alph = constrain(c, 0, 255);
      stroke(color(250, 0, 250, alph));
      
      beginShape();
      vertex(this.visited[i].x + this.size/2, this.visited[i].y + this.size/2);
      vertex(this.visited[i+1].x + this.size/2, this.visited[i+1].y + this.size/2);
      endShape(); 
    }
  } 
}

function endMarker() {
  fill(endColor);
  noStroke();

  // circle(end.pos.x + end.size / 2, end.pos.y + end.size / 2, end.size / 2);
  image(endImg, end.pos.x, end.pos.y, scl, scl, 0, 0, endImg.width, endImg.height);
}

function index(i, j) {
  if (i < 0 || j < 0 || i > cols - 1 || j > rows - 1) {
    return -1;
  }
  return i + j * cols;
}