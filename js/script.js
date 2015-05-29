var numOrgs = {
    'producer': 0,
    'herbivore': 0,
    'omnivore': 0,
    'carnivore': 0
};
var allOrgs = []; //collection of organism objects, with relevent data
var allRefs = []; //JUST the references. This gets shuffled; allOrgs does NOT.
var t; //timer var. Cleared when we 'fail'
var plantReproSuccess = 0.99; //lower for more plant spawns, raise for fewer plant spawns
var maxOrgs = 300; //raise if you have a good computer!
var orgFullHp = 500; //raise for more 'long-lasting' organisms
var numFrames = 0; //For reporting when ecosystem 'fails'.
var winWidth = $(window).innerWidth() - 20;
var winHeight = $(window).innerHeight() - 20;
var seasNum = 0;
for (var key in numOrgs) {
    if (numOrgs.hasOwnProperty(key)) {
        while (numIn === undefined || isNaN(numIn)) {
            var numIn = parseInt(prompt('How many ' + key + 's does your habitat have?', ''), 10);
        }
        numOrgs[key] = numIn;
    }
    numIn = undefined;
}

var org = function(id, type, x, y, dx, dy) {
    this.id = id; //the organism's id. combo of its 'species' and a unique identifying number
    this.x = x; //org's position x
    this.y = y; //org's position y
    this.dx = dx; //org's current direction x
    this.dy = dy; //org's current direction y
    this.type = type; //org type. same as first part of id 
    var hpRange = (1.2 * orgFullHp) - (0.8 * orgFullHp);
    var hp = (0.8 * orgFullHp) + (Math.random() * hpRange);
    this.hp = Math.floor(hp);
    this.maxHp = Math.floor(hp); //this one does not get changed. It provides a percent 'base' for the hp-bar fn
    this.reproChance = 0.2; //chance each time the target changes that this is gonna mate
    this.age = numFrames; //what frame this was created at
    this.state = 'mate';
    var randState = Math.random();
    if (randState < 0.33) {
        this.state = 'rand';
    } else if (randState < 0.67) {
        this.state = 'pred';
    }
    this.currTarg = 0; //organism's target. If rand or just 'hit' previous targ, null. Otherwise, a number representing another organism (in allOrgs list)
};

var distCalc = function(one, two) {
    //help fn to calculate distance between two orgs
    //this is used to see if the targ is still within the visible 'range'.
    var x1 = allOrgs[one].x;
    var x2 = allOrgs[two].x;
    var y1 = allOrgs[one].y;
    var y2 = allOrgs[two].y;
    var dist = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
    return dist;
};

var changeMode = function(org) {
    var oldState = allOrgs[org].state;
    // while (allOrgs[org].state == oldState) {
    //keep running until we get a state that's different from the one we just did.
    var randState = Math.random();
    if (randState < 0.375) {
        allOrgs[org].state = 'pred';
    } else if (randState < 0.75) {
        allOrgs[org].state = 'mate';
    } else {
        allOrgs[org].state = 'rand';
    }
    // }
};

var targSearch = function(srcOrg, mode) {
    //find a relevent target!
    var notVis = true; //default visibility to no
    var targOrg = 0; //default target org to 0
    var visDist = ($(document).width()) / 2;
    var goodTarg = false; //checks to see if it's a relavent target, depending on mode
    changeMode(srcOrg);
    mode = allOrgs[srcOrg].state;
    if (mode != 'rand' && allOrgs[srcOrg].type != 'producer') {
        //not random movement
        while (srcOrg == targOrg || notVis || !goodTarg) {
            targOrg = Math.floor(Math.random() * allOrgs.length); //pick a random target
            if (distCalc(srcOrg, targOrg) < visDist) {
                //target in range
                notVis = false;
            } else {
                //target not in range;
                notVis = true;
            }
            goodTarg = false; //default back to bad targ
            if (mode == 'pred') {
                //determine if this is a relevent target for predation
                //note that for the sake of this sim, omnivores prey ONLY on herbivores, not on carnivores
                if (allOrgs[srcOrg].type == 'herbivore' && allOrgs[targOrg].type == 'producer') {
                    goodTarg = true;
                } else if (allOrgs[srcOrg].type == 'omnivore' && (allOrgs[targOrg].type == 'herbivore' || allOrgs[targOrg].type == 'producer')) {
                    goodTarg = true;
                } else if (allOrgs[srcOrg].type == 'carnivore' && (allOrgs[targOrg].type == 'herbivore' || allOrgs[targOrg].type == 'omnivore')) {
                    goodTarg = true;
                }
            } else {
                //determine if this is a relevent target for mate
                if (allOrgs[targOrg].type == allOrgs[srcOrg].type) {
                    goodTarg = true;
                }
            }
        }
        allOrgs[srcOrg].currTarg = targOrg; //finally, once we've found a target, set that!
    }
};

