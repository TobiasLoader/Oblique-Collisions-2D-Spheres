

//////////////////////////////////////////////////////////     TYPE INTEGERS 1,2,3,4,5,6,7,8,9,0


var N;   // Which scene is being viewed (whole number 1 -> 6)

var g; // Gravitational Acceleration (pixels / frame)
var e; // Coefficient of Restitution (between balls)

// Other settings:
var zeroG;
var useFloorSpecial;
var gravBalls;
var stopOnCollide;
var floorHeight;
var verbose;

// var collisions;
// var prevCollisions;
var play;

var analyseCollisionOf;

var P;

function setup() {
	
	W = window.innerWidth;
  	H = window.innerHeight;
  	
  // put setup code here
  
	N = 1;   // Which scene is being viewed (whole number 1 -> 0)
	
	verbose = false;
	
// 	collisions = [];
// 	prevCollisions = [];
	play = 1;
	
	analyseCollisionOf = [5,7];
	
	// Initialize VAR'S here (give them values)
 	canvas = createCanvas(W, H);
  
	textFont('Avenir Next');
	textAlign(CENTER,CENTER);
	angleMode(DEGREES);
	
	newSetUp(N);
	runSetup(N);
}

function setUpEnv(){
		
	P = [];
	
	g = 0.3; // Gravitational Acceleration (pixels / frame)
	e = 0.6; // Coefficient of Restitution (between balls)
	
	// Other settings:
	zeroG = false;
	useFloorSpecial = true;
	gravBalls = false;
	stopOnCollide = false;
	floorHeight=H/5;
}

function newSetUp(N){
	setUpEnv();
	initSetup(N);
}

function draw() {
	if (!play){
		runSetup(N);
	}
}


window.onresize = function() {
  resizeCanvas(windowWidth, windowHeight);
  W = windowWidth;
  H = windowHeight
};


// Other functions down here

class Particle{
	constructor (x,y,m,r,v,F,colour){
	    this.x = x; // x-coor
	    this.y = y; // y-coor
	    this.m = m; // mass
	    this.r = r; // radius
	    this.v = v; // velocity
	    this.F = F; // force
	    this.onGround = false;
	    this.collide = false;
	    this.colour = colour;
    }
    
    draw (i){
    	fill(this.colour);
	    stroke(79, 79, 79);
	    ellipse(this.x,this.y,2*this.r,2*this.r);
	    fill(51, 51, 51);
		textSize(this.r/2);
	    scale(1,-1);
	    text(i,this.x,-this.y+1);
	    scale(1,-1);
	}
	
	updateForce (i){
	    if (zeroG){
	        this.F.y = 0;
	    } else {
	        this.F.y = -this.m*g;
	    }
	    
	    this.F.x = 0;
	    
	    // AIR RESISTANCE
	    
	    if (!this.onGround){
	        this.F.x *= pow(1.05,-abs(this.v.x));
	        this.F.y *= pow(1.05,-abs(this.v.y));
	    }
	    
	    collideCeil(this);
	    collideWallLeft(this);
	    collideWallRight(this);
	    collideFloor(this);
	    
	    if (gravBalls){
		    for (var j=0; j<P.length; j+=1){
			    if (i!==j){
					graviAttract(this,P[j]);
				}
		    }
	    }
	    
	    if (this.collide){
/*
	        var inPrevCollision = false;
	        if (collisions.length){
	            for (var c=0; c<collisions.length; c+=1){
	                if (collisions[c][0]===analyseCollisionOf[0] && collisions[c][1]===analyseCollisionOf[1]){
	                    inPrevCollision = true;
	                    break;
	                }
	            }
	        }
*/
/*
	        if (collisions[c][0]===analyseCollisionOf[0] && collisions[c][1]===analyseCollisionOf[1]){
	            verbose = true;
	        }
*/
	        var XvRot = (this.collide.thisV.x*(this.m-this.collide.m*e) + this.collide.v.x*(this.collide.m + this.collide.m*e))/(this.m + this.collide.m);
	        // var YvRot = (this.collide.thisV.y*(this.m-this.collide.m*e) + this.collide.v.y*(this.collide.m + this.collide.m*e))/(this.m + this.collide.m);
	        var YvRot = this.collide.thisV.y;
	        if (verbose){
	            print('\n'+i+' Rotated...');
	            print('X:  '+str(round(XvRot*1000)/1000)+', Y:  '+str(round(YvRot*1000)/1000));
	        }
	        var targetVX = (XvRot*this.collide.c-YvRot*this.collide.s);
	        var targetVY = (YvRot*this.collide.c+XvRot*this.collide.s);
	        this.F.x += this.m*(targetVX-this.v.x);
	        this.F.y += this.m*(targetVY-this.v.y);
	        if (verbose){
	            print('\n'+i+' Normal...');
	            print('X:  '+str(round(targetVX*1000)/1000)+', Y:  '+str(round(targetVY*1000)/1000));
	            print('\n ----------\n');
	        }
	        this.collide = false;
/*
	        if (inPrevCollision){
	            verbose = false;    
	        }
*/
	    }
	}
	
