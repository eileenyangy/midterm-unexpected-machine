// Adjective: AMBITIOUS :)
//Creative direction: Reaching for the moon
//Testing

// COLORS
let sky = "#6199C0"; // blue sky
let moon = "#FFF9DA"; // yellow moon
let mtn = "#D2E4F2"; // icy white blue 

// MOUNTAIN
let peakX = 560;
let peakY = 390;

// STARS
let x, y, size1; //x and y = where stars get drawn

// SNOW
let snowflakes = []; // array (list that stores a lot of snowflake objects)

// MOON
let moonHomeX = 300; // DEFAULT POSITION
let moonHomeY = 250;
let moonR = 170;
let moonCX, moonCY; // where the moon actually is right now
let ropeAnchorX, ropeAnchorY; // where the moon meets the rope

// MOON MOVING STATE
let escapeX = 0; // how far moon moves sideways to escape mouse
let escapeY = 0; // how far moon moves up and down to escape mouse

// PRESS SPACEBAR TO CHANGE FROM NIGHT TO DAY
function keyPressed() {
  if (key === " ") {
    if (sky === "#6199C0") {
      sky = "#2B4A6B"; // darker blue night sky
    } else {
      sky = "#6199C0"; // back to day blue
    }
  }
}

// SNOWFLAKE CLASS----------------------------------------------------------------
// Defines the properties of each snow particle
// Each snowflake has a position, size, color, + drifting motion
// When new Snowflake() is called, constructor initializes these values

class Snowflake {
  constructor() {
    //Runs automatically whenever a new Snowflake is created
    
    this.posX = 0; //Starting horizontal position of snowflake
    
    this.posY = random(-height, 0); //random(-height, 0) puts the snowflake somewhere above the canvas to start
    
    this.initialAngle = random(TWO_PI); // random starting angle for drifting motion
    
    this.size = random(3, 8); //size of snowflakes vary between 3 - 8
    
    this.radius = random(400); //sets how far the snowflake can drift sideways
    
  }

  update(time) {
    // Defining angular speed (degrees / second)
    let angularSpeed = 1;

    // Calculating the current angle
    let angle = this.initialAngle + angularSpeed * time;

    //X position follows sin wave
    this.posX = width / 2 + this.radius * sin(angle);

    this.posY += 6 / this.size; // smaller flakes fall slower

    // When snowflake reaches the bottom, move to top
    if (this.posY > height) {
      this.posY = -50;
    }
  }

  show() {
    noStroke();
    fill("#FFFFFF");
    ellipse(this.posX, this.posY, this.size);
  }
}


// ROPE ANCHOR — Attaching rope to moon
function updateRope() {
  ropeAnchorX = moonCX + moonR * 0.80; //anchoring point to moon edge
  ropeAnchorY = moonCY + moonR * 0.6; //vertical position
}

function buildArrays() { //Creates snowflakes and stores them in the snowflakes array
  snowflakes = []; //reset snowflake list
  for (let i = 0; i < 120; i++) snowflakes.push(new Snowflake()); // loop runs 120x to create a bunch of snowflakes
} 

//-------------------SETUP-------------------
function setup() {
  createCanvas(800, 800);
  
  //Setup moon position to default
  moonCX = moonHomeX; 
  moonCY = moonHomeY;
  
  //Rope attachment based on moon position
  updateRope();
  
  //Generating snowflakes
  buildArrays();
}

// MOVING MOON AWAY FROM MOUSE
function updateMoon() {
  
  //D is the distance between mouse & moon center
  let d = dist(mouseX, mouseY, moonCX, moonCY);

  //When the mouse is close, strength is high; When far, strength weakens to 0
  let fStrength = map(d, 0, moonR * 3, 1, 0, true);

  //Direction from mouse toward the moon
  let fx = moonCX - mouseX;
  let fy = moonCY - mouseY;
  let fmag = sqrt(fx * fx + fy * fy) || 1; // avoid dividing by 0!

  //How much the moon should move away from the mouse
  escapeX = (fx / fmag) * fStrength * moonR * 0.5;
  escapeY = (fy / fmag) * fStrength * moonR * 0.2;

  //Setting moon's current position based on its default position + how far it has moved while moving away from mouse
  moonCX = moonHomeX + escapeX;
  moonCY = moonHomeY + escapeY;
  updateRope();
}

