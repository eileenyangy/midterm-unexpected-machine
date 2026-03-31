// Adjective: AMBITIOUS :)
// Creative direction: Reaching for the moon

// ----------------------- MY VARIABLES -----------------------
// COLORS
let sky = "#6199C0";
let moon = "#FFF9DA";
let mtn = "#D2E4F2";
let darkersky = "#2B4A6B";

// STARS
let x, y, diameter; // x & y = where star gets drawn

// SNOW
let snowflakes = []; //array (list that stores a lot of snowflake objects)

// MOON POSITION + SIZE
let moonDefaultY = 250;
let moonDefaultX = 300;
let moonR = 150; //radius
let moonCX, moonCY; //moon's actual position adjusted by mouse
let ropeAnchorX, ropeAnchorY; // point on moon where rope goes
let moonGlow = 1; // ctrl glow brightness - goes to 4 when mouse is closer

// MOUNTAIN PEAK X/Y COORDINATES
let peakX = 560;
let peakY = 380;

// FOOTSTEPS
let footsteps = []; // empty array: fills up with Footstep objects as the person moves up
let lastFootX = -999; // x of most recent footstep
let lastFootY = -999; // y

// MOON MOVING STATE tracking how far moon drifted
let escapeX = 0; // horizontal
let escapeY = 0; // vertical

// CLIMBER CURRENT POSITION START IN BOTTOM RIGHT CORNER
let climberX = 800;
let climberY = 800;

// TIME FOR CLIMB + ROPE
let startTime;
let ropeExtension = 0; // will track how much of the rope is avail: 0 = no, 1 = yes

// CLIMBING PATH is an array that will define the figure's movement in timed segments
// Each row is one segment: [ startMs, endMs, fromX, fromY, toX, toY ]
// elapsed time (millis() - startTime) tells us which segment we're in
// The figure lerp() slides from (fromX,fromY) to (toX,toY) over that time range
// When fromX/fromY == toX/toY, the position doesn't change — that's the explicit pause

let climbingPath = [
  [0, 3300, 780, 720, 700, 590], // 0–3.3s: climber moves from (780,720) to (700,590)
  [3300, 5300, 700, 590, 700, 590], // 3.3–5.3s: pause
  [5300, 8300, 700, 590, 635, 472], // 5.3–8.3s: second climb
  [8300, 10300, 635, 472, 635, 472], // 8.3–10.3s: hold still again
  [10300, 13300, 635, 472, 560, 390], // 10.3–13.3s: last climb to top
];

const CLIMB_END = 13300; // after 13.3s the climber locks onto the peak and stops moving
const ROPE_START = 15000; // rope doesn't appear until 15s
const ROPE_MOVING = 10000; // will take rope 10 seconds to reach moon


// ----------------------- FOOTSTEP CLASS -----------------------
// a class will help me create multiple similar objects
// whenever a "new Footstep()" is called, it makes one footstep mark with its own x/y

class Footstep {
  constructor(fx, fy) {
    // constructor runs automatically when a new Footstep is created new Footstep(fx, fy)
    this.x = fx; // store x pos passed in this is where the footstep appears horizontally
    this.y = fy; // store y pos passed in vertically
  }

  show() {
    // show() draws this specific footstep onto the canvas each frame
    noStroke();
    fill("#FFFFFF");
    ellipse(this.x, this.y, 5, 4); //left foot, 5px wide, 4 px tall
    ellipse(this.x + 7, this.y + 3, 4); // right foot: shifted 7px to the right and 3px lower so the two feet look staggered
  }
}

// ---------------SNOWFLAKE CLASS-----------------------
// Defines the properties of each snow particle
// Each snowflake has a position, size, color, + motion
// When new Snowflake() is called, constructor initializes these

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

// ---------------ROPE ANCHOR-----------------------
// finds point on moon where rope connects
// called every frame bc the moon moves, and this point needs to update
function updateRope() {
  ropeAnchorX = moonCX + moonR * 0.8; //anchoring point to moon edge
  ropeAnchorY = moonCY + moonR * 0.6; //vertical position
}

// ---------------ARRAYS-----------------------
// Creates all 120 snowflake objects and stores them in the snowflakes array
function buildArrays() {
  snowflakes = []; //reset snowflake list
  for (let i = 0; i < 120; i++) snowflakes.push(new Snowflake()); // loop runs 120x
}

//-------------------SETUP-------------------
function setup() {
  createCanvas(800, 800);
  moonCX = moonDefaultX; // set moon's actual x to its default x
  moonCY = moonDefaultY;
  startTime = millis(); // here we'll record the millisecond this starts
  updateRope();
  buildArrays();
}

// MOVING MOON AWAY FROM MOUSE
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
  moonCX = moonDefaultX + escapeX;
  moonCY = moonDefaultY + escapeY;
  updateRope();
}

// ------------------- UPDATE CLIMBER -------------------
// runs every frame & figures out where climber shd be
function updateClimber() {
  let elapsed = millis() - startTime; //ms since sketch started

  for (let s of climbingPath) {
    let startMs = s[0],
      endMs = s[1];
    let fromX = s[2],
      fromY = s[3];
    let toX = s[4],
      toY = s[5];

    if (elapsed >= startMs && elapsed <= endMs) {
      let t = (elapsed - startMs) / (endMs - startMs);
      climberX = lerp(fromX, toX, t); // lerp from fromX to toX
      climberY = lerp(fromY, toY, t);
      return;
    }
  }

  // if we passed all time, put climber at top of mountain
  climberX = peakX;
  climberY = peakY;
}