var statsUpd = function(srcOrg) {
    //update health bar on organism;
    var hpPerc = Math.ceil(allOrgs[srcOrg].hp * 100 / allOrgs[srcOrg].maxHp);
    var hpId = allOrgs[srcOrg].id + 'bar';
    $('#' + hpId).css('width', hpPerc + '%');
};

Array.prototype.randOrgs = function() {
    //another helper function. This simply shuffles all orgs according to the fisher-price algorithm or something.
    var i = this.length,
        j, temp;
    if (i === 0) return;
    while (--i) {
        j = Math.floor(Math.random() * (i + 1));
        temp = this[i];
        this[i] = this[j];
        this[j] = temp;
    }
};

var generate = function() {
    //initialize
    for (var key in numOrgs) {
        if (numOrgs.hasOwnProperty(key)) {
            for (var i = 0; i < numOrgs[key]; i++) {
                newOrg(key, i);
            }
        }
    }
    //populate reference arr
    for (var q = 0; q < allOrgs.length; q++) {
        allRefs.push(q);
        targSearch(q, allOrgs[q].state);
    }
    //now start the timer
    t = setInterval(function() {
        render();
    }, 40);
};

var showInt = function(showNum, seekMode) {
    //function highlights this organism and its 'target'
    var seeker = allOrgs[showNum].id;
    var seekee = allOrgs[allOrgs[showNum].currTarg].id;
    console.log('Targets: ', seeker, seekee)
    if (seekMode) {
        $('#' + seeker).addClass('skrHi');
        $('#' + seekee).addClass('skeHi');
    } else {
        for (var i = 0; i < allOrgs.length; i++) {
            $('#' + allOrgs[i].id).removeClass('skrHi', 'skeHi');
            $('#' + allOrgs[i].id).removeClass('skrHi', 'skeHi');
        }
    }
};

var newOrg = function(key, i) {
    var el = document.createElement('div');
    el.className = 'beastie';
    var id = key + i;
    el.id = id;
    var x = Math.floor(Math.random() * winWidth);
    var y = Math.floor(Math.random() * winHeight);
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    if (key == 'producer') {
        el.innerHTML = '<div class="barFull"><div id="' + id + 'bar" class="barInner"></div></div>\uD83C\uDF32';
    } else if (key == 'herbivore') {
        el.innerHTML = '<div class="barFull"><div id="' + id + 'bar" class="barInner"></div></div>\uD83D\uDC04';
    } else if (key == 'omnivore') {
        el.innerHTML = '<div class="barFull"><div id="' + id + 'bar" class="barInner"></div></div>\uD83D\uDC16';
    } else {
        el.innerHTML = '<div class="barFull"><div id="' + id + 'bar" class="barInner"></div></div>\uD83D\uDC15';
    }
    var xDir = (Math.random() > 0.5) ? 1 : -1;
    var yDir = (Math.random() > 0.5) ? 1 : -1;
    var whichOrg = allOrgs.length;
    allOrgs.push(new org(id, key, x, y, xDir, yDir));
    el.onmouseout = function() {
        showInt(whichOrg, 0)
    };
    el.onmouseover = function() {
        showInt(whichOrg, 1)
    };
    $('#playingField').append(el);
};
generate(); //create the playing 'field'. runs once at start.

