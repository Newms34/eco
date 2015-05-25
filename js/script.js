var numOrgs = {
    'producer': 0,
    'herbivore': 0,
    'omnivore': 0,
    'carnivore': 0
};
var allOrgs = [];
var t;
var plantReproSuccess = .99; //lower for more plant spawns, raise for fewer plant spawns
var maxOrgs = 300; //raise if you have a good computer!
var orgFullHp = 500; //raise for more 'long-lasting' organisms
var numFrames = 0; //For reporting when ecosystem 'fails'.
var winWidth = $(window).innerWidth() - 20;
var winHeight = $(window).innerHeight() - 20;
for (var key in numOrgs) {
    if (numOrgs.hasOwnProperty(key)) {
        while (numIn == undefined || isNaN(numIn)) {
            var numIn = parseInt(prompt('How many ' + key + 's does your habitat have?', ''));
        }
        console.log(numIn);
        numOrgs[key] = numIn;
    }
    numIn = undefined;
}

var org = function(id, type, x, y, dx, dy) {
    this.id = id
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.type = type;
    var hpRange = (1.2 * orgFullHp) - (0.8 * orgFullHp);
    var hp = (0.8 * orgFullHp) + (Math.random() * hpRange)
    this.hp = Math.floor(hp);
    this.tillRepo = 0;
    this.tillInter = 0;
}