// ------------------- DRAW -------------------
function draw() {
  print(mouseX, mouseY);
  updateMoon();
  updateClimber();
  background(sky);

  // STARS
  if (frameCount % 8 === 0) {
    noStroke();
    fill("#FFFFFF");
    let i = 0;
    while (i < 40) {
      //loop runs 40x to make 40 stars
      x = random(800); //pick random position across canvas
      y = random(800 * 0.8); // only in the sky area
      size1 = random(1, 6); //random star size between 1 & 6 px
      ellipse(x, y, size1, size1);
      i++; //increase i so eventually it stops
    }
  }

  drawMoon(moonCX, moonCY, moonR); // draw the moon at its current position; x, y, and radius
  drawMountain(peakX, peakY); // draw mountain with peak coordinates

  // FOOTSTEPS LOOP
  for (let i = 0; i < footsteps.length; i++) {
    footsteps[i].show();
  }

  // ADD NEW FOOTSTEP if the climber has moved enough since the last one
  let moved = dist(climberX, climberY, lastFootX, lastFootY);
  let elapsed = millis() - startTime;
  if (moved > 28 && elapsed < CLIMB_END) {
    footsteps.push(new Footstep(climberX, climberY + 16));
    lastFootX = climberX;
    lastFootY = climberY;
  }

  // FIGURE
  push(); // push saves the current state
  fill("#000000");
  translate(climberX, climberY);
  noStroke();
  rectMode(CENTER);
  rect(0, -17, 12, 20, 3);
  ellipse(0, -31, 11);
  stroke("#000000");
  strokeWeight(6);
  strokeCap(ROUND);
  noFill();
  line(4, -21, -12, -44);
  line(-4, -18, -13, -9);
  line(-3, -6, -8, 16);
  line(3, -6, 10, 16);
  rectMode(CORNER);
  pop();

  // ROPE
  if (elapsed >= ROPE_START) {
    ropeExtension = min((elapsed - ROPE_START) / ROPE_MOVING, 1.0);
    drawRope(); // draw how much of the rope is currently visible
  }

  // SNOWFLAKES — update and draw every flake each frame
  let currentTime = frameCount / 60; // convert frame count to seconds (60fps) so snow speed is time-based, not frame-rate-based
  for (let f of snowflakes) {
    // loop through every Snowflake object in the array
    f.update(currentTime); // move this snowflake based on how many seconds have passed
    f.show(); // draw this snowflake at its new position
  }
}

// DRAW MOON (x position, y position, and radius as parameters)
function drawMoon(x, y, r) {
  //GLOW (Transparent circles around moon)
  noStroke();
  for (let i = 5; i > 0; i--) {
    //Loop runs 5 times, each circle gets a bit bigger to create a halo effect
    fill(255, 240, 180, 30); //30 opacity
    ellipse(x, y, r * 2 + i * 30); //i * 30 increases the size of each glow ring
  }
  fill(moon);
  ellipse(x, y, r * 2);
}

// ------------------- DRAW ROPE -------------------
// Using a quadratic bezier curve for an arc so it looks more like a rope
// ropeExtension (0 to 1) controls how much of the rope is visible and grows frame by frame

function drawRope() {
  let handX = peakX - 10; // x of the climber's raised hand
  let handY = peakY - 40; // y of the raised hand
  let midX = (handX + ropeAnchorX) / 2; // midpoint x between hand & moon anchor, control point
  let midY = (handY + ropeAnchorY) / 2 - 30; // midpoint y, 30px up
  stroke("#000000");
  strokeWeight(1.5);
  noFill();

  let segments = 30; // divide the rope into 30 segments
  let maxSeg = floor(segments * ropeExtension); // how many of those segments to draw right now, start at 0 and grow to 30
  let prevX = handX; // start drawing from the hand's position
  let prevY = handY;

  //Understanding bezier segment
  for (let i = 1; i <= maxSeg; i++) {
    let t = i / segments;
    let bx = (1-t) * (1-t) * handX + 2 * (1-t) * t * midX + t * t * ropeAnchorX;
    let by = (1 - t) * (1 - t) * handY + 2 * (1 - t) * t * midY + t * t * ropeAnchorY;
    line(prevX, prevY, bx, by);
    prevX = bx;
    prevY = by;
  }
}

// ------------------- DRAW MOUNTAIN -------------------
function drawMountain(px, py) {
  noStroke();

  //MAIN
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

// ----------------------- KEY PRESS FUNCTION -----------------------
function keyPressed() {
  //when a key is pressed on the keyboard, change color from light to dark blue
  if (sky === "#6199C0") {
    sky = darkersky;
  } else {
    sky = "#6199C0";
  }
}

// Sources are outlined here: https://docs.google.com/document/d/1nUZCx3v6fGrbN5RsnH-4YqyAcHRENuNGHufebWgbuYc/edit?usp=sharing