	updateVel (){
	    this.v.x += this.F.x/this.m;
	    this.v.y += this.F.y/this.m;
	    
	    if (this.onGround){
	        this.v.x /= 1.01;
	        if (abs(this.v.x) < 0.05){
	            this.v.x = 0;    
	        }
	    }
	}

	updatePos (){
	    this.x += this.v.x;
	    this.y += this.v.y;
	}


}

function collideFloor(particle){
    if (particle.y-particle.r<=2+floorHeight){
        if (useFloorSpecial){
            particle.y=particle.r+floorHeight;
            if (abs(particle.v.y)>=1) {
                particle.F.y += -1.5*particle.m*particle.v.y;
            } else {
                particle.F.y += particle.m*g;
                if (!particle.onGround){
                    particle.F.y += particle.m*particle.v.y;
                }
                particle.onGround = true;
            }
        } else {
            particle.y = floorHeight+particle.r+2;
            particle.F.y += -2*particle.m*particle.v.y;
        }
    }
}

function graviAttract(p1,p2){
	var d = dist(p1.x,p1.y,p2.x,p2.y);
	p1.F.x += 10*(p2.x-p1.x)/d * (p1.m * p2.m)/sq(d);
	p1.F.y += 10*(p2.y-p1.y)/d * (p1.m * p2.m)/sq(d);
}

function collideCeil(particle){
    if (particle.y+particle.r>=height+2){
        particle.y = height-particle.r;
        particle.F.y += -2*particle.m*particle.v.y;
    }
}
function collideWallLeft(particle){
    if (particle.x-particle.r<=2){
        particle.x = particle.r+3;
        particle.F.x += -2*particle.m*particle.v.x*0.9;
    }
}
function collideWallRight(particle){
    if (particle.x+particle.r>=width-2){
        particle.x = width-particle.r-3;
        particle.F.x += -2*particle.m*particle.v.x*0.9;
    }
}