var generate = function() {
    //initialize
    for (var key in numOrgs) {
        if (numOrgs.hasOwnProperty(key)) {
            for (var i = 0; i < numOrgs[key]; i++) {
                newOrg(key, i);
            }
        }
    }
    //now start the timer of DEAAAATH
    t = setInterval(function() {
        render();
    }, 40)
}
var newOrg = function(key, i) {
    var el = document.createElement('div');
    el.className = 'beastie';
    var id = key + i;
    el.id = id;
    var x = Math.floor(Math.random() * winWidth) + 'px';
    var y = Math.floor(Math.random() * winHeight) + 'px'
    el.style.left = x;
    el.style.top = y;
    if (key == 'producer') {
        el.innerHTML = '\uD83C\uDF32';
    } else if (key == 'herbivore') {
        el.innerHTML = '\uD83D\uDC04';
    } else if (key == 'omnivore') {
        el.innerHTML = '\uD83D\uDC16';
    } else {
        el.innerHTML = '\uD83D\uDC15';
    }
    $('#playingField').append(el);
    var xDir = (Math.random() > .5) ? 1 : -1;
    var yDir = (Math.random() > .5) ? 1 : -1;
    allOrgs.push(new org(id, key, x, y, xDir, yDir))

}
generate();
var frameDif = 0;
var render = function() {
    var timeStart = new Date().getTime();
    //render new positions of each element
    for (var i = 0; i < allOrgs.length; i++) {
        if (allOrgs[i].type != 'producer') {
            //first, xflip chance
            var chanceFlipX = Math.random();
            if (chanceFlipX > .97) {
                allOrgs[i].dx *= -1;
            }
            //then yflip chance;
            var chanceFlipY = Math.random();
            if (chanceFlipY > .97) {
                allOrgs[i].dy *= -1;
            }
            //now border detection: x
            if ((allOrgs[i].x > (winWidth - 10) && allOrgs[i].dx == 1) || (allOrgs[i].x < 10 && allOrgs[i].dx == -1)) {
                allOrgs[i].dx *= -1;
            }
            //and y
            if ((allOrgs[i].y > (winHeight - 10) && allOrgs[i].dy == 1) || (allOrgs[i].y < 10 && allOrgs[i].dy == -1)) {
                allOrgs[i].dx *= -1;
            }
            allOrgs[i].x = parseInt(allOrgs[i].x) + parseInt(allOrgs[i].dx);
            allOrgs[i].y = parseInt(allOrgs[i].y) + parseInt(allOrgs[i].dy);
            $('#' + allOrgs[i].id).css({
                'left': allOrgs[i].x + 'px',
                'top': allOrgs[i].y + 'px'
            });
        }
    }
    //now do interactions
    interact();
    graphDraw();
    numFrames++;
    var timeEnd = new Date().getTime();
    if (frameDif < (timeEnd - timeStart)) {
        frameDif = timeEnd - timeStart;
        console.log('Time for one frame: ' + frameDif + 'ms')
    }
    if (numOrgs['producer'] < 1) {
        clearInterval(t);
        alert('Your ecosystem destabilized after ' + numFrames + ' frames: There are no more producers!')
    } else if (numOrgs['herbivore'] < 1) {
        clearInterval(t);
        alert('Your ecosystem destabilized after ' + numFrames + ' frames: There are no more herbivores!')
    } else if (numOrgs['omnivore'] < 1) {
        clearInterval(t);
        alert('Your ecosystem destabilized after ' + numFrames + ' frames: There are no more omnivores!')
    } else if (numOrgs['carnivore'] < 1) {
        clearInterval(t);
        alert('Your ecosystem destabilized after ' + numFrames + ' frames: There are no more carnivores!')
    }
}
var interact = function() {
    for (var i = 0; i < allOrgs.length; i++) {
        if (allOrgs[i].type == 'producer') {
            //plant, so reproduce w/out interaction
            //note that plants can eb interacted WITH, they just cant INITIATE an interaction
            var plantReproChance = Math.random();
            if (plantReproChance > plantReproSuccess && allOrgs[i].tillRepo < 1 && allOrgs.length < maxOrgs) {
                //plant haz a bebee!
                //make new plant
                newOrg('producer', numOrgs['producer']);
                //increment num plants by 1
                numOrgs['producer'] += 1;
                //set so plant cannot immediately reproduce
                allOrgs[i].tillRepo = 50;
                $('#' + allOrgs[i].id).css({
                    'animation': 'none',
                    '-webkit-animation': 'none'
                });
                $('#' + allOrgs[i].id).css({
                    'animation': 'mateBurst 1s linear',
                    '-webkit-animation': 'mateBurst 1s linear'
                });
            }
        } else {
            //not a plant, so continue with second loop
            for (var j = 0; j < allOrgs.length; j++) {
                /*i = first organism
                j = second organism
                INTERACTION TYPES:
                1) None: P+C. (any others?...)
                2) Predation: C+H, C+O, O+C,H+C
                3) Grazing: H+P, P+H, O+P, P+O. for now, functionally the same as '2'
                4) Mating: H+H, O+O, C+C
                */
                var difX = Math.abs(allOrgs[i].x - allOrgs[j].x);
                var difY = Math.abs(allOrgs[i].y - allOrgs[j].y);
                if (difX < 15 && difY < 15 && allOrgs[i].tillInter < 1 && allOrgs[j].tillInter < 1 && i != j) {
                    //collision
                    if (allOrgs[i].type == 'carnivore' && allOrgs[j].type == 'producer') {
                        //do nothing. carnivore/producer interaction
                    } else if (allOrgs[i].type == allOrgs[j].type) {
                        //m8
                        mateFn(i, j);
                    } else if ((allOrgs[i].type == 'herbivore' && allOrgs[j].type == 'carnivore') || (allOrgs[i].type == 'herbivore' && allOrgs[j].type == 'omnivore') || (allOrgs[i].type == 'omnivore' && allOrgs[j].type == 'carnivore')) {
                        //j preying on i
                        predFn(j, i);
                    } else if ((allOrgs[i].type == 'herbivore' && allOrgs[j].type == 'producer') || (allOrgs[i].type == 'omnivore' && allOrgs[j].type == 'producer') || (allOrgs[i].type == 'carnivore' && allOrgs[j].type == 'herbivore') || (allOrgs[i].type == 'omnivore' && allOrgs[j].type == 'herbivore') || (allOrgs[i].type == 'carnivore' && allOrgs[j].type == 'omnivore')) {
                        //i preying on j
                        predFn(i, j);
                    }
                    if (allOrgs[j].type == 'producer' && (allOrgs[i].type == 'herbivore' || allOrgs[i].type == 'omnivore')) {
                        //plants can be 'eaten' more often
                        allOrgs[i].tillInter = 10;
                        allOrgs[j].tillInter = 10;
                    } else {
                        allOrgs[i].tillInter = 50;
                        allOrgs[j].tillInter = 50;
                    }
                }
            }
        }
        if (allOrgs[i].tillRepo > 0) {
            allOrgs[i].tillRepo--;
        }
        if (allOrgs[i].tillInter > 0) {
            allOrgs[i].tillInter--;
        }
        allOrgs[i].hp--;
        if (allOrgs[i].hp < 1) {
            dieFn(i);
        }
    }
}
var mateFn = function(first, second) {
    if (Math.random() > 0.89 && allOrgs[first].tillRepo < 1 && allOrgs[second].tillRepo < 1 && allOrgs.length < maxOrgs) {
        //so we dont mate every time
        newOrg(allOrgs[first].type, numOrgs[allOrgs[first].type]);
        //increment num this type by 1
        numOrgs[allOrgs[first].type] += 1;
        //set so org cannot immediately reproduce
        allOrgs[first].tillRepo = 50;
        allOrgs[second].tillRepo = 50;
        console.log(allOrgs[first].type + first + ' mated!');
        $('#' + allOrgs[first].id).css({
            'animation': 'none',
            '-webkit-animation': 'none'
        });
        $('#' + allOrgs[first].id).css({
            'animation': 'mateBurst 1s linear',
            '-webkit-animation': 'mateBurst 1s linear'
        });
    }
}
var predFn = function(predator, prey) {
    if (Math.random() > 0.5) {
        //predation! FATALITY!
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
        allOrgs[predator].hp = orgFullHp; //tasty snaks
    }
}

var dieFn = function(toDie) {
    //starvation
    //note that unlike predation and mating, this ALWAYS occurs
    $('#' + allOrgs[toDie].id).remove();
    numOrgs[allOrgs[toDie].type] -= 1;
    allOrgs.splice(toDie, 1); //remove victim from allOrgs list, since it 'died'
}
var graphDraw = function() {
    var total = allOrgs.length
    var percProd = Math.floor((numOrgs['producer'] / total) * 95);
    var percHerb = Math.floor((numOrgs['herbivore'] / total) * 95);
    var percOmni = Math.floor((numOrgs['omnivore'] / total) * 95);
    var percCarn = Math.floor((numOrgs['carnivore'] / total) * 95);
    $('#prodGraph').css('width', percProd + '%');
    $('#herbGraph').css('width', percHerb + '%');
    $('#omniGraph').css('width', percOmni + '%');
    $('#carniGraph').css('width', percCarn + '%');
}

/*TO ADD:
-Do something with hp. Perhaps if herbivore+ has not eaten in x turns, chance for starvation death?
    -can we do an alternative for plants, since they don't 'feed'?
-Handle overpopulations?
if one type has 0 members, clearInterval(t), report ('ecosystem destabilized!'), report num frames?
*/
