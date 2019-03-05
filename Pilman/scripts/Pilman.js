//#region Globale Variables
let GIFfps = 10;

var FontLoaded = false;

let GameName = "pilman";

//
//  variable contenant le nombre de lignes collectées :
//      pilesman.score
//
//  temps ecoulé pour collecter toutes les piles (en milliseconde) :
//      globalEnv.timer
//      
//
//

var ShareOnfb = function(){
    var url= encodeURI("https://www.facebook.com/sharer.php?u=https://www.jerecyclemespiles.com/recyclercestjouer/mediafb/sh.php?jeu=" + GameName + "&score=" + pilesman.score + "&id=" + getId());

    console.log(url);

    var facebookWindow = window.open(
        url,
        '',
        'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=500,width=700');
    if(facebookWindow.focus) { 
        facebookWindow.focus(); 
    }
}

var getId = function(){
    var time = Date.now().toString();
    for (var i = 0; i < 5; i++){
        time += Math.random().toString(36).substring(7);
    }
    return time;
}

//#endregion

//#region _____________Classes

    var MyText = function (text, pos, size = 50, textAlign = "center", color = ' #c7d124') {
        this.text = text;
        this.pos = pos;
        this.size = size;
        this.fillStyle = color;
        this.textAlign = textAlign;
        this.render = function (tFrame) {
            if (!FontLoaded)
                return;
            globalEnv.ctx.textAlign = this.textAlign;
            globalEnv.ctx.fillStyle = this.fillStyle;
            globalEnv.ctx.font = this.size * globalEnv.scale + "px PressStart";
            globalEnv.ctx.fillText(this.text, this.pos.x * globalEnv.canvas.width, this.pos.y * globalEnv.canvas.height);
        }
    }
    
    var Texture = function (url, width, height, nbFrame = 1){
        this.img = new Image();
        this.img.src = url;
        this.width = width;
        this.height = height;
        this.nbFrame = nbFrame;
    }
    
    var Clickable = function (center, size, OnClick, scale = 1) {
        this.center = center;
        this.size = size;
        this.onClick = OnClick;
        this.scale = scale;
        this.isClicked = function (x, y) {
            if (this.onClick == null || this.center == null || this.size == null)
                return false;
            x = x - this.center.x;
            y = y - this.center.y;
            if (x <= this.size.x/2 * this.scale && x >= -this.size.x/2 * this.scale && y <= this.size.y/2 * this.scale && y >= -this.size.y/2 * this.scale) {
                return true;
            }
            return false;
        }
    }
    
    var Sprite = function () {
        this.texture = null;
        this.center = null;
        this.size = null;
        this.clickable = null;
        this.onClick = null;
        this.timer = 0;
        this.curSprite = 0;
        this.scale = 1;
        this.render = function (tFrame) {
            if (this.texture == null || this.center == null || this.size == null) {
                console.log("Error: impossible to render:");
                console.log(this);
                return;
            }
            this.timer += tFrame;
            if (this.timer >= 1000 / GIFfps) {
                this.curSprite = (this.curSprite + 1) % this.texture.nbFrame;
                this.timer = 0;
            }
            globalEnv.ctx.drawImage(
                this.texture.img,
                this.texture.width * this.curSprite,
                0,
                this.texture.width,
                this.texture.height,
                (this.center.x - this.size.x / 2* this.scale) * globalEnv.canvas.width,
                (this.center.y - this.size.y / 2* this.scale) * globalEnv.canvas.height,
                (this.size.x) * globalEnv.canvas.width * this.scale,
                (this.size.y) * globalEnv.canvas.height * this.scale
            )
        }
        this.isClicked = function (x, y) {
            if (this.clickable == null)
                return false;
            return this.clickable.isClicked(x, y);
        }
        this.onClick = function () {
            if (this.clickable == null || this.clickable.onClick == null)
                return;
            this.clickable.onClick();
        }
    }
    
    var Pawn = function () {
        this.sprite = null;
        this.coord = { x: 1, y: 1 };
        this.nextCoord = { x: 1, y: 1 }
        this.spritOffset = { x: 0.5, y: 0.5 };
        this.dir = {};
        this.isOnNextCoord = false;
        this.speed = 6; // square per sec
        this.update = function (timer) {
        
            if (this.coord.x != this.nextCoord.x)
                this.dir.x = (this.nextCoord.x - this.coord.x) / Math.abs(this.nextCoord.x - this.coord.x);
            else 
                this.dir.x = 0;
    
            if (this.coord.y != this.nextCoord.y)
                this.dir.y = (this.nextCoord.y - this.coord.y) / Math.abs(this.nextCoord.y - this.coord.y);
            else 
                this.dir.y = 0;
    
            this.coord.x = this.coord.x + this.dir.x * this.speed * globalEnv.tickLength / 1000;
            this.coord.y = this.coord.y + this.dir.y * this.speed * globalEnv.tickLength / 1000;
    
            if (pilesman.SQRDist(this.coord, this.nextCoord) <= 0.01){
                this.isOnNextCoord = true;
                this.coord.x = Math.round(this.coord.x);
                this.coord.y = Math.round(this.coord.y);
            }
            else{
                this.isOnNextCoord = false;
            }
        }
        this.render = function (tFrame) {
            if (this.sprite == null)
                return;
            this.sprite.center.x = (this.coord.x - 1 + this.spritOffset.x) * pilesman.playGround.size.x / 23 - pilesman.playGround.size.x / 2 + pilesman.playGround.center.x;
            this.sprite.center.y = (this.coord.y + this.spritOffset.y) * pilesman.playGround.size.y / 23 - pilesman.playGround.size.y / 2 + pilesman.playGround.center.y;
            this.sprite.render(tFrame);
            if (this.nextCoord.x == 24){
                    this.sprite.center.x = (this.coord.x - 24 + this.spritOffset.x) * pilesman.playGround.size.x / 23 - pilesman.playGround.size.x / 2 + pilesman.playGround.center.x;
                    this.sprite.center.y = (this.coord.y + this.spritOffset.y) * pilesman.playGround.size.y / 23 - pilesman.playGround.size.y / 2 + pilesman.playGround.center.y;
                    this.sprite.render(tFrame);
            }
            if (this.coord.x == 24){
                this.coord.x = 1;
                this.nextCoord.x = 1;
            }
            if (this.nextCoord.x == 0) {
                this.sprite.center.x = (this.coord.x + 22 + this.spritOffset.x) * pilesman.playGround.size.x / 23 - pilesman.playGround.size.x / 2 + pilesman.playGround.center.x;
                this.sprite.center.y = (this.coord.y + this.spritOffset.y) * pilesman.playGround.size.y / 23 - pilesman.playGround.size.y / 2 + pilesman.playGround.center.y;
                this.sprite.render(tFrame);
            }
            if (this.coord.x == 0)
            {
                this.coord.x = 23;
                this.nextCoord.x = 23;
            }
        }
    }

    var Player = function () {
        this.pawn = null;
        this.nextDir = {x:0, y:0};
        this.dir = {x:0, y:0};
        this.render = function (tFrame) {
            this.pawn.render(tFrame);
        }
        this.update = function (timer) {
            this.pawn.update(timer);
            if (this.pawn.isOnNextCoord){
                if (pilesman.map[this.pawn.coord.y + this.nextDir.y][this.pawn.coord.x + this.nextDir.x] <= 0){
                    this.pawn.nextCoord.x = this.pawn.coord.x + this.nextDir.x;
                    this.pawn.nextCoord.y = this.pawn.coord.y + this.nextDir.y;
                    this.dir = this.nextDir;
                }
                else if (pilesman.map[this.pawn.coord.y + this.dir.y][this.pawn.coord.x + this.dir.x] <= 0){
                    this.pawn.nextCoord.x = this.pawn.coord.x + this.dir.x;
                    this.pawn.nextCoord.y = this.pawn.coord.y + this.dir.y;
                }
                if (pilesman.map[this.pawn.coord.y][this.pawn.coord.x] == -3)
                {
                    pilesman.red.ChangeState(pilesman.red.stateMachine.Scared);
                    pilesman.blue.ChangeState(pilesman.blue.stateMachine.Scared);
                    pilesman.yellow.ChangeState(pilesman.yellow.stateMachine.Scared);
                    pilesman.purple.ChangeState(pilesman.purple.stateMachine.Scared);
                }
                if (pilesman.map[this.pawn.coord.y][this.pawn.coord.x] < 0){
                    // pilesman.sound.eatFruit.pause();
                    // pilesman.sound.eatFruit.currentTime = 0;
                    pilesman.sound.eatFruit.play();
                    pilesman.score += 1;
                    if (pilesman.map[this.pawn.coord.y][this.pawn.coord.x] != -4)
                        pilesman.remainBat -= 1;
                    pilesman.map[this.pawn.coord.y][this.pawn.coord.x] = 0
                }
            }
        }
    }

    var Ghost = function(){
        this.pawn = null;
        this.name = "default";
        this.dir = {x:0,y:0};
        this.curState = null;
        this.stateTick = 0;
        this.target = {x:-1,y:-1};
        this.texture;
        this.homePose = null;
        this.scatterTarget = null;
        this.render = function(tFrame){
            this.pawn.render(tFrame);
        }
    
        this.stateMachine = new function(ghost){
            this.Home = new function(ghost){
                this.duration = 200;
                this.Enter = function(){
                    ghost.stateTick = 0;
                };
                this.Update = function(){
                    ghost.pawn.coord.x = Math.round(ghost.pawn.coord.x);
                    ghost.pawn.coord.y = Math.round(ghost.pawn.coord.y);
                    if (ghost.stateTick >= this.duration)
                        ghost.ChangeState(ghost.stateMachine.Scatter);
                    ghost.stateTick += 1;    
                };
                this.Leave = function(){
                    this.duration = ghost.homeDuration;
                };
                this.name = "home";
            }(ghost);
            this.Scatter = new function(ghost){
                this.duration = 300;
                this.Enter = function(){
                    ghost.stateTick = 0;
                    ghost.target = ghost.scatterTarget;
                };
                this.Update = function(){
                    if (ghost.stateTick >= this.duration){
                        ghost.ChangeState(ghost.stateMachine.Chasing);
                    }
                    ghost.stateTick += 1;
                }
                this.Leave = function(){
                    ghost.stateTick = 0;
                }
                this.name = "scatter";
            }(ghost);
            this.Chasing = new function(ghost){
                this.duration = 600
                this.Enter = function(){
                    ghost.stateTick = 0;
                    ghost.pawn.speed = pilesman.fourmi.pawn.speed - 2;
                };
                this.Update = function(){
                    if (ghost.stateTick >= this.duration){
                        ghost.ChangeState(ghost.stateMachine.Scatter);
                    }
                    ghost.stateTick += 1;
                };
                this.Leave = function(){
                    ghost.stateTick = 0;
                    ghost.pawn.speed = pilesman.fourmi.pawn.speed - 1;
                }
                this.name = "chasing"
            }(ghost);
            this.Dead = new function(ghost){
                this.Enter = function(){
                    ghost.target = ghost.homePose;
                    ghost.pawn.sprite.texture = textureManager.badEyes;
                    ghost.pawn.speed = 10;
                    pilesman.sound.eatFruit.pause();
                    pilesman.sound.eatFruit.currentTime = 0;
                    pilesman.sound.eatGhost.play();
                }
                this.Update = function(){
                    if(ghost.pawn.coord.x == ghost.homePose.x && ghost.pawn.coord.y == ghost.homePose.y)
                        ghost.ChangeState(ghost.stateMachine.Home);
                };
                this.Leave = function(){
                    ghost.pawn.sprite.texture = ghost.texture;
                    ghost.pawn.speed = pilesman.fourmi.pawn.speed - 1;
                    ghost.stateMachine.Home.duration = 200;
                };
                this.name = "dead";
            }(ghost);
            this.Scared = new function(ghost){
                this.duration = 250;
                this.Enter = function(){
                    ghost.pawn.sprite.texture = textureManager.badPanic;
                    ghost.pawn.speed = pilesman.fourmi.pawn.speed - 4;
                    ghost.target = {x:-1,y:-1};
                    ghost.stateTick = 0;
                };
                this.Update = function(){
                    if (ghost.stateTick >= this.duration)
                        ghost.ChangeState(ghost.stateMachine.Scatter);
                    if (ghost.stateTick >= this.duration - 80 && ghost.pawn.sprite.texture != ghost.texture)
                        ghost.pawn.sprite.texture = ghost.texture;
                    if (ghost.stateTick >= this.duration - 70 && ghost.pawn.sprite.texture != textureManager.badPanic)
                        ghost.pawn.sprite.texture = textureManager.badPanic;
                    if (ghost.stateTick >= this.duration - 60 && ghost.pawn.sprite.texture != ghost.texture)
                        ghost.pawn.sprite.texture = ghost.texture;
                    if (ghost.stateTick >= this.duration - 50 && ghost.pawn.sprite.texture != textureManager.badPanic)
                        ghost.pawn.sprite.texture = textureManager.badPanic;
                    if (ghost.stateTick >= this.duration - 40 && ghost.pawn.sprite.texture != ghost.texture)
                        ghost.pawn.sprite.texture = ghost.texture;
                    if (ghost.stateTick >= this.duration - 30 && ghost.pawn.sprite.texture != textureManager.badPanic)
                        ghost.pawn.sprite.texture = textureManager.badPanic;
                    if (ghost.stateTick >= this.duration - 20 && ghost.pawn.sprite.texture != ghost.texture)
                        ghost.pawn.sprite.texture = ghost.texture;
                    if (ghost.stateTick >= this.duration - 10 && ghost.pawn.sprite.texture != textureManager.badPanic)
                        ghost.pawn.sprite.texture = textureManager.badPanic;
    
                    ghost.stateTick += 1;
                };
                this.Leave = function(){
                    ghost.stateTick = 0;
                    ghost.pawn.speed = pilesman.fourmi.pawn.speed - 1;
                    ghost.pawn.sprite.texture = ghost.texture;
                };
                this.name = "scared"
            }(ghost)
    
        }(this);
    
        this.update = function(timer){
            this.pawn.update(timer);
    
            if (this.pawn.isOnNextCoord){
                if (pilesman.nodeMap[this.pawn.coord.y][this.pawn.coord.x] > 0){
                    var avDir = pilesman.GetAvDir(this.pawn.coord, this.dir, this.curState.name);
                    if (avDir.length > 1){
                        if (this.target.x == -1 || this.target.y == -1)
                            this.dir = avDir[ (Math.floor(Math.random() * avDir.length))];
                        else{
                            var closer = {x:0,y:0};
                            for (var i = 0; i < avDir.length; i++){
                                if (i == 0)
                                    closer = avDir[0];
                                else{
                                    if (pilesman.SQRDist(this.target, {x:this.pawn.coord.x + avDir[i].x ,y: this.pawn.coord.y + avDir[i].y }) < pilesman.SQRDist(this.target, {x:this.pawn.coord.x + closer.x ,y: this.pawn.coord.y + closer.y }) ){
                                        closer = avDir[i];
                                    }
                                }
                            }
                            this.dir = closer;
                        }
                    }
                    else
                        this.dir = avDir[0];
                }
                if (pilesman.map[this.pawn.coord.y + this.dir.y][this.pawn.coord.x + this.dir.x] <= 0){
                    this.pawn.nextCoord.x = this.pawn.coord.x + this.dir.x;
                    this.pawn.nextCoord.y = this.pawn.coord.y + this.dir.y;
                }
            }
            if (this.curState && this.curState.Update)
                this.curState.Update();
        }
    
        this.ChangeState = function(newState){
            if (this.curState && this.curState.Leave)
                this.curState.Leave();
            this.curState = newState;
            if (this.curState.Enter)
                this.curState.Enter();
        }
    }