var frameDif = 0;
var moveFn = function(orgNum) {
    if (allOrgs[orgNum].state == 'rand') {
        //random movement
        var chanceFlipX = Math.random();
        if (chanceFlipX > 0.97) {
            allOrgs[orgNum].dx *= -1;
        }
        //then yflip chance;
        var chanceFlipY = Math.random();
        if (chanceFlipY > 0.97) {
            allOrgs[orgNum].dy *= -1;
        }
        //now border detection: x
        if ((allOrgs[orgNum].x > (winWidth - 10) && allOrgs[orgNum].dx == 1) || (allOrgs[orgNum].x < 10 && allOrgs[orgNum].dx == -1)) {
            allOrgs[orgNum].dx *= -1;
        }
        //and y
        if ((allOrgs[orgNum].y > (winHeight - 10) && allOrgs[orgNum].dy == 1) || (allOrgs[orgNum].y < 10 && allOrgs[orgNum].dy == -1)) {
            allOrgs[orgNum].dx *= -1;
        }
    } else if (allOrgs[orgNum].currTarg && allOrgs[orgNum].currTarg < allOrgs.length) {
        //org has a target, so find that
        //note that orgs with a target get 1.5 speed instead of 1.0
        var theTarg = allOrgs[orgNum].currTarg;
        console.log(typeof theTarg)
        if (allOrgs[orgNum].x < allOrgs[theTarg].x) {
            allOrgs[orgNum].dx = 1.5;
        } else {
            allOrgs[orgNum].dx = -1.5;
        }

        if (allOrgs[orgNum].y < allOrgs[theTarg].y) {
            allOrgs[orgNum].dy = 1.5;
        } else {
            allOrgs[orgNum].dy = -1.5;
        }
    }
};

var render = function() {
    var timeStart = new Date().getTime();
    //render new positions of each element. This is the main frame fn
    for (var i = 0; i < allOrgs.length; i++) {
        if (allOrgs[i].type != 'producer') {
            //not a plant
            moveFn(i);
            interact(i);
            allOrgs[i].x = parseInt(allOrgs[i].x, 10) + parseInt(allOrgs[i].dx, 10);
            allOrgs[i].y = parseInt(allOrgs[i].y, 10) + parseInt(allOrgs[i].dy, 10);
            $('#' + allOrgs[i].id).css({
                'left': allOrgs[i].x + 'px',
                'top': allOrgs[i].y + 'px'
            });

        }
    }
    graphDraw();
    numFrames++;

    //temporary frame-time calc
    var timeEnd = new Date().getTime();
    if (frameDif < (timeEnd - timeStart)) {
        frameDif = timeEnd - timeStart;
        console.log('Time for one frame: ' + frameDif + 'ms');
    }

    //fail conditions
    if (numOrgs.producer < 1) {
        clearInterval(t);
        alert('Your ecosystem destabilized after ' + numFrames + ' frames: There are no more producers!');
    } else if (numOrgs.herbivore < 1) {
        clearInterval(t);
        alert('Your ecosystem destabilized after ' + numFrames + ' frames: There are no more herbivores!');
    } else if (numOrgs.omnivore < 1) {
        clearInterval(t);
        alert('Your ecosystem destabilized after ' + numFrames + ' frames: There are no more omnivores!');
    } else if (numOrgs.carnivore < 1) {
        clearInterval(t);
        alert('Your ecosystem destabilized after ' + numFrames + ' frames: There are no more carnivores!');
    }
};