function checkCollide(p1,p2,i1,i2){
//     var inPrevCollision = false;
/*
    for (var c=0; c<prevCollisions.length; c+=1){
        if (prevCollisions[c][0]===i1 && prevCollisions[c][1] === i2){
            inPrevCollision = true;
            break;
        }
    }
*/
//     if (!inPrevCollision){
        if ((p2.x-p1.x)*(p2.x-p1.x) + (p2.y-p1.y)*(p2.y-p1.y) <= (p1.r+p2.r)*(p1.r+p2.r)){
	        var analyse = false;
            if (i1 === analyseCollisionOf[0] && i2 === analyseCollisionOf[1]){
                analyse = true;    
            }
            if (verbose || analyse){
                print('\n ----------------------------\n');
                print('\nCOLLISION');
            }
            var d = dist(p1.x,p1.y,p2.x,p2.y);
            var Xoverlap = (p2.x-p1.x)*((p1.r+p2.r) - d)/(p1.r+p2.r);
/*
            if (verbose){
            print(Xoverlap);
            }
*/
            
            p1.x = p1.x - Xoverlap/2;
            p2.x = p2.x + Xoverlap/2;

            if (!p1.onGround || !p2.onGround){
                var Yoverlap = (p2.y-p1.y)*((p1.r+p2.r) - d)/(p1.r+p2.r);
                p1.y = p1.y - Yoverlap/2;
                p2.y = p2.y + Yoverlap/2;
            }
            d = dist(p1.x,p1.y,p2.x,p2.y);
            Xoverlap = abs(p2.x-p1.x)*((p1.r+p2.r) - d)/(p1.r+p2.r);
/*
            if (verbose){
            print(Xoverlap);
            }
*/
            // background(255, 255, 255);
            // p1.draw();
            // p2.draw();
            var rotateP1 = {x:(p1.v.x*(p2.x-p1.x)+p1.v.y*(p2.y-p1.y))/d,y:(p1.v.y*(p2.x-p1.x)-p1.v.x*(p2.y-p1.y))/d};
            var rotateP2 = {x:(p2.v.x*(p2.x-p1.x)+p2.v.y*(p2.y-p1.y))/d,y:(p2.v.y*(p2.x-p1.x)-p2.v.x*(p2.y-p1.y))/d};
            if (verbose || analyse) {
                print('\nNormal Orientation...');
                print(i1+': Vx:'+round(1000*p1.v.x)/1000 +', Vy:' + round(1000*p1.v.y)/1000);
                print(i2+': Vx:'+round(1000*p2.v.x)/1000 +', Vy:' + round(1000*p2.v.y)/1000);
                print('\nRotated...');
                print(i1+': Vx:'+round(1000*rotateP1.x)/1000 +', Vy:' + round(1000*rotateP1.y)/1000);
                print(i2+': Vx:'+round(1000*rotateP2.x)/1000 +', Vy:' + round(1000*rotateP2.y)/1000);
                print('\nAngles...');
                // print(sq((p2.x-p1.x)/d)+sq((p2.y-p1.y)/d));
                print('from cos: '+round((p2.x-p1.x)/d*1000)/1000);
                print('from sin: '+round((p2.y-p1.y)/d*1000)/1000);
                // print('from cos: '+round(acos((p2.x-p1.x)/d)*1000)/1000);
                // print('from sin: '+round(asin((p2.y-p1.y)/d)*1000)/1000);
            }
            p1.collide = {v:rotateP2,m:p2.m,x:p2.x,y:p2.y,d:d,thisV:rotateP1,c:(p2.x-p1.x)/d,s:(p2.y-p1.y)/d};
            p2.collide = {v:rotateP1,m:p1.m,x:p1.x,y:p1.y,d:d,thisV:rotateP2,c:(p2.x-p1.x)/d,s:(p2.y-p1.y)/d};
//             collisions.push([i1,i2]);
            if (stopOnCollide){
                play = 1;
            }
        }
//     }   
}


function simulateParticle(particle,i){
    particle.updateForce(i);
    particle.updateVel();
    particle.updatePos();
    particle.draw(i);
}

function checkCollideAll(P){
	for (var i=0; i<P.length-1; i+=1){
        for (var j=i+1; j<P.length; j+=1){
            checkCollide(P[i],P[j],i,j);
        }
    }
}

function simulateAll(P){            
    for (var i=0; i<P.length; i+=1){
        simulateParticle(P[i],i);
    }
}

///////////////////////////