//#endregion

//#region _____________Assets
    var textureManager = {
        mediumSquare: new Texture("assets/images/MediumSquare_776x388.png",776,388),
        buttonRestart: new Texture("assets/images/ButtonRestart_437x66.png",437,66),
        buttonShare: new Texture("assets/images/ButtonShare_233x45.png",233,45),
        buttonHome: new Texture("assets/images/ButtonHome_296x296.png",296,296),
        buttonPause: new Texture("assets/images/ButtonPause_293x293.png",293,293),
        arrowDown: new Texture("assets/images/ArrowDown_283x283.png",283,283),
        arrowUp: new Texture("assets/images/ArrowUp_283x283.png",283,283),
        arrowRight: new Texture("assets/images/ArrowRight_283x283.png",283,283),
        arrowLeft: new Texture("assets/images/ArrowLeft_283x283.png",283,283),
        arrowRot: new Texture("assets/images/ArrowRot_283x302.png",283,302),
        playGround_0: new Texture("assets/images/pilesman/PlayGround_0_467x619.png",467,619),
        playGround_1: new Texture("assets/images/pilesman/PlayGround_1_467x619.png",467,619),
        playGround_2: new Texture("assets/images/pilesman/PlayGround_2_467x619.png",467,619),
        playGround_3: new Texture("assets/images/pilesman/PlayGround_3_467x619.png",467,619),
        antRight: new Texture("assets/images/pilesman/AntRight_57x93.png",57,93,4),
        antLeft: new Texture("assets/images/pilesman/AntLeft_57x93.png",57,93,4),
        cache: new Texture("assets/images/pilesman/Cache_100x100.png",100,100),
        bat_h: new Texture("assets/images/pilesman/Bat_h_72x36.png",72,36),
        bat_v: new Texture("assets/images/pilesman/Bat_v_36x72.png",36,72),
        badBlue: new Texture("assets/images/pilesman/BadBlue_227x227.png",227,227,2),
        badRed: new Texture("assets/images/pilesman/BadRed_227x227.png",227,227,2),
        badPurple: new Texture("assets/images/pilesman/BadPurple_227x227.png",227,227,2),
        badYellow: new Texture("assets/images/pilesman/BadYellow_227x227.png",227,227,2),
        badPanic: new Texture("assets/images/pilesman/BadPanic_227x227.png",227,227,2),
        badEyes: new Texture("assets/images/pilesman/BadEyes_227x227.png",227,227,2),
        extraBat: new Texture("assets/images/pilesman/ExtraBat_34x34.png",34,34),
        fournBathSink : new Texture("assets/images/pilesman/FournitureBathSink_130x156.png",130,156),
        fournBed : new Texture("assets/images/pilesman/FournitureBed_218x119.png",218,119),
        fournBedTable : new Texture("assets/images/pilesman/FournitureBedTable_86x140.png",86,140),
        fournCooker : new Texture("assets/images/pilesman/FournitureCooker_113x183.png",113,183),
        fournFridg : new Texture("assets/images/pilesman/FournitureFridg_136x257.png",136,257),
        fournSofa : new Texture("assets/images/pilesman/FournitureSofa_247x94.png",247,94),
        fournTV : new Texture("assets/images/pilesman/FournitureTV_230x158.png",230,158),
        fournWC : new Texture("assets/images/pilesman/FournitureWC_139x156.png",139,156),
        recyclingLogo : new Texture("assets/images/pilesman/RecyclingLogo_283x262.png",283,262),
        heart : new Texture("assets/images/pilesman/Live_48x43.png",48,43),
        debug: new Texture("assets/images/DebugShape_100x100.png",100,100)
    };
//#endregion