var mateFn = function(first, second) {
    if (Math.random() > 0.3 && allOrgs.length < maxOrgs) {
        //so we dont mate every time
        newOrg(allOrgs[first].type, numOrgs[allOrgs[first].type]);
        //increment num this type by 1
        numOrgs[allOrgs[first].type] += 1;
        //set so org cannot immediately reproduce
        console.log(allOrgs[first].type + first + ' mated!');
        $('#' + allOrgs[first].id).css({
            'animation': 'none',
            '-webkit-animation': 'none'
        });
        $('#' + allOrgs[first].id).css({
            'animation': 'mateBurst 1s linear',
            '-webkit-animation': 'mateBurst 1s linear'
        });
        $(body).css('background-color', '#fcc')
    }
    targSearch(first, allOrgs[first].state);
};

var predFn = function(predator, prey) {
    if (Math.random() > 0.5) {
        //predation! FATALITY! note this has a chance to fail
        $('#' + allOrgs[prey].id).remove();
        numOrgs[allOrgs[prey].type] -= 1;
        allOrgs.splice(prey, 1); //remove prey from allOrgs list, since it 'died'
        $('#' + allOrgs[predator].id).css({
            'animation': 'none',
            '-webkit-animation': 'none'
        });
        $('#' + allOrgs[predator].id).css({
            'animation': 'preyBurst 1s linear',
            '-webkit-animation': 'preyBurst 1s linear'
        });
        allOrgs[predator].hp = allOrgs[predator].maxHp; //organism 'recharges' its hp bar
        adjustTargs[prey]; //adjust target for any that were also 'seeking' this.
    } else {
        //predation failed. pick new targ
        targSearch(predator, allOrgs[predator].state);
    }
};

var dieFn = function(toDie) {
    //starvation
    //note that unlike predation and mating, this ALWAYS occurs
    $('#' + allOrgs[toDie].id).remove();
    numOrgs[allOrgs[toDie].type] -= 1;
    allOrgs.splice(toDie, 1); //remove victim from allOrgs list, since it 'died'
    adjustTargs[toDie];
};

var graphDraw = function() {
    var total = allOrgs.length;
    var percProd = Math.floor((numOrgs.producer / total) * 95);
    var percHerb = Math.floor((numOrgs.herbivore / total) * 95);
    var percOmni = Math.floor((numOrgs.omnivore / total) * 95);
    var percCarn = Math.floor((numOrgs.carnivore / total) * 95);
    $('#prodGraph').css('width', percProd + '%');
    $('#herbGraph').css('width', percHerb + '%');
    $('#omniGraph').css('width', percOmni + '%');
    $('#carniGraph').css('width', percCarn + '%');
};

var interact = function(orgInt) {
    if (allOrgs[orgInt].currTarg && allOrgs[orgInt].currTarg < allOrgs.length) {
        var targInt = allOrgs[orgInt].currTarg;
        var xDiff = Math.abs(allOrgs[orgInt].x - allOrgs[targInt].x);
        var yDiff = Math.abs(allOrgs[orgInt].y - allOrgs[targInt].y);
        if (xDiff < 10 && yDiff < 10) {
            console.log(xDiff, yDiff,allOrgs[orgInt].state);
            if (allOrgs[orgInt].state == 'pred') {
                predFn(orgInt, targInt);
            } else if (allOrgs[orgInt].state == 'mate') {
                mateFn(orgInt, targInt);
            }
        }
    }
    allOrgs[orgInt].hp--;
    statsUpd(orgInt);
    if (allOrgs[orgInt].hp === 0) {
        dieFn(orgInt);
    }
};

var adjustTargs = function(oldTargNum) {
    console.log('Called adjustTargs for: ', oldTargNum)
    for (var m = 0; m < allOrgs.length; m++) {
        if (allOrgs[m].currTarg > oldTargNum) {
            //if greater 
            allOrgs[m].currTarg--;
        } else if (allOrgs[m].currTarg == oldTargNum) {
            targSearch(m, allOrgs[m].state);
        }
    }
};


/*
CURRENT ISSUES:
As it stands, this should create a 'black hole' effect in the center of the screen, because all orgs will 'seek' other orgs.
no reproductions! why?!
when org dies, we need to shift all RIGHT of that left ONE. 
*/