function initSetup(N){
    switch (N){
	    case 1:
	        P.push(new Particle(113,255,1,25,{x:7,y:2},{x:0,y:-g},color(141, 207, 227,100)));
	        P.push(new Particle(313,261,1,17,{x:-0.7,y:2},{x:0,y:-g},color(227, 143, 164,100)));
	        break;
		case 2:
	        P.push(new Particle(W/2,H/2,7,25,{x:0,y:7},{x:0,y:-g},color(141, 207, 227,100)));
	        for (var i=0; i<30; i+=1){
	            P.push(new Particle(random(W/4,3*W/4),random(3*H/4,2*H/3),1,13,{x:0,y:0},{x:0,y:-g},color(227, 143, 164,100)));
	        }
	        break;
		case 3:
        	P.push(new Particle(198,255,1,23,{x:0,y:3},{x:0,y:-g},color(141, 207, 227,100)));
			P.push(new Particle(226,310,1,26,{x:0,y:5},{x:0,y:-g},color(227, 143, 164,100)));
			break;
		case 4:
	        P.push(new Particle(198,266,1,24,{x:15,y:2},{x:0,y:-g},color(141, 207, 227,100)));
	        P.push(new Particle(252,201,1,22,{x:-10,y:-1},{x:0,y:-g},color(227, 143, 164,100)));
	        break;
		case 5:
	        P.push(new Particle(113,255,2,28,{x:7,y:2},{x:0,y:-g},color(141, 207, 227,100)));
	        P.push(new Particle(313,261,1,17,{x:-0.7,y:1},{x:0,y:-g},color(227, 143, 164,100)));
	        P.push(new Particle(282,146,4,11,{x:-0.7,y:6},{x:0,y:-g},color(192, 227, 143,100)));
	        break;
		case 6:
	        P.push(new Particle(292,133,4,24,{x:10,y:10},{x:0,y:-g},color(141, 207, 227,100)));
	        P.push(new Particle(97,118,1,10,{x:0,y:6},{x:0,y:-g},color(227, 143, 164,100)));
	        break;
		case 7:
	        zeroG = true;
	        useFloorSpecial = false;
	        P.push(new Particle(113,233,1,13,{x:-0.3,y:0.5},{x:0,y:0},color(141, 207, 227,100)));
	        P.push(new Particle(200,156,1,12,{x:0.6,y:-0.9},{x:0,y:0},color(227, 143, 164,100)));
	        P.push(new Particle(171,364,1,14,{x:-0.6,y:-1.6},{x:0,y:0},color(227, 143, 164,100)));
	        P.push(new Particle(211,122,1,15,{x:0.2,y:-0.4},{x:0,y:0},color(227, 143, 164,100)));
	        P.push(new Particle(154,83,1,11,{x:1.8,y:0.8},{x:0,y:0},color(227, 143, 164,100)));
	        P.push(new Particle(194,182,1,12,{x:-1.8,y:-1.7},{x:0,y:0},color(227, 143, 164,100)));
	        P.push(new Particle(281,265,1,10,{x:1.6,y:-1.6},{x:0,y:0},color(227, 143, 164,100)));
	        P.push(new Particle(192,215,1,15,{x:-1.8,y:0.4},{x:0,y:0},color(227, 143, 164,100)));
	        P.push(new Particle(323,240,1,14,{x:-0.8,y:0.6},{x:0,y:0},color(227, 143, 164,100)));
	        P.push(new Particle(255,141,1,12,{x:-1.8,y:-1.9},{x:0,y:0},color(227, 143, 164,100)));
	        P.push(new Particle(116,316,1,13,{x:1.8,y:1.5},{x:0,y:0},color(227, 143, 164,100)));
			break;
		case 8:
	        zeroG = true;
	        useFloorSpecial = false;
	        gravBalls = true;
	        floorHeight = 0;
	        P.push(new Particle(W/2,H/2,40,27,{x:0,y:0},{x:0,y:0},color(141, 207, 227,100)));
	        P.push(new Particle(W/2,H/4,40,14,{x:1.8,y:0},{x:0,y:0},color(227, 143, 164,100)));
	        P.push(new Particle(W/2,3*H/4,40,14,{x:-1.8,y:0},{x:0,y:0},color(227, 143, 164,100)));
	        P.push(new Particle(W/4,H/2,40,14,{x:0,y:-1.8},{x:0,y:0},color(227, 143, 164,100)));
	        P.push(new Particle(3*W/4,H/2,40,14,{x:0,y:1.8},{x:0,y:0},color(227, 143, 164,100)));
			break;
		case 9:
	        useFloorSpecial = false;
	        P.push(new Particle(2*W/3,H/3,4,25,{x:1,y:0},{x:0,y:0},color(227, 143, 164,100)));
	        P.push(new Particle(5*W/6,3*H/8,3,22,{x:-3,y:0},{x:0,y:0},color(227, 143, 164,100)));
	        P.push(new Particle(W/4,2*H/7,2,17,{x:0,y:-2},{x:0,y:0},color(227, 143, 164,100)));
	        P.push(new Particle(5*W/8,5*H/8,1,10,{x:0,y:2.5},{x:0,y:0},color(227, 143, 164,100)));
	        P.push(new Particle(W/2,H/2,10,27,{x:0,y:0},{x:0,y:0},color(141, 207, 227,100)));
			break;
		case 0:
			zeroG = true;
			floorHeight = 0;
			useFloorSpecial = false;
			for (var i=0; i<10; i+=1){
	        	P.push(new Particle(random(0,W),random(0,H),5,30,{x:0,y:0},{x:0,y:0},color(141, 207, 227,100)));
	        }
	        for (var i=0; i<100; i+=1){
	            P.push(new Particle(random(0,W),random(0,H),1,20,{x:0,y:0},{x:0,y:0},color(227, 143, 164,100)));
	        }
	        break;
    }
}