//#region _____________Pilesman______________
    var Pilesman =function(){

        //#region ______Variables
            this.curState = null;
            this.score = 0;
            this.remainBat = 0;
            this.level = 0;
            this.map = [];
            this.curPos = {x:0,y:0};
            this.fromPause = false;
            this.playGround = [];
            this.retry = false;
            this.readyTimer;
            this.nodeMap = [[00,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,00],
                    [00,-1,01,00,00,00,00,02,00,00,00,00,02,00,00,00,00,02,00,00,00,00,01,-1,00],
                    [00,-1,00,-1,-1,-1,-1,00,-1,-1,-1,-1,00,-1,-1,-1,-1,00,-1,-1,-1,-1,00,-1,00],
                    [00,-1,00,-1,01,00,00,02,00,00,01,-1,00,-1,01,00,00,02,00,00,01,-1,00,-1,00],
                    [00,-1,00,-1,00,-1,-1,-1,-1,-1,00,-1,00,-1,00,-1,-1,-1,-1,-1,00,-1,00,-1,00],
                    [00,-1,01,00,02,00,01,-1,01,00,03,00,02,00,03,00,01,-1,01,00,02,00,01,-1,00],
                    [00,-1,-1,-1,-1,-1,00,-1,00,-1,00,-1,-1,-1,00,-1,00,-1,00,-1,-1,-1,-1,-1,00],
                    [00,-1,01,00,01,-1,02,00,02,-1,00,-1,00,-1,00,-1,02,00,02,-1,01,00,01,-1,00],
                    [00,-1,00,-1,00,-1,00,-1,00,-1,00,-1,-1,-1,00,-1,00,-1,00,-1,00,-1,00,-1,00],
                    [00,-1,00,-1,02,00,01,-1,01,02,02,00,07,00,02,02,01,-1,01,00,02,-1,00,-1,00],
                    [-1,-1,00,-1,00,-1,-1,-1,-1,00,-1,-1,06,-1,-1,00,-1,-1,-1,-1,00,-1,00,-1,-1],
                    [00,00,03,00,02,00,00,02,00,02,-1,05,08,04,-1,02,00,02,00,00,02,00,03,00,00],
                    [-1,-1,00,-1,-1,-1,-1,00,-1,00,-1,-1,-1,-1,-1,00,-1,00,-1,-1,-1,-1,00,-1,-1],
                    [00,-1,00,-1,01,00,01,01,-1,02,00,00,00,00,00,02,-1,01,02,00,01,-1,00,-1,00],
                    [00,-1,00,-1,00,-1,00,-1,-1,00,-1,-1,-1,-1,-1,00,-1,-1,00,-1,00,-1,00,-1,00],
                    [00,-1,00,-1,00,-1,01,00,02,02,00,01,-1,01,00,02,02,00,01,-1,00,-1,00,-1,00],
                    [00,-1,02,00,02,-1,-1,-1,00,-1,-1,02,00,02,-1,-1,00,-1,-1,-1,02,00,02,-1,00],
                    [00,-1,00,-1,00,-1,01,00,02,00,00,01,-1,01,00,00,02,00,01,-1,00,-1,00,-1,00],
                    [00,-1,00,-1,00,-1,00,-1,-1,-1,-1,00,-1,00,-1,-1,-1,-1,00,-1,00,-1,00,-1,00],
                    [00,-1,00,-1,01,00,02,01,-1,01,00,01,-1,01,00,01,-1,01,02,00,01,-1,00,-1,00],
                    [00,-1,00,-1,-1,-1,-1,02,00,02,-1,-1,-1,-1,-1,02,00,02,-1,-1,-1,-1,00,-1,00],
                    [00,-1,01,00,00,00,00,01,-1,01,00,00,00,00,00,01,-1,01,00,00,00,00,01,-1,00],
                    [00,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,00]];
        //#endregion

        //#region ______Sprites

            //#region playground
                this.playgroundTextures = [
                    textureManager.playGround_0,
                    textureManager.playGround_1,
                    textureManager.playGround_2,
                    textureManager.playGround_3];

                this.playGround = new Sprite();
                this.playGround.texture = textureManager.playGround_2;
                this.playGround.center = {x:0.47,y:0.5};
                this.playGround.size = {x:textureManager.playGround_0.width/1000,y:textureManager.playGround_0.height/1000*globalEnv.gameRatio};
            
                this.sound = {};
                this.sound.end = new Audio("assets/sounds/end.wav");
                this.sound.eatFruit = new Audio("assets/sounds/pacman_eatfruit.mp3");
                this.sound.eatGhost = new Audio("assets/sounds/pacman_eatghost.wav");
                this.sound.death = new Audio("assets/sounds/death.mp3");
            
            //#endregion

            //#region fournitures
            
            this.fournBathSink = new Sprite();
            this.fournBathSink.texture = textureManager.fournBathSink;
            this.fournBathSink.center = {x:0.2,y:0.8};
            this.fournBathSink.size = {x:0.05,y:0.05};
            
            this.fournWC = new Sprite();
            this.fournWC.texture = textureManager.fournWC;
            this.fournWC.center = {x:0.2,y:0.8};
            this.fournWC.size = {x:0.05,y:0.05};
            
            this.fournBed = new Sprite();
            this.fournBed.texture = textureManager.fournBed;
            this.fournBed.center = {x:0.2,y:0.8};
            this.fournBed.size = {x:0.05,y:0.05};
            
            this.fournBedTable = new Sprite();
            this.fournBedTable.texture = textureManager.fournBedTable;
            this.fournBedTable.center = {x:0.2,y:0.8};
            this.fournBedTable.size = {x:0.05,y:0.05};
            
            this.fournCooker = new Sprite();
            this.fournCooker.texture = textureManager.fournCooker;
            this.fournCooker.center = {x:0.8,y:0.35};
            this.fournCooker.size = {x:textureManager.fournCooker.width/1000,y:textureManager.fournCooker.height/1000 * globalEnv.gameRatio};
            this.fournCooker.scale = 0.9;
            
            this.fournFridg = new Sprite();
            this.fournFridg.texture = textureManager.fournFridg;
            this.fournFridg.center = {x:0.2,y:0.8};
            this.fournFridg.size = {x:0.05,y:0.05};
            
            this.fournSofa = new Sprite();
            this.fournSofa.texture = textureManager.fournSofa;
            this.fournSofa.center = {x:0.12,y:0.72};
            this.fournSofa.size = {x:textureManager.fournSofa.width/1000,y:textureManager.fournSofa.height/1000 * globalEnv.gameRatio};
            this.fournSofa.scale = 0.9;
            
            this.fournTV = new Sprite();
            this.fournTV.texture = textureManager.fournTV;
            this.fournTV.center = {x:0.2,y:0.8};
            this.fournTV.size = {x:0.05,y:0.05};

            // this.decor = [
            //     [this.fournWC, this.fournBathSink],
            //     [this.fournCooker, this.fournFridg],
            //     [this.fournBed, this.fournBedTable],
            //     [this.fournSofa, this.fournTV],
            // ];
            //#endregion
            
            //#region map
                this.cache_0 = new Sprite();
                this.cache_0.texture = textureManager.cache;
                this.cache_0.center = {
                    x: this.playGround.center.x + this.playGround.size.x / 2 + this.playGround.size.x/23 * 0.85,
                    y: this.playGround.center.y
                };
                this.cache_0.size = {
                    x: this.playGround.size.x/23 * 2,
                    y: this.playGround.size.y/23 * 2
                };

                this.cache_1 = new Sprite();
                this.cache_1.texture = textureManager.cache;
                this.cache_1.center = {
                    x: this.playGround.center.x - this.playGround.size.x / 2 - this.playGround.size.x/23 * 0.85,
                    y: this.playGround.center.y
                };
                this.cache_1.size = {
                    x: this.playGround.size.x/23 * 2,
                    y: this.playGround.size.y/23 * 2
                };

                this.bat_h = new Sprite();
                this.bat_h.texture = textureManager.bat_h;
                this.bat_h.center = {x:1,y:1};
                this.bat_h.size = {x:textureManager.bat_h.width/1000,y:textureManager.bat_h.height/1000*globalEnv.gameRatio};
                this.bat_h.scale = 0.2;
                
                this.bat_v = new Sprite();
                this.bat_v.texture = textureManager.bat_v;
                this.bat_v.center = {x:1,y:1};
                this.bat_v.size = {x:textureManager.bat_v.width/1000,y:textureManager.bat_v.height/1000*globalEnv.gameRatio};
                this.bat_v.scale = 0.2;
                
                this.recyLogo = new Sprite();
                this.recyLogo.texture = textureManager.recyclingLogo;
                this.recyLogo.center = {x:1,y:1};
                this.recyLogo.size = {x:textureManager.recyclingLogo.width/1000,y:textureManager.recyclingLogo.height/1000*globalEnv.gameRatio};
                this.recyLogo.scale = 0.08;

                this.extraBat = new Sprite();
                this.extraBat.texture = textureManager.extraBat;
                this.extraBat.center = {x:1,y:1};
                this.extraBat.size = {x:textureManager.extraBat.width/1000,y:textureManager.extraBat.height/1000*globalEnv.gameRatio};
                this.extraBat.scale = 0.8;

                this.mapRender = {}
                this.mapRender.render = function(tFrame){
                    for (var i = 1; i < 24; i++) {
                        for (var j = 0; j < 23; j++) {
                            if (pilesman.map[j][i] == -1) {
                                pilesman.bat_h.center.x = (i - 1 + 0.5) * pilesman.playGround.size.x/23 - pilesman.playGround.size.x / 2 + pilesman.playGround.center.x;
                                pilesman.bat_h.center.y = (j + 0.5) * pilesman.playGround.size.y/23 - pilesman.playGround.size.y / 2 + pilesman.playGround.center.y;
                                pilesman.bat_h.render(tFrame);
                            }
                            else if (pilesman.map[j][i] == -2) {
                                pilesman.bat_v.center.x = (i - 1 + 0.5) * pilesman.playGround.size.x/23 - pilesman.playGround.size.x / 2 + pilesman.playGround.center.x;
                                pilesman.bat_v.center.y = (j + 0.5) * pilesman.playGround.size.y/23 - pilesman.playGround.size.y / 2 + pilesman.playGround.center.y;
                                pilesman.bat_v.render(tFrame);
                            }
                            else if (pilesman.map[j][i] == -3) {
                                pilesman.recyLogo.center.x = (i - 1 + 0.5) * pilesman.playGround.size.x/23 - pilesman.playGround.size.x / 2 + pilesman.playGround.center.x;
                                pilesman.recyLogo.center.y = (j + 0.5) * pilesman.playGround.size.y/23 - pilesman.playGround.size.y / 2 + pilesman.playGround.center.y;
                                pilesman.recyLogo.render(tFrame);
                            }
                            else if (pilesman.map[j][i] == -4) {
                                pilesman.extraBat.center.x = (i - 1 + 0.5) * pilesman.playGround.size.x/23 - pilesman.playGround.size.x / 2 + pilesman.playGround.center.x;
                                pilesman.extraBat.center.y = (j + 0.5) * pilesman.playGround.size.y/23 - pilesman.playGround.size.y / 2 + pilesman.playGround.center.y;
                                pilesman.extraBat.render(tFrame);
                            }
                        }
                    }
                }
            //#endregion  

            //#region pawn
                this.fourmi = new Player();
                this.fourmi.pawn = new Pawn();
                this.fourmi.pawn.sprite = new Sprite();
                this.fourmi.pawn.sprite.texture = textureManager.antRight;
                this.fourmi.pawn.sprite.center = {x:1,y:1};
                this.fourmi.pawn.sprite.size = {x: this.playGround.size.x / 23 * 1.2, y: this.playGround.size.y / 23 * 0.8* globalEnv.gameRatio };
                this.fourmi.pawn.spritOffset = {x:0.65, y:0.5};

                this.blue = new Ghost();
                this.blue.scatterTarget = {x:21,y:20};
                this.blue.texture = textureManager.badBlue;
                this.blue.homeDuration = 50;
                this.blue.stateMachine.Chasing.Update = function(){
                    pilesman.blue.target = pilesman.fourmi.pawn.coord;
                    if (pilesman.blue.stateTick >= pilesman.blue.stateMachine.Chasing.duration){
                        pilesman.blue.ChangeState(pilesman.blue.stateMachine.Scatter);
                    }
                    pilesman.blue.stateTick += 1;
                };
                this.blue.name = "Blue";
                this.blue.pawn = new Pawn();
                this.blue.pawn.sprite = new Sprite();
                this.blue.pawn.sprite.texture = textureManager.badBlue;
                this.blue.pawn.sprite.center = {x:2,y:1};
                this.blue.pawn.sprite.size = { x: this.playGround.size.x/23, y: this.playGround.size.x/23 * globalEnv.gameRatio};
                this.blue.pawn.coord = {x:2,y:1};
                this.blue.pawn.speed = 5;

                this.red = new Ghost();
                this.red.scatterTarget = {x:1,y:20};
                this.red.texture = textureManager.badRed;
                this.red.homeDuration = 100;
                this.red.stateMachine.Chasing.Update = function(){
                    pilesman.red.target.x = pilesman.fourmi.pawn.coord.x + 3 * pilesman.fourmi.pawn.dir.x;
                    pilesman.red.target.y = pilesman.fourmi.pawn.coord.y + 3 * pilesman.fourmi.pawn.dir.y;
                    if (pilesman.red.stateTick >= pilesman.red.stateMachine.Chasing.duration){
                        pilesman.red.ChangeState(pilesman.red.stateMachine.Scatter);
                    }
                    pilesman.red.stateTick += 1;
                };
                this.red.name = "Red";
                this.red.pawn = new Pawn();
                this.red.pawn.sprite = new Sprite();
                this.red.pawn.sprite.texture = textureManager.badRed;
                this.red.pawn.sprite.center = {x:2,y:1};
                this.red.pawn.sprite.size = { x: this.playGround.size.x/23, y: this.playGround.size.x/23 * globalEnv.gameRatio};
                this.red.pawn.coord = {x:22,y:1};
                this.red.pawn.speed = 5;

                this.yellow = new Ghost();
                this.yellow.scatterTarget = {x:20,y:1};
                this.yellow.homeDuration = 150;
                this.yellow.stateMachine.Chasing.Update = function(){
                    pilesman.yellow.target = {x:-1, y:-1};
                    if (pilesman.yellow.stateTick >= pilesman.yellow.stateMachine.Chasing.duration){
                        pilesman.yellow.ChangeState(pilesman.yellow.stateMachine.Scatter);
                    }
                    pilesman.yellow.stateTick += 1;
                };
                this.yellow.texture = textureManager.badYellow;
                this.yellow.name = "Yellow"
                this.yellow.pawn = new Pawn();
                this.yellow.pawn.sprite = new Sprite();
                this.yellow.pawn.sprite.texture = textureManager.badYellow;
                this.yellow.pawn.sprite.center = {x:2,y:1};
                this.yellow.pawn.sprite.size = { x: this.playGround.size.x/23, y: this.playGround.size.x/23 * globalEnv.gameRatio};
                this.yellow.pawn.coord = {x:2,y:21};
                this.yellow.pawn.speed = 5;

                this.purple = new Ghost();
                this.purple.scatterTarget = {x:1,y:1};
                this.purple.homeDuration = 200;
                this.purple.texture = textureManager.badPurple;
                this.purple.stateMachine.Chasing.Update = function(){
                    pilesman.purple.target.x = 2 * pilesman.fourmi.pawn.coord.x - (pilesman.red.pawn.coord.x + pilesman.blue.pawn.coord.x)/2;
                    pilesman.purple.target.y = 2 * pilesman.fourmi.pawn.coord.y - (pilesman.red.pawn.coord.y + pilesman.blue.pawn.coord.y)/2;
                    if (pilesman.purple.stateTick >= pilesman.purple.stateMachine.Chasing.duration){
                        pilesman.purple.ChangeState(pilesman.purple.stateMachine.Scatter);
                    }
                    pilesman.purple.stateTick += 1;
                };
                this.purple.name = "Purple";
                this.purple.pawn = new Pawn();
                this.purple.pawn.sprite = new Sprite();
                this.purple.pawn.sprite.texture = textureManager.badPurple;
                this.purple.pawn.sprite.center = {x:2,y:1};
                this.purple.pawn.sprite.size = { x: this.playGround.size.x/23, y: this.playGround.size.x/23 * globalEnv.gameRatio};
                this.purple.pawn.coord = {x:22,y:21};
                this.purple.pawn.speed = 5;
            //#endregion
            
            //#region text
                this.textLevel = new MyText(" ", {x:0.47,y:0.42},40,"center");
                this.textReady = new MyText("Ready !", {x:0.47,y:0.48},40,"center");
                this.textReadyValue = new MyText("", {x:0.47,y:0.55},40,"center");

                this.maison = new MyText("Maison", {x:0.47,y:0.08},25,"center");

                this.textScore = new MyText("Score", {x:0.30,y:0.06},20,"center");
                this.valueScore = new MyText("", {x:0.3,y:0.09},17,"center");

                this.textLives = new MyText("Vies",{x:0.64,y:0.06},20,"center")

                this.heart_0 = new Sprite();
                this.heart_0.texture = textureManager.heart;
                this.heart_0.size = {x:textureManager.heart.width /1000, y:textureManager.heart.height / 1000 * globalEnv.gameRatio};
                this.heart_0.center = {x:0.665,y:0.08};
                this.heart_0.scale = 0.4;

                this.heart_1 = new Sprite();
                this.heart_1.texture = textureManager.heart;
                this.heart_1.size = {x:textureManager.heart.width /1000, y:textureManager.heart.height / 1000 * globalEnv.gameRatio};
                this.heart_1.center = {x:0.64,y:0.08};
                this.heart_1.scale = 0.4;

                this.heart_2 = new Sprite();
                this.heart_2.texture = textureManager.heart;
                this.heart_2.size = {x:textureManager.heart.width /1000, y:textureManager.heart.height / 1000 * globalEnv.gameRatio};
                this.heart_2.center = {x:0.615,y:0.08};
                this.heart_2.scale = 0.4;
                
                this.heartCache = new Sprite();
                this.heartCache.texture = textureManager.cache;
                this.heartCache.size = {x:textureManager.heart.width /1000, y:textureManager.heart.height / 1000 * globalEnv.gameRatio};
                this.heartCache.center = {x:0.665,y:0.08};
                this.heartCache.scale = 0.5;

                this.hearts = [
                    this.heart_0,
                    this.heart_1,
                    this.heart_2
                ];

                this.cacheReady =  new Sprite();
                this.cacheReady.texture = textureManager.cache;
                this.cacheReady.center = {x:0.47,y:0.5};
                this.cacheReady.size = {x:0.4,y:0.3};

                this.textScore_f = new MyText("SCORE",{x:0.5,y:0.25},40,"center");
                this.textScore0_f = new MyText("Piles Recyclées",{x:0.5,y:0.35},30,"center");
                this.valueScore_f = new MyText("",{x:0.5,y:0.4},30,"center");
                this.textScore1_f = new MyText("Temps",{x:0.5,y:0.47},30,"center");
                this.valueTemps_f = new MyText("",{x:0.5,y:0.52},30,"center");

            //#endregion

        //#endregion

        //#region ______StateMachine
        this.stateMachine = {
            NewGame: {
                Enter: function(){
                    globalEnv.objectToRender = [];
                    inputManager.ClearClick();
                    inputManager.ClearKey();
                    pilesman.map = [[00, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 00],
                                [00, 01, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 01, 00],
                                [00, 01, -2, 01, 01, 01, 01, -2, 01, 01, 01, 01, -2, 01, 01, 01, 01, -2, 01, 01, 01, 01, -2, 01, 00],
                                [00, 01, -2, 01, -1, -1, -1, -1, -1, -1, -1, 01, -2, 01, -1, -1, -1, -1, -1, -1, -1, 01, -2, 01, 00],
                                [00, 01, -2, 01, -2, 01, 01, 01, 01, 01, -2, 01, -2, 01, -2, 01, 01, 01, 01, 01, -2, 01, -2, 01, 00],
                                [00, 01, -1, -1, -1, -1, -1, 01, -1, -1, -1, -1, -1, -1, -1, -1, -1, 01, -1, -1, -1, -1, -1, 01, 00],
                                [00, 01, 01, 01, 01, 01, -2, 01, -2, 01, -2, 01, 01, 01, -2, 01, -2, 01, -2, 01, 01, 01, 01, 01, 00],
                                [00, 01, -1, -1, -1, 01, -1, -1, -1, 01, -2, 01, 00, 01, -2, 01, -1, -1, -1, 01, -1, -1, -1, 01, 00],
                                [00, 01, -2, 01, -2, 01, -2, 01, -2, 01, -2, 01, 01, 01, -2, 01, -2, 01, -2, 01, -2, 01, -2, 01, 00],
                                [00, 01, -2, 01, -1, -1, -1, 01, -1, -1, -1, -1, -1, -1, -1, -1, -1, 01, -1, -1, -1, 01, -2, 01, 00],
                                [01, 01, -2, 01, -2, 01, 01, 01, 01, -2, 01, 01, 00, 01, 01, -2, 01, 01, 01, 01, -2, 01, -2, 01, 01],
                                [00, 00, -1, -1, -1, -1, -1, -1, -1, -1, 01, 00, 00, 00, 01, -1, -1, -1, -1, -1, -1, -1, -1, 00, 00],
                                [01, 01, -2, 01, 01, 01, 01, -2, 01, -2, 01, 01, 01, 01, 01, -2, 01, -2, 01, 01, 01, 01, -2, 01, 01],
                                [00, 01, -2, 01, -1, -1, -1, -1, 01, -1, -1, -1, -1, -1, -1, -1, 01, -1, -1, -1, -1, 01, -2, 01, 00],
                                [00, 01, -2, 01, -2, 01, -2, 01, 01, -2, 01, 01, 01, 01, 01, -2, 01, 01, -2, 01, -2, 01, -2, 01, 00],
                                [00, 01, -2, 01, -2, 01, -1, -1, -1, -1, -1, -1, 01, -1, -1, -1, -1, -1, -1, 01, -2, 01, -2, 01, 00],
                                [00, 01, -1, -1, -1, 01, 01, 01, -2, 01, 01, -1, -1, -1, 01, 01, -2, 01, 01, 01, -1, -1, -1, 01, 00],
                                [00, 01, -2, 01, -2, 01, -1, -1, -1, -1, -1, -1, 01, -1, -1, -1, -1, -1, -1, 01, -2, 01, -2, 01, 00],
                                [00, 01, -2, 01, -2, 01, -2, 01, 01, 01, 01, -2, 01, -1, 01, 01, 01, 01, -2, 01, -2, 01, -2, 01, 00],
                                [00, 01, -2, 01, -1, -1, -1, -1, 01, -1, -1, -1, 01, -1, -1, -1, 01, -1, -1, -1, -1, 01, -2, 01, 00],
                                [00, 01, -2, 01, 01, 01, 01, -1, -1, -1, 01, 01, 01, 01, 01, -1, -1, -1, 01, 01, 01, 01, -2, 01, 00],
                                [00, 01, -1, -1, -1, -1, -1, -1, 01, -1, -1, -1, -1, -1, -1, -1, 01, -1, -1, -1, -1, -1, -1, 01, 00],
                                [00, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 00]];
                    // pilesman.level = 0;
                    globalEnv.arrowLeft.center = {x:0.75,y:0.7};
                    globalEnv.arrowRight.center = {x:0.95,y:0.7};
                    globalEnv.buttonHome.center = {x:0.15,y:0.12};
                    globalEnv.buttonPause.center = {x:0.85,y:0.12};
                    pilesman.score = 0;
                    pilesman.lives = 3;
                    globalEnv.timer = 0;
                },
                Update: function(){
                    ChangeState(pilesman.stateMachine.Ready);
                },
                name: "game: PilesMan, state: NewGmae"
            },
            Ready: {
                Enter: function(){
                    globalEnv.objectToRender = [];
                    inputManager.ClearClick();
                    inputManager.ClearKey();
                    if (pilesman.retry == false){
                        pilesman.map = [[00, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 00],
                                    [00, 01, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 01, 00],
                                    [00, 01, -2, 01, 01, 01, 01, -2, 01, 01, 01, 01, -2, 01, 01, 01, 01, -2, 01, 01, 01, 01, -2, 01, 00],
                                    [00, 01, -2, 01, -1, -1, -1, -1, -1, -1, -1, 01, -2, 01, -1, -1, -1, -1, -1, -1, -1, 01, -2, 01, 00],
                                    [00, 01, -2, 01, -2, 01, 01, 01, 01, 01, -2, 01, -2, 01, -2, 01, 01, 01, 01, 01, -2, 01, -2, 01, 00],
                                    [00, 01, -1, -1, -1, -3, -1, 01, -1, -1, -1, -1, -1, -1, -1, -1, -1, 01, -1, -3, -1, -1, -1, 01, 00],
                                    [00, 01, 01, 01, 01, 01, -2, 01, -2, 01, -2, 01, 01, 01, -2, 01, -2, 01, -2, 01, 01, 01, 01, 01, 00],
                                    [00, 01, -1, -1, -1, 01, -1, -1, -1, 01, -2, 01, 00, 01, -2, 01, -1, -1, -1, 01, -1, -1, -1, 01, 00],
                                    [00, 01, -2, 01, -2, 01, -2, 01, -2, 01, -2, 01, 01, 01, -2, 01, -2, 01, -2, 01, -2, 01, -2, 01, 00],
                                    [00, 01, -2, 01, -1, -1, -1, 01, -1, -1, -1, -1, -1, -1, -1, -1, -1, 01, -1, -1, -1, 01, -2, 01, 00],
                                    [01, 01, -2, 01, -2, 01, 01, 01, 01, -2, 01, 01, 00, 01, 01, -2, 01, 01, 01, 01, -2, 01, -2, 01, 01],
                                    [00, 00, -1, -1, -1, -1, -1, -1, -1, -1, 01, 00, 00, 00, 01, -1, -1, -1, -1, -1, -1, -1, -1, 00, 00],
                                    [01, 01, -2, 01, 01, 01, 01, -2, 01, -2, 01, 01, 01, 01, 01, -2, 01, -2, 01, 01, 01, 01, -2, 01, 01],
                                    [00, 01, -2, 01, -1, -1, -1, -1, 01, -1, -1, -1, -1, -1, -1, -1, 01, -1, -1, -1, -1, 01, -2, 01, 00],
                                    [00, 01, -2, 01, -2, 01, -2, 01, 01, -2, 01, 01, 01, 01, 01, -2, 01, 01, -2, 01, -2, 01, -2, 01, 00],
                                    [00, 01, -2, 01, -2, 01, -1, -1, -1, -1, -1, -1, 01, -1, -1, -1, -1, -1, -1, 01, -2, 01, -2, 01, 00],
                                    [00, 01, -1, -1, -1, 01, 01, 01, -2, 01, 01, -1, -1, -1, 01, 01, -2, 01, 01, 01, -1, -1, -1, 01, 00],
                                    [00, 01, -2, 01, -2, 01, -1, -1, -1, -1, -1, -1, 01, -1, -1, -1, -1, -1, -1, 01, -2, 01, -2, 01, 00],
                                    [00, 01, -2, 01, -2, 01, -2, 01, 01, 01, 01, -2, 01, -1, 01, 01, 01, 01, -2, 01, -2, 01, -2, 01, 00],
                                    [00, 01, -2, 01, -1, -3, -1, -1, 01, -1, -1, -1, 01, -1, -1, -1, 01, -1, -1, -3, -1, 01, -2, 01, 00],
                                    [00, 01, -2, 01, 01, 01, 01, -1, -1, -1, 01, 01, 01, 01, 01, -1, -1, -1, 01, 01, 01, 01, -2, 01, 00],
                                    [00, 01, -1, -1, -1, -1, -1, -1, 01, -1, -1, -1, -1, -1, -1, -1, 01, -1, -1, -1, -1, -1, -1, 01, 00],
                                    [00, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 01, 00]];
                        pilesman.remainBat = 263;
                    }                    
                    pilesman.retry = false;

                    pilesman.fourmi.pawn.coord = {x:3,y:11};
                    pilesman.fourmi.nextDir = {x:0,y:0};
                    pilesman.fourmi.pawn.sprite.texture = textureManager.antRight;
                    pilesman.fourmi.pawn.spritOffset = { x: 0.65, y: 0.5 };
                    pilesman.fourmi.pawn.nextCoord = {x:3,y:11};
                    pilesman.fourmi.pawn.sprite.texture = textureManager.antRight;

                    pilesman.blue.pawn.coord = {x:12,y:10};
                    pilesman.blue.pawn.nextCoord = {x:12,y:10};
                    pilesman.blue.homePose = {x:12,y:10};
                    pilesman.blue.ChangeState(pilesman.blue.stateMachine.Home);
                    pilesman.blue.stateMachine.Home.duration = pilesman.blue.homeDuration;
                    pilesman.red.pawn.coord = {x:12,y:11};
                    pilesman.red.pawn.nextCoord = {x:12,y:11};
                    pilesman.red.homePose = {x:12,y:11};
                    pilesman.red.ChangeState(pilesman.red.stateMachine.Home);
                    pilesman.red.stateMachine.Home.duration = pilesman.red.homeDuration;
                    pilesman.yellow.pawn.coord = {x:11,y:11};
                    pilesman.yellow.pawn.nextCoord = {x:11,y:11};
                    pilesman.yellow.homePose = {x:11,y:11};
                    pilesman.yellow.ChangeState(pilesman.yellow.stateMachine.Home);
                    pilesman.yellow.stateMachine.Home.duration = pilesman.yellow.homeDuration;
                    pilesman.purple.pawn.coord = {x:13,y:11};
                    pilesman.purple.pawn.nextCoord = {x:13,y:11};
                    pilesman.purple.homePose = {x:13,y:11};
                    pilesman.purple.ChangeState(pilesman.purple.stateMachine.Home);
                    pilesman.purple.stateMachine.Home.duration = pilesman.purple.homeDuration;

                    // pilesman.playGround.texture = pilesman.playgroundTextures[pilesman.level];

                    globalEnv.objectToRender.push(pilesman.playGround);

                    // globalEnv.objectToRender.push(pilesman.decor[pilesman.level][0]);
                    // globalEnv.objectToRender.push(pilesman.decor[pilesman.level][1]);

                    globalEnv.objectToRender.push(pilesman.mapRender);
                    globalEnv.objectToRender.push(pilesman.fourmi);
                    globalEnv.objectToRender.push(pilesman.blue);
                    globalEnv.objectToRender.push(pilesman.yellow);
                    globalEnv.objectToRender.push(pilesman.red);
                    globalEnv.objectToRender.push(pilesman.purple);
                    globalEnv.objectToRender.push(pilesman.cacheReady);
                    globalEnv.objectToRender.push(globalEnv.corepile);

                    globalEnv.objectToRender.push(globalEnv.arrowDown);
                    globalEnv.objectToRender.push(globalEnv.arrowRight);
                    globalEnv.objectToRender.push(globalEnv.arrowLeft);
                    globalEnv.objectToRender.push(globalEnv.arrowUp);

                    pilesman.valueScore.text = pilesman.score;
                    globalEnv.objectToRender.push(pilesman.textScore);
                    globalEnv.objectToRender.push(pilesman.valueScore);

                    globalEnv.objectToRender.push(pilesman.maison);
                    globalEnv.objectToRender.push(pilesman.textLives);
                    for (var i = 0; i < pilesman.lives; i++){
                        globalEnv.objectToRender.push(pilesman.hearts[i]);
                    }
                    globalEnv.objectToRender.push(pilesman.fournSofa);
                    globalEnv.objectToRender.push(pilesman.fournCooker);

                    globalEnv.objectToRender.push(globalEnv.buttonHome);
                    globalEnv.objectToRender.push(globalEnv.buttonPause);
                    inputManager.clickDown.push(globalEnv.buttonHome);
                    // pilesman.textLevel.text = "Level " + (pilesman.level + 1);
                    // globalEnv.objectToRender.push(pilesman.textLevel);
                    globalEnv.objectToRender.push(pilesman.textReady);
                    pilesman.textReadyValue.text = "3";
                    globalEnv.objectToRender.push(pilesman.textReadyValue)
                    pilesman.readyTimer = 0;
                },
                Update: function(timer){
                    pilesman.readyTimer += globalEnv.tickLength;
                    pilesman.textReadyValue.text = (2 - Math.floor(pilesman.readyTimer / 1000))
                    if (pilesman.readyTimer >= (1000 * 2))
                        ChangeState(pilesman.stateMachine.Play)
                },
                name: "game: PilesMan, state: Ready"
            },
            Play: {
                Enter: function(){
                    inputManager.ClearKey();
                    inputManager.ClearClick();
                    globalEnv.objectToRender = [];
                    // pilesman.playGround.texture = pilesman.playgroundTextures[pilesman.level];
                    globalEnv.objectToRender.push(pilesman.playGround);

                    globalEnv.objectToRender.push(pilesman.maison);
                    globalEnv.objectToRender.push(pilesman.fournSofa);
                    globalEnv.objectToRender.push(pilesman.fournCooker);

                    // globalEnv.objectToRender.push(pilesman.decor[pilesman.level][0]);
                    // globalEnv.objectToRender.push(pilesman.decor[pilesman.level][1]);

                    globalEnv.objectToRender.push(pilesman.mapRender);
                    globalEnv.objectToRender.push(pilesman.fourmi);
                    globalEnv.objectToRender.push(pilesman.blue);
                    globalEnv.objectToRender.push(pilesman.yellow);
                    globalEnv.objectToRender.push(pilesman.red);
                    globalEnv.objectToRender.push(pilesman.purple);
                    globalEnv.objectToRender.push(pilesman.cache_0);
                    globalEnv.objectToRender.push(pilesman.cache_1);
                    globalEnv.objectToRender.push(globalEnv.corepile);

                    pilesman.valueScore.text = pilesman.score;
                    globalEnv.objectToRender.push(pilesman.textScore);
                    globalEnv.objectToRender.push(pilesman.valueScore);
                    globalEnv.objectToRender.push(pilesman.textLives);
                    for (var i = 0; i < pilesman.lives; i++){
                        globalEnv.objectToRender.push(pilesman.hearts[i]);
                    }

                    globalEnv.objectToRender.push(globalEnv.buttonHome);
                    globalEnv.objectToRender.push(globalEnv.buttonPause);
                    globalEnv.buttonPause.clickable.onClick = function(){ChangeState(pilesman.stateMachine.Pause)};
                    inputManager.clickDown.push(globalEnv.buttonHome);
                    inputManager.clickDown.push(globalEnv.buttonPause);
                    inputManager.keyDown[" "] = function(){ChangeState(pilesman.stateMachine.Pause);};

                    inputManager.keyDown["ArrowUp"] = function(){pilesman.fourmi.nextDir = {x:0,y:-1}};
                    inputManager.keyDown["ArrowDown"] = function(){pilesman.fourmi.nextDir = {x:0,y:1}};
                    inputManager.keyDown["ArrowLeft"] = function(){
                        pilesman.fourmi.nextDir = {x:-1,y:0};
                        pilesman.fourmi.pawn.sprite.texture = textureManager.antLeft
                        pilesman.fourmi.pawn.spritOffset = { x: 0.35, y: 0.5 };};
                    inputManager.keyDown["ArrowRight"] = function(){
                        pilesman.fourmi.nextDir = {x:1,y:0};
                        pilesman.fourmi.pawn.sprite.texture = textureManager.antRight;
                        pilesman.fourmi.pawn.spritOffset = { x: 0.65, y: 0.5 }; };
          
                    // ***Old way to move: need keep key down***
                    // *****************************************
                    //
                    // inputManager.keyRepeat["ArrowUp"] = function(){pilesman.fourmi.nextDir = {x:0,y:-1}};
                    // inputManager.keyRepeat["ArrowDown"] = function(){pilesman.fourmi.nextDir = {x:0,y:1}};
                    // inputManager.keyRepeat["ArrowLeft"] = function(){
                    //     pilesman.fourmi.nextDir = {x:-1,y:0};
                    //     pilesman.fourmi.pawn.sprite.texture = textureManager.antLeft
                    //     pilesman.fourmi.pawn.spritOffset = { x: 0.35, y: 0.5 };};
                    // inputManager.keyRepeat["ArrowRight"] = function(){
                    //     pilesman.fourmi.nextDir = {x:1,y:0};
                    //     pilesman.fourmi.pawn.sprite.texture = textureManager.antRight;
                    //     pilesman.fourmi.pawn.spritOffset = { x: 0.65, y: 0.5 }; };

                    // inputManager.keyUp["ArrowUp"] = function(){pilesman.fourmi.nextDir = {x:0,y:0};};
                    // inputManager.keyUp["ArrowDown"] = function(){pilesman.fourmi.nextDir = {x:0,y:0};};
                    // inputManager.keyUp["ArrowLeft"] = function(){pilesman.fourmi.nextDir = {x:0,y:0};};
                    // inputManager.keyUp["ArrowRight"] = function(){pilesman.fourmi.nextDir = {x:0,y:0};};

                    // globalEnv.arrowLeft.clickable.onClick = function(){
                    //     pilesman.fourmi.nextDir = {x:-1,y:0};
                    //     pilesman.fourmi.pawn.sprite.texture = textureManager.antLeft
                    //     pilesman.fourmi.pawn.spritOffset = { x: 0.35, y: 0.5 };};
                    // globalEnv.arrowRight.clickable.onClick = function(){
                    //     pilesman.fourmi.nextDir = {x:1,y:0};
                    //     pilesman.fourmi.pawn.sprite.texture = textureManager.antRight;
                    //     pilesman.fourmi.pawn.spritOffset = { x: 0.65, y: 0.5 }; };
                    // globalEnv.arrowDown.clickable.onClick = function(){pilesman.fourmi.nextDir = {x:0,y:1}};
                    // globalEnv.arrowUp.clickable.onClick = function(){pilesman.fourmi.nextDir = {x:0,y:-1}};

                    // inputManager.clickDown.push(globalEnv.arrowLeft);
                    // inputManager.clickDown.push(globalEnv.arrowRight);
                    // inputManager.clickDown.push(globalEnv.arrowDown);
                    // inputManager.clickDown.push(globalEnv.arrowUp);

                    globalEnv.objectToRender.push(globalEnv.arrowDown);
                    globalEnv.objectToRender.push(globalEnv.arrowRight);
                    globalEnv.objectToRender.push(globalEnv.arrowLeft);
                    globalEnv.objectToRender.push(globalEnv.arrowUp);

                    // debud shape
                    // globalEnv.objectToRender.push(globalEnv.controler);
                    globalEnv.controler.clickable.onClick = pilesman.tapControler;
                    inputManager.clickDown.push(globalEnv.controler);

                    // Cheat code for debug
                    //
                    inputManager.keyDown["c"] = function(){pilesman.remainBat = 0; console.log("Cheat")};
                },
                Update: function(timer){
                    pilesman.fourmi.update(timer);
                    pilesman.blue.update(timer);
                    pilesman.yellow.update(timer);
                    pilesman.red.update(timer);
                    pilesman.purple.update(timer);
                    pilesman.valueScore.text = pilesman.score;
                    if (pilesman.CheckColision())
                        ChangeState(pilesman.stateMachine.GameOver);
                    if (pilesman.remainBat == 0)
                        ChangeState(pilesman.stateMachine.Win);
                    if (pilesman.map[13][12] == 0 && Math.random() < 0.001)
                        pilesman.map[13][12] = -4;
                },
                name: "game: Pilesman, state: Play"
            },
            GameOver: {
                Enter: function(){
                    inputManager.ClearClick();
                    inputManager.ClearKey();
                    pilesman.lives -= 1;
                    pilesman.retry =false;
                    if (pilesman.lives != 0){
                        pilesman.sound.death.play();
                        pilesman.retry = true;
                        ChangeState(pilesman.stateMachine.Ready);
                        return;
                    }
                    pilesman.sound.end.play();
                    globalEnv.objectToRender.push(globalEnv.mediumSquare);
                    pilesman.textScore0_f.pos = {x:0.5,y:0.4};
                    pilesman.valueScore_f.pos = {x:0.5,y:0.48};
                    pilesman.valueScore_f.text = pilesman.score;
                    globalEnv.objectToRender.push(pilesman.valueScore_f);
                    globalEnv.objectToRender.push(pilesman.textScore_f);
                    globalEnv.objectToRender.push(pilesman.textScore0_f);
                    globalEnv.objectToRender.push(globalEnv.buttonShare);
                    globalEnv.objectToRender.push(globalEnv.buttonRestart);
                    globalEnv.objectToRender.push(globalEnv.textShare);
                    globalEnv.objectToRender.push(pilesman.heartCache);
                    inputManager.clickDown.push(globalEnv.buttonRestart);
                    inputManager.clickDown.push(globalEnv.buttonShare);
                },
                Update: function(){},
                name: "game: PilesMan, state: GameOver"
            },
            Win: {
                Enter: function(){
                    inputManager.ClearClick();
                    inputManager.ClearKey();
                    // *** Needed for multiple level
                    // *****************************
                    //
                    // if (pilesman.level < 3){
                    //     pilesman.level += 1;
                    //     ChangeState(pilesman.stateMachine.Ready);
                    //     return;
                    // }
                    pilesman.textScore0_f.pos = {x:0.5,y:0.35};
                    pilesman.valueScore_f.pos = {x:0.5,y:0.4};
                    globalEnv.objectToRender.push(globalEnv.mediumSquare);
                    pilesman.valueScore_f.text = pilesman.score;
                    if (globalEnv.timer >= 60000)
                        pilesman.valueTemps_f.text = Math.floor(globalEnv.timer / 60000) + " min " + (Math.floor(globalEnv.timer / 1000)%60) + " sec";
                    else
                        pilesman.valueTemps_f.text = (Math.floor(globalEnv.timer / 1000)%60) + " sec";
                    globalEnv.objectToRender.push(pilesman.valueScore_f);
                    globalEnv.objectToRender.push(pilesman.valueTemps_f);
                    globalEnv.objectToRender.push(pilesman.textScore_f);
                    globalEnv.objectToRender.push(pilesman.textScore0_f);
                    globalEnv.objectToRender.push(pilesman.textScore1_f);
                    globalEnv.objectToRender.push(globalEnv.textShare);
                    globalEnv.objectToRender.push(globalEnv.buttonRestart);
                    globalEnv.objectToRender.push(globalEnv.buttonShare);
                    inputManager.clickDown.push(globalEnv.buttonRestart);
                    inputManager.clickDown.push(globalEnv.buttonShare);
                },
                Update: function(){},
                name: "game: PilesMan, State: win"
            },
            Pause: {
                Enter: function(){
                    inputManager.ClearClick();
                    inputManager.ClearKey();
                    globalEnv.buttonPause.clickable.onClick = function(){ChangeState(pilesman.stateMachine.Play)};
                    inputManager.keyDown[" "] = function(){ChangeState(pilesman.stateMachine.Play);};
                    inputManager.clickDown.push(globalEnv.buttonPause);
                    inputManager.clickDown.push(globalEnv.buttonHome);
                },
                Update: function(){},
                name: "game: PilesMan, Status: pause"
            }
        }
        //#endregion

        //#region ______Methodes

            this.tapControler = function(){
                var x = (globalEnv.mouseClick.x - globalEnv.controler.center.x).toFixed(3); 
                var y = ((globalEnv.mouseClick.y - globalEnv.controler.center.y)/globalEnv.gameRatio).toFixed(3); 
                
                if (x > 0 && x > y && x > -y){
                    pilesman.fourmi.nextDir = {x:1,y:0};
                    pilesman.fourmi.pawn.sprite.texture = textureManager.antRight;
                    pilesman.fourmi.pawn.spritOffset = { x: 0.65, y: 0.5 }; 
                }
                else if (x< 0 && Math.abs(x) > Math.abs(y)){
                    pilesman.fourmi.nextDir = {x:-1,y:0};
                    pilesman.fourmi.pawn.sprite.texture = textureManager.antLeft
                    pilesman.fourmi.pawn.spritOffset = { x: 0.35, y: 0.5 };
                }
                else if (y > 0 && y > x && y > -x){
                    pilesman.fourmi.nextDir = {x:0,y:1};
                }
                else{
                    pilesman.fourmi.nextDir = {x:0,y:-1};
                }
            }

            this.GetAvDir = function (coord, dir, state){
                var ret = [];
                coord.x = Math.round(coord.x);
                coord.y = Math.round(coord.y);
                if (pilesman.nodeMap[coord.y][coord.x] == 4)
                    return [{x:-1,y:0}];
                if (pilesman.nodeMap[coord.y][coord.x] == 5)
                    return [{x:1,y:0}];
                if (pilesman.nodeMap[coord.y][coord.x] == 6)
                {   
                    if (state == "dead")
                        return [{x:0,y:1}];
                    else
                        return [{x:0,y:-1}];
                }
                if (pilesman.nodeMap[coord.y][coord.x] == 7)
                {
                    if (state == "dead")
                        return [{x:0,y:1}];
                    else
                        return [{x:1,y:0},{x:-1,y:0}];
                }
                if (pilesman.nodeMap[coord.y][coord.x] == 8)
                {
                    if (state == "dead")
                        return [{x:1,y:0},{x:-1,y:0}];
                    else 
                        return [{x:0,y:-1}];
                }
                if (pilesman.nodeMap[coord.y + 1][coord.x + 0] >= 0 && dir.y != -1)
                    ret.push({x:0,y:1});
                if (pilesman.nodeMap[coord.y - 1][coord.x + 0] >= 0 && dir.y != 1)
                    ret.push({x:0,y:-1});
                if (pilesman.nodeMap[coord.y + 0][coord.x + 1] >= 0 && dir.x != -1)
                    ret.push({x:1,y:0});
                if (pilesman.nodeMap[coord.y + 0][coord.x - 1] >= 0 && dir.x != 1)
                    ret.push({x:-1,y:0});
                return ret;
            }

            this.IsCoordExacte = function (val) {
                if (Math.abs(val.x - Math.round(val.x)) > 0.05)
                    return false;
                if (Math.abs(val.y - Math.round(val.y)) > 0.05)
                    return false;
                return true;
            }

            this.CheckColision = function () {
                if (this.SQRDist(pilesman.fourmi.pawn.coord, pilesman.blue.pawn.coord) < 0.25)
                {
                    switch (pilesman.blue.curState.name){
                        case("dead"):
                            return false;
                        case("scared"):
                            pilesman.blue.ChangeState(pilesman.blue.stateMachine.Dead);
                            return false;
                        default:
                            return true;
                    }
                }
                if (this.SQRDist(pilesman.fourmi.pawn.coord, pilesman.red.pawn.coord) < 0.25)
                {
                    switch (pilesman.red.curState.name){
                        case("dead"):
                            pilesman.sound.eatFruit.pause();
                            pilesman.sound.eatFruit.currentTime = 0;
                            pilesman.sound.eatGhost.play();
                            return false;
                        case("scared"):
                            pilesman.red.ChangeState(pilesman.red.stateMachine.Dead);
                            return false;
                        default:
                            return true;
                    }
                }
                if (this.SQRDist(pilesman.fourmi.pawn.coord, pilesman.yellow.pawn.coord) < 0.25)
                {
                    switch (pilesman.yellow.curState.name){
                        case("dead"):
                            return false;
                        case("scared"):
                            pilesman.yellow.ChangeState(pilesman.yellow.stateMachine.Dead);
                            return false;
                        default:
                            return true;
                    }
                }
                if (this.SQRDist(pilesman.fourmi.pawn.coord, pilesman.purple.pawn.coord) < 0.25)
                {
                    switch (pilesman.purple.curState.name){
                        case("dead"):
                            return false;
                        case("scared"):
                            pilesman.purple.ChangeState(pilesman.purple.stateMachine.Dead);
                            return false;
                        default:
                            return true;
                    }
                }
            }

            this.SQRDist= function(coord1, coord2){
                return ((coord1.x - coord2.x)*(coord1.x - coord2.x)+(coord1.y - coord2.y)*(coord1.y - coord2.y));
            }
        //#endregion
    }