// ----------------------------- DRAW FUNCTION -----------------------
function draw() {
  updateMoon();
  background(sky);

  //Drawing stars every 7 frames
  if (frameCount % 8 === 0) {
    noStroke();
    fill("#FFFFFF");
    let i = 0;
    while (i < 40) { //loop runs 40x to make 40 stars
      x = random(800); //pick random position across canvas
      y = random(800 * 0.8); // only in the sky area
      size1 = random(1, 6); //random star size between 1 & 6 px
      ellipse(x, y, size1, size1);
      i++; //increase i so eventually it stops
    }
  }

  drawMoon(moonCX, moonCY, moonR); // pass position + size as parameters
  drawMountain(peakX, peakY); // pass peak position as parameters

  // FIGURE — drawn directly at the mountain peak
  push(); //saves current coordinates
  fill("#000000");
  translate(peakX, peakY);
  noStroke();
  rectMode(CENTER);
  rect(0, -17, 12, 20, 3); // torso
  ellipse(0, -31, 11); // head
  stroke("#000000");
  strokeWeight(6);
  strokeCap(ROUND);
  noFill();
  line(4, -21, -12, -44); // raised arm
  line(-4, -18, -13, -9); // lowered arm
  line(-3, -6, -8, 16); // left leg
  line(3, -6, 10, 16); // right leg
  rectMode(CORNER);
  pop(); //restores everything back to how it was before

  drawRope();

  // move and draw every snowflake; pass time in seconds
  let currentTime = frameCount / 60;
  for (let f of snowflakes) {
    f.update(currentTime);
    f.show();
  }
}

// DRAW MOON (x position, y position, and radius as parameters)
function drawMoon(x, y, r) {
  
  //GLOW (Transparent circles around moon)
  noStroke();
  for (let i = 5; i > 0; i--) { //Loop runs 5 times, each circle gets a bit bigger to create a halo effect
    fill(255, 240, 180, 30); //30 opacity
    ellipse(x, y, r * 2 + i * 30); //i * 30 increases the size of each glow ring
  }

  // MOON COLOR
  fill(moon);
  ellipse(x, y, r * 2);
}

// DRAW ROPE FROM MAN'S HAND TO MOON
function drawRope() {
  let handX = peakX - 10;
  let handY = peakY - 40;
  let midX = (handX + ropeAnchorX) / 2;
  let midY = (handY + ropeAnchorY) / 2 - 30;
  stroke(38, 30, 25, 200);
  strokeWeight(2);
  noFill();
  beginShape();
  curveVertex(handX, handY);
  curveVertex(handX, handY);
  curveVertex(midX, midY);
  curveVertex(ropeAnchorX, ropeAnchorY);
  curveVertex(ropeAnchorX, ropeAnchorY);
  endShape();
}

// DRAW MOUNTAIN
function drawMountain(px, py) {
  
  //peak position as parameters
  noStroke();

  //MAIN BODY
  fill("#D8EAF7");
  beginShape();
  vertex(px, py);
  vertex(-64, 830);
  vertex(830, 830);
  vertex(830, 480);
  endShape(CLOSE);

  //LEFT SIDE OF MOUNTAIN
  fill("##AFD3ED");
  beginShape();
  vertex(px, py);
  vertex(px - 68, py + 92);
  vertex(px - 30, py + 132);
  vertex(px + 20, py + 44);
  endShape(CLOSE);

  //RIGHT SIDE OF MOUNTAIN
  fill("#9FC6E2");
  beginShape();
  vertex(px, py);
  vertex(830, 480);
  vertex(830, 830);
  endShape(CLOSE);

  //SNOWY PART
  fill("#FAFAFA");
  beginShape();
  vertex(px, py);
  vertex(px - 70, py + 80);
  vertex(px - 40, py + 120);
  vertex(px - 10, py + 100);
  vertex(px + 10, py + 80);
  vertex(px + 30, py + 60);
  vertex(px + 20, py + 20);
  endShape(CLOSE);
}