function defaultRun(){
	checkCollideAll(P);
    simulateAll(P);
}

function runSetup(N){
	background(255, 255, 255);
	textSize(20);
	textAlign(CENTER,CENTER);
	for (var i=0; i<10; i+=1){
		if (i===N){
			rectMode(CENTER);
			fill(70);
			noStroke();
			rect(W/2-(4.5-i)*W/20,7*H/8,30,30);
			fill(255);
		} else {
			fill(0);
		}
		text(i,W/2-(4.5-i)*W/20,7*H/8+2);
	}
	textSize(15);
	fill(0);
	text('Press KEYPAD to change scenes, and SPACE or CLICK to play/pause the simulation',W/2,15*H/16+2);
	translate(0,H);
	scale(1,-1);
    switch (N){
        case 1: defaultRun(); break;
		case 2:
            for (var i=1; i<P.length; i+=1){
                checkCollide(P[0],P[i]);
            }
            simulateAll(P);
            break;
        case 3: defaultRun(); break;
		case 4: defaultRun(); break;
		case 5: defaultRun(); break;
		case 6: defaultRun(); break;
		case 7: defaultRun(); break;
		case 8: defaultRun(); break;
		case 9: defaultRun(); break;
		case 0: defaultRun(); break;
		default: defaultRun(); break;
	}
    stroke(97, 97, 97,100);
    line(0,floorHeight,W,floorHeight);
}

// Issues with more than 1 particle when checking for collision as different outcomes when checking in different orders etc...

// Issues with floor, since particles can slide under others whilst on the floor and be ejected at great speed / bizarre physics, partly because they can push off of floor which isn't modelled with normal reaction currently but with v.y = 0...

function mouseClicked(){
    play = 1-play;    
};

function applyKeyFunc(val){
	if (val){
		if (keyCode>=48 && keyCode<=58){
			N = keyCode-48;
			newSetUp(N);
			runSetup(N);
		} else if (keyCode===32){
			play = 1-play;
		}
	}
}

function keyPressed(){
    applyKeyFunc(true);
}
function keyReleased(){
    applyKeyFunc(false);
}