//#endregion

//#region ______________Global_______________
    var GlobalEnv = function(){
        
        this.curGame = null;
        this.canvas = document.getElementById("mainCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.gameRatio = 4 / 3;
        this.objectToRender = [];
        this.scale = 1;
        this.mouseClick = null;
        //#region globalSprites



        this.corepile = new MyText("Corepile",{x:0.5,y:0.97},40,"center");

        this.mediumSquare = new Sprite();
        this.mediumSquare.texture = textureManager.mediumSquare;
        this.mediumSquare.center = {x:0.5,y:0.5};
        this.mediumSquare.size = { x: 0.845, y: 0.75 };

        this.buttonRestart = new Sprite();
        this.buttonRestart.texture = textureManager.buttonRestart;
        this.buttonRestart.center = {x:0.5,y:0.75};
        this.buttonRestart.size = { x:textureManager.buttonRestart.width / 1000, y:textureManager.buttonRestart.height * this.gameRatio / 1000};
        this.buttonRestart.clickable = new Clickable(
            this.buttonRestart.center,
            this.buttonRestart.size,
            function(){ChangeState(globalEnv.curGame.stateMachine.NewGame)}
        );

        this.textShare = new MyText("Défie tes amis !",{x:0.5,y:0.60},27,"center")

        this.buttonShare = new Sprite();
        this.buttonShare.texture = textureManager.buttonShare;
        this.buttonShare.center = {x:0.5,y:0.65};
        this.buttonShare.size = {x: 233 / 1000, y: 45/1000 * this.gameRatio};
        this.buttonShare.scale = 0.85;
        this.buttonShare.clickable = new Clickable(
            this.buttonShare.center,
            this.buttonShare.size,
            function(){ShareOnfb()},
            this.buttonShare.scale
        )

        this.arrowLeft = new Sprite();
        this.arrowLeft.texture = textureManager.arrowLeft;
        this.arrowLeft.center = {x:0.75,y:0.7};
        this.arrowLeft.size = {x:textureManager.arrowLeft.width/1000,y:textureManager.arrowLeft.height/1000*this.gameRatio};
        this.arrowLeft.scale = 0.35;
        this.arrowLeft.clickable = new Clickable(
            this.arrowLeft.center,
            this.arrowLeft.size,
            null,
            this.arrowLeft.scale
        )

        this.arrowRight = new Sprite();
        this.arrowRight.texture = textureManager.arrowRight;
        this.arrowRight.center = {x:0.95,y:0.7};
        this.arrowRight.size = {x:textureManager.arrowRight.width/1000,y:textureManager.arrowRight.height/1000*this.gameRatio};
        this.arrowRight.scale = 0.35;
        this.arrowRight.clickable = new Clickable(
            this.arrowRight.center,
            this.arrowRight.size,
            null,
            this.arrowRight.scale
        )

        this.arrowDown = new Sprite();
        this.arrowDown.texture = textureManager.arrowDown;
        this.arrowDown.center = {x:0.85,y:0.78};
        this.arrowDown.size = {x:textureManager.arrowDown.width/1000,y:textureManager.arrowDown.height/1000*this.gameRatio};
        this.arrowDown.scale = 0.35;
        this.arrowDown.clickable = new Clickable(
            this.arrowDown.center,
            this.arrowDown.size,
            null,
            this.arrowDown.scale
        )

        this.arrowRot = new Sprite();
        this.arrowRot.texture = textureManager.arrowRot;
        this.arrowRot.center = {x:0.85,y:0.62};
        this.arrowRot.size = {x:textureManager.arrowRot.width/1000,y:textureManager.arrowRot.height/1000*this.gameRatio};
        this.arrowRot.scale = 0.35;
        this.arrowRot.clickable = new Clickable(
            this.arrowRot.center,
            this.arrowRot.size,
            null,
            this.arrowRot.scale
        )

        this.arrowUp = new Sprite();
        this.arrowUp.texture = textureManager.arrowUp;
        this.arrowUp.center = {x:0.85,y:0.62};
        this.arrowUp.size = {x:textureManager.arrowUp.width/1000,y:textureManager.arrowUp.height/1000*this.gameRatio};
        this.arrowUp.scale = 0.35;
        this.arrowUp.clickable = new Clickable(
            this.arrowUp.center,
            this.arrowUp.size,
            null,
            this.arrowUp.scale
        )

        this.controler = new Sprite();
        this.controler.texture = textureManager.debug;
        this.controler.center = {x:(this.arrowLeft.center.x+this.arrowRight.center.x)/2,y:(this.arrowUp.center.y+this.arrowDown.center.y)/2};
        this.controler.size = {x:0.4,y:0.4*this.gameRatio};
        this.controler.scale = 1;
        this.controler.clickable = new Clickable(
            this.controler.center,
            this.controler.size,
            null,
            this.controler.scale
        )

        this.buttonHome = new Sprite();
        this.buttonHome.texture = textureManager.buttonHome;
        this.buttonHome.center = {x:0.15,y:0.12};
        this.buttonHome.size = {x:0.3,y:0.3*this.gameRatio};
        this.buttonHome.scale = 0.5;
        this.buttonHome.clickable = new Clickable(
            this.buttonHome.center,
            this.buttonHome.size,
            function(){
                window.location = "..";
            },
            this.buttonHome.scale
        )

        this.buttonPause = new Sprite();
        this.buttonPause.texture = textureManager.buttonPause;
        this.buttonPause.center = {x:0.85,y:0.12};
        this.buttonPause.size = {x:0.3,y:0.3*this.gameRatio};
        this.buttonPause.scale = 0.5;
        this.buttonPause.clickable = new Clickable(
            this.buttonPause.center,
            this.buttonPause.size,
            null,
            this.buttonPause.scale
        )

        //#endregion

        this.Resize =  function(that = this){
            var h = window.innerHeight;
            var w = window.innerWidth;
            var winRatio = w / h
            if (winRatio > that.gameRatio) {
                that.canvas.height = h;
                that.canvas.width = h * that.gameRatio;
            }
            else {
                that.canvas.width = w;
                that.canvas.height = w / that.gameRatio;
            }
            that.scale = that.canvas.width / 1000;
        }



    }
//#endregion

var InputManager = function(){
    this.keyDown = {};
    this.keyUp = {};
    this.keyRepeat = {};

    this.keyPressed = {};

    this.clickDown = [];
    this.clickUp = [];
    this.clickRepeat = [];

    this.isClicked = null;

    this.nbTickKey = 0;
    this.nbTickClick = 0;

    this.keyRepeatWait = 4;

    this.KeyDown = function(e)
    {
        if (inputManager.keyDown[e.key] && !inputManager.keyPressed[e.key])
        {
            inputManager.keyDown[e.key]();
            inputManager.keyPressed[e.key] = true;
            inputManager.nbTickKey = -2;
            return;
        }
    }

    this.KeyUp = function(e){
        inputManager.keyPressed[e.key] = false;

        if (inputManager.keyUp[e.key])
            inputManager.keyUp[e.key]();
    }

    this.ClearKey = function(){
        inputManager.keyDown = {};
        inputManager.keyUp = {};
        inputManager.keyRepeat = {};
    }

    this.ClearClick = function(){
        inputManager.clickDown = [];
        inputManager.clickUp = [];
        inputManager.clickRepeat = [];
    }

    this.MouseUp = function(event){
        inputManager.isClicked = null;
    }

    this.MouseDown = function(event){
        var x = event.offsetX/globalEnv.canvas.width;
        var y = event.offsetY/globalEnv.canvas.height;
        globalEnv.mouseClick = {x:x,y:y};
        inputManager.CheckClick(x,y);
    }

    this.TouchDown = function(event){
        var rect = globalEnv.canvas.getBoundingClientRect();
        var touchobj = event.changedTouches[0]; 
        var x = parseInt(touchobj.clientX-rect.left)/globalEnv.canvas.width; 
        var y = parseInt(touchobj.clientY-rect.top)/globalEnv.canvas.height; 
        globalEnv.mouseClick = {x:x,y:y};
        inputManager.CheckClick(x,y);
    }

    this.CheckClick = function (x, y) {
        this.clickDown.forEach(element => {
            if (element.isClicked(x, y)){
                element.onClick();
                inputManager.isClicked = element;
                inputManager.nbTickClick = 0;
                return;
            }
        });
    }

    this.Update = function(){
        if (inputManager.nbTickKey >= inputManager.keyRepeatWait ) {
            for (var key in inputManager.keyPressed) {
                if (inputManager.keyPressed[key] && typeof(inputManager.keyRepeat[key]) !== "undefined"){
                    inputManager.keyRepeat[key]();
                    break;
                }
            }
            inputManager.nbTickKey = 0;
        }
        if (inputManager.nbTickClick >= 6 ){
            inputManager.clickRepeat.forEach(element => {
                if (element == inputManager.isClicked)
                {
                    element.onClick();
                    return;
                }
            });
            inputManager.nbTickClick = 0;
        }
        inputManager.nbTickClick += 1;
        inputManager.nbTickKey += 1;
    }
}

var globalEnv = new GlobalEnv();
var pilesman = new Pilesman();
var inputManager = new InputManager();

var ChangeState = function(newState){
    if (globalEnv.curGame.curState && globalEnv.curGame.curState.Leave)
        globalEnv.curGame.curState.Leave();
    globalEnv.curGame.curState = newState;
    if (globalEnv.curGame.curState.Enter)
        globalEnv.curGame.curState.Enter();
}

var ChangeGame = function(newGame){
    if (globalEnv.curGame && globalEnv.curGame.curState && globalEnv.curGame.curState.Leave)
        globalEnv.curGame.curState.Leave();
    globalEnv.curGame = newGame;
    if (globalEnv.curGame.stateMachine)
        ChangeState(globalEnv.curGame.stateMachine.NewGame);
}

var setInitialState = function(){
    globalEnv.Resize();
    ChangeGame(pilesman);
    window.addEventListener('keydown', function(event){inputManager.KeyDown(event);}, false);
    window.addEventListener('keyup', function(event){inputManager.KeyUp(event);}, false);
    window.addEventListener('resize', function(){globalEnv.Resize();}, false);
    if (globalEnv.isMobile){
        globalEnv.canvas.addEventListener('touchstart', function(event){inputManager.TouchDown(event)},false);
        globalEnv.canvas.addEventListener('touchend', function(event){inputManager.MouseUp(event)},false);
    }else{
        globalEnv.canvas.addEventListener('mousedown', function(event){inputManager.MouseDown(event)},false);
        globalEnv.canvas.addEventListener('mouseup', function(event){inputManager.MouseUp(event)},false);
    }
    var myFont = new FontFace('PressStart', 'url(assets/fonts/PressStart2P.ttf)');
    myFont.load().then(function (font) {
        document.fonts.add(font);
        FontLoaded = true;
    });
}

var Render = function(tFrame){
    globalEnv.ctx.clearRect(0, 0, globalEnv.canvas.width, globalEnv.canvas.height);
    globalEnv.objectToRender.forEach(element => {
        if (element &&  element.render)
            element.render(tFrame);
        else
            console.log(element.render);
    });
}

var Update = function(timer){
    if (globalEnv.curGame.curState && globalEnv.curGame.curState.Update)
        globalEnv.curGame.curState.Update(timer);
    inputManager.Update(timer);
}

; (function () {
    function main(tFrame) {
        globalEnv.stopMain = window.requestAnimationFrame(main);
        var nextTick = globalEnv.lastTick + globalEnv.tickLength;
        var numTicks = 0;

        if (tFrame > nextTick) {
            var timeSinceTick = tFrame - globalEnv.lastTick;
            numTicks = Math.floor(timeSinceTick / globalEnv.tickLength);
        }

        QueueUpdates(numTicks);
        Render(tFrame - globalEnv.lastRender);
        globalEnv.lastRender = tFrame;
    }

    function QueueUpdates(numTicks) {
        for (var i = 0; i < numTicks; i++) {
            globalEnv.lastTick = globalEnv.lastTick + globalEnv.tickLength;
            globalEnv.timer = globalEnv.timer + globalEnv.tickLength;
            Update(globalEnv.timer);
        }
    }

    globalEnv.lastTick = performance.now();
    globalEnv.lastRender = globalEnv.lastTick;
    globalEnv.tickLength = 20;
    globalEnv.timer = 0;

    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        globalEnv.isMobile = true;
    }

    setInitialState();
    main(performance.now());
})();