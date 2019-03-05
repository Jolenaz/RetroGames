//#region Globale Variables
let GIFfps = 10;

var FontLoaded = false;

let GameName = "attrappil";

var ShareOnfb = function(){
    var url= encodeURI("https://www.facebook.com/sharer.php?u=https://www.jerecyclemespiles.com/recyclercestjouer/mediafb/sh.php?jeu=" + GameName + "&score=" + attrapepile.score + "&id=" + getId());

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

    var FallingBat = function(){
        this.sprite = null;
        this.speed = 0;
        this.number;
        this.isBat = false;
        this.batCatureDuration = 4;
        this.failCatureDuration = 8;
        this.captureTick = 0;
        this.isCapture = function(){
            if (this.lane == attrapepile.player.lane)
                this.captureTick += 1;
            if (this.isBat && this.captureTick >= this.batCatureDuration)
                return true;
            if (!this.isBat && this.captureTick >= this.failCatureDuration)
                return true;
            return false;
        }
        this.moveDown = function(){
            if (this.sprite){
                this.sprite.center.y += this.speed; 
            }
        }
        this.render = function(tFrame){
            if (this.sprite)
                this.sprite.render();
        }
    }

    var Duo = function(){

        this.sprite = null;
        this.lane = 5;

        this.moveRight = function(){
            if (attrapepile.player.lane < 8)
                attrapepile.player.lane += 1;
        }

        this.moveLeft = function(){
            if (attrapepile.player.lane > 0)
                attrapepile.player.lane -= 1;
        }

        this.render = function(tFrame){
            this.sprite.center.x = 0.3 + this.lane * 0.05;
            if (this.sprite && this.sprite.render){
                this.sprite.render();
            }
        }
    
    }

//#endregion

//#region _____________Assets
    var textureManager = {
        mediumSquare: new Texture("assets/images/MediumSquare_776x388.png",776,388),
        buttonShare: new Texture("assets/images/ButtonShare_233x45.png",233,45),
        buttonHome: new Texture("assets/images/ButtonHome_296x296.png",296,296),
        buttonPause: new Texture("assets/images/ButtonPause_293x293.png",293,293),
        buttonRestart: new Texture("assets/images/ButtonRestart_437x66.png",437,66),
        heart : new Texture("assets/images/Live_48x43.png",48,43),
        cache: new Texture("assets/images/Cache_100x100.png",100,100),
        arrowDown: new Texture("assets/images/ArrowDown_283x283.png",283,283),
        arrowUp: new Texture("assets/images/ArrowUp_283x283.png",283,283),
        arrowRight: new Texture("assets/images/ArrowRight_283x283.png",283,283),
        arrowLeft: new Texture("assets/images/ArrowLeft_283x283.png",283,283),
        arrowRot: new Texture("assets/images/ArrowRot_283x302.png",283,302),
        attBatGrey: new Texture("assets/images/attrapepile/BatGrey_64x63.png",64,63),
        attBatGreen: new Texture("assets/images/attrapepile/BatGreen_72x36.png",72,36),
        attBatOrange: new Texture("assets/images/attrapepile/BatOrange_57x57.png",57,57),
        attBatWhite: new Texture("assets/images/attrapepile/BatWhite_41x48.png",41,48),
        attBatWhite: new Texture("assets/images/attrapepile/BatWhite_41x48.png",41,48),
        attFailGrey: new Texture("assets/images/attrapepile/FailGrey_50x66.png",50,66),
        attFailGreen: new Texture("assets/images/attrapepile/FailGreen_76x34.png",76,34),
        attFailOrange: new Texture("assets/images/attrapepile/FailOrange_57x49.png",57,49),
        attFailWhite: new Texture("assets/images/attrapepile/FailWhite_37x62.png",37,62),
        attPlayGround: new Texture("assets/images/attrapepile/PlayGround_647x720.png",647,720),
        allGood: new Texture("assets/images/attrapepile/AllGood_78x481.png",78,481),
        allBad: new Texture("assets/images/attrapepile/AllBad_81x470.png",81,470),
        duo: new Texture("assets/images/attrapepile/Duo_145x163.png",145,163),
    };
//#endregion

//#region _____________AttrapePile___________

    var AttrapePile = function(){

        //#region vartiables
            this.saveData = {};
            this.bats = [];
            this.lastBat = 0;
            this.lives = 3;
            this.score = 0;
            this.missed = 0;
            this.trashed = 0;
            this.difficulty = 0.2;

            this.isDrag = false;

            this.batRender = {};
            this.batRender.render = function(tFrame){
                attrapepile.bats.forEach(element => {
                    if (element.render)
                        element.render(tFrame);
                });
            }
        //#endregion

        //#region Sprites

            //#region playGround
                this.playGround = new Sprite();
                this.playGround.texture = textureManager.attPlayGround;
                this.playGround.size = {x:textureManager.attPlayGround.width/1000, y: textureManager.attPlayGround.height/1000 * globalEnv.gameRatio };
                this.playGround.scale = 0.85;
                this.playGround.center = {x:0.5,y:(this.playGround.size.y*this.playGround.scale)/2};

                this.player = new Duo();
                this.player.sprite = new Sprite();
                this.player.sprite.texture = textureManager.duo;
                this.player.sprite.size = {x: textureManager.duo.width/1000, y:textureManager.duo.height/1000 * globalEnv.gameRatio};
                this.player.sprite.scale = 0.8;   
                this.player.sprite.center = {x:0.5,y:this.playGround.center.y + (this.playGround.size.y * this.playGround.scale)/2 - (this.player.sprite.size.y * this.player.sprite.scale)/2 };
                this.player.sprite.clickable = new Clickable(
                    this.player.sprite.center,
                    this.player.sprite.size,
                    function(){
                        attrapepile.isDrag = true;
                    },
                    this.player.sprite.scale
                );

            //#endregion

            //#region Batteries
                this.goods = [
                    textureManager.attBatGreen,
                    textureManager.attBatGrey,
                    textureManager.attBatWhite,
                    textureManager.attBatOrange,
                ];

                this.fails = [
                    textureManager.attFailGreen,
                    textureManager.attFailGrey,
                    textureManager.attFailWhite,
                    textureManager.attFailOrange,
                ];

                this.allGood = new Sprite();
                this.allGood.texture = textureManager.allGood;
                this.allGood.size = {x:textureManager.allGood.width/1000,y:textureManager.allGood.height/1000*globalEnv.gameRatio};
                this.allGood.center = {x: 0.06, y: 0.52}
                this.allGood.scale = 0.6;

                this.allBad = new Sprite();
                this.allBad.texture = textureManager.allBad;
                this.allBad.size = {x:textureManager.allBad.width/1000,y:textureManager.allBad.height/1000*globalEnv.gameRatio};
                this.allBad.center = {x: 0.16, y: 0.52}
                this.allBad.scale = 0.6;

                this.textAllGood = new MyText("A",{x:0.06,y:0.30},8,"center");
                this.textAllGood0 = new MyText("Collecter!",{x:0.06,y:0.32},9,"center");
                this.textAllBad = new MyText("A Ne pas",{x:0.16,y:0.3},9,"center");
                this.textAllBad0 = new MyText("Collecter!",{x:0.16,y:0.32},9,"center");

            //#endregion

            //#region text
                this.textEnd = new MyText("Félicitation",{x:0.5,y:0.3},30,"center");
                this.textScore_f = new MyText("Piles Colllectées",{x:0.5,y:0.4},30,"center");
                this.valueScore_f = new MyText("",{x:0.5,y:0.5},30,"center");

                this.textscore = new MyText("Piles", {x:0.8,y:0.37},22,"left");
                this.textscore0 = new MyText("Collectées", {x:0.8,y:0.42},20,"left");
                this.valueScore = new MyText("", {x:0.9,y:0.5},32,"center");
                this.textLives = new MyText("Vies", {x:0.9,y:0.6},35,"center"); 
                // this.textMissingBAt = new MyText("missed", {x:0.9,y:0.6},20,"center");
                // this.valueMissingBat = new MyText("", {x:0.9,y:0.65},20,"center");
                // this.textGetTrash = new MyText("trashed", {x:0.9,y:0.7},20,"center");
                // this.valueGetTrash = new MyText("", {x:0.9,y:0.75},20,"center");

                this.heart_0 = new Sprite();
                this.heart_0.texture = textureManager.heart;
                this.heart_0.size = {x:textureManager.heart.width /1000, y:textureManager.heart.height / 1000 * globalEnv.gameRatio};
                this.heart_0.center = {x:0.94,y:0.65};
                this.heart_0.scale = 0.7;

                this.heart_1 = new Sprite();
                this.heart_1.texture = textureManager.heart;
                this.heart_1.size = {x:textureManager.heart.width /1000, y:textureManager.heart.height / 1000 * globalEnv.gameRatio};
                this.heart_1.center = {x:0.9,y:0.65};
                this.heart_1.scale = 0.7;

                this.heart_2 = new Sprite();
                this.heart_2.texture = textureManager.heart;
                this.heart_2.size = {x:textureManager.heart.width /1000, y:textureManager.heart.height / 1000 * globalEnv.gameRatio};
                this.heart_2.center = {x:0.86,y:0.65};
                this.heart_2.scale = 0.7;
                
                this.heartCache = new Sprite();
                this.heartCache.texture = textureManager.cache;
                this.heartCache.size = {x:0.2, y:textureManager.heart.height / 1000 * globalEnv.gameRatio};
                this.heartCache.center = {x:0.9,y:0.65};
                this.heartCache.scale = 1;

                this.hearts = [
                    this.heart_0,
                    this.heart_1,
                    this.heart_2
                ];
            //#endregion

            this.sound = {};
            this.sound.end = new Audio("assets/sounds/end.wav");
            this.sound.coin = new Audio("assets/sounds/coin.wav");
            this.sound.wrong = new Audio("assets/sounds/wrong.mp3");

        //#endregion

        //#region StateMachine
            this.stateMachine = {
                NewGame: {
                    Enter: function(){
                            globalEnv.objectToRender = [];
                            inputManager.ClearClick();
                            inputManager.ClearKey();
                            attrapepile.bats = [];
                            attrapepile.player.lane = 5;
                            attrapepile.lastBat = 0;
                            attrapepile.lives = 3;
                            attrapepile.score = 0;
                            attrapepile.missed = 0;
                            attrapepile.trashed = 0;
                            attrapepile.difficulty = 0.2;
                            globalEnv.timer = 0;
                    },
                    Update: function(){
                        ChangeState(attrapepile.stateMachine.Play);
                    },
                    name: "game: AttrapePile, state: NewGame "
                },
                Play: {
                    Enter: function(){
                            globalEnv.objectToRender = [];
                            inputManager.ClearClick();
                            inputManager.ClearKey();

                            attrapepile.saveData.arrowLef = {x:0.4,y:0.9};
                            globalEnv.arrowLeft.center = {x:0.4,y:0.9};
                            globalEnv.arrowLeft.clickable.center = globalEnv.arrowLeft.center;

                            attrapepile.saveData.arrowRight = {x:0.6,y:0.9};
                            globalEnv.arrowRight.center = {x:0.6,y:0.9};
                            globalEnv.arrowRight.clickable.center = globalEnv.arrowRight.center;

                            globalEnv.buttonHome.center = {x:0.1,y:0.15};
                            globalEnv.buttonPause.center = {x:0.9,y:0.15};

                            globalEnv.objectToRender.push(globalEnv.arrowLeft);
                            globalEnv.objectToRender.push(globalEnv.arrowRight);
                            globalEnv.objectToRender.push(globalEnv.buttonHome);
                            globalEnv.objectToRender.push(globalEnv.buttonPause);
                            globalEnv.objectToRender.push(attrapepile.playGround);
                            globalEnv.objectToRender.push(attrapepile.batRender);
                            globalEnv.objectToRender.push(attrapepile.player);

                            globalEnv.objectToRender.push(attrapepile.allGood);
                            globalEnv.objectToRender.push(attrapepile.textAllGood);
                            globalEnv.objectToRender.push(attrapepile.textAllGood0);
                            globalEnv.objectToRender.push(attrapepile.allBad);
                            globalEnv.objectToRender.push(attrapepile.textAllBad);
                            globalEnv.objectToRender.push(attrapepile.textAllBad0);

                            inputManager.clickDown.push(attrapepile.player.sprite);

                            inputManager.keyDown["ArrowLeft"] = attrapepile.player.moveLeft;
                            inputManager.keyRepeat["ArrowLeft"] = attrapepile.player.moveLeft;
                            inputManager.keyDown["ArrowRight"] = attrapepile.player.moveRight;
                            inputManager.keyRepeat["ArrowRight"] = attrapepile.player.moveRight;

                            globalEnv.arrowLeft.clickable.onClick = attrapepile.player.moveLeft;
                            globalEnv.arrowRight.clickable.onClick = attrapepile.player.moveRight;
                            
                            inputManager.clickDown.push(globalEnv.arrowLeft);
                            inputManager.clickDown.push(globalEnv.arrowRight);

                            inputManager.clickRepeat.push(globalEnv.arrowLeft);
                            inputManager.clickRepeat.push(globalEnv.arrowRight);

                            inputManager.clickDown.push(globalEnv.buttonHome);
                            globalEnv.buttonPause.clickable.onClick = function(){ChangeState(attrapepile.stateMachine.Pause)};
                            inputManager.keyDown[" "] = function(){ChangeState(attrapepile.stateMachine.Pause)}
                            inputManager.clickDown.push(globalEnv.buttonPause);

                            globalEnv.objectToRender.push(attrapepile.textscore);
                            globalEnv.objectToRender.push(attrapepile.textscore0);
                            globalEnv.objectToRender.push(attrapepile.valueScore);
                            // globalEnv.objectToRender.push(attrapepile.textMissingBAt);
                            // globalEnv.objectToRender.push(attrapepile.valueMissingBat);
                            // globalEnv.objectToRender.push(attrapepile.textGetTrash);
                            // globalEnv.objectToRender.push(attrapepile.valueGetTrash);

                            globalEnv.objectToRender.push(attrapepile.textLives);
                            for (var i = 0; i < attrapepile.lives; i++){
                                globalEnv.objectToRender.push(attrapepile.hearts[i]);
                            } 

                            attrapepile.saveData.inputWait =  inputManager.keyRepeatWait;
                            inputManager.keyRepeatWait = 2;
                    },
                    Update: function(timer){
                        // attrapepile.valueGetTrash.text = attrapepile.trashed;
                        // attrapepile.valueMissingBat.text = attrapepile.missed;
                        attrapepile.valueScore.text = attrapepile.score;
                        if (attrapepile.isDrag){
                            if (Math.abs(globalEnv.mousePose.x-globalEnv.mouseStart.x) >= 0.05){
                                attrapepile.player.lane += Math.round((globalEnv.mousePose.x-globalEnv.mouseStart.x) * 20);
                                if (attrapepile.player.lane < 0)
                                    attrapepile.player.lane = 0;
                                if (attrapepile.player.lane > 8)
                                    attrapepile.player.lane = 8;
                                globalEnv.mouseStart = globalEnv.mousePose;
                            }
                        }
                        if (Math.random() < (attrapepile.difficulty * attrapepile.difficulty)){
                            attrapepile.AddNewBat();
                        }
                        for (var i = 0; i < attrapepile.bats.length; i++){
                            var bat = attrapepile.bats[i];
                            if (!bat)
                                continue;
                            if (bat.moveDown)
                                bat.moveDown();
                            if (bat.sprite.center.y >= 0.65 && bat.sprite.center.y < 0.72){
                               if (bat.isCapture()){
                                    if (bat.isBat){
                                        attrapepile.score += 1;
                                        attrapepile.sound.coin.play();
                                        if (attrapepile.score % 10 == 0 && attrapepile.difficulty < 1 ){
                                            attrapepile.difficulty += 0.1;
                                        }
                                    }
                                    else{
                                        attrapepile.lives -= 1;
                                        attrapepile.trashed += 1;
                                        if (attrapepile.lives <= 0)
                                            ChangeState(attrapepile.stateMachine.GameOver);
                                        else{
                                            attrapepile.sound.wrong.play();
                                            ChangeState(attrapepile.stateMachine.Play);
                                        }
                                    }
                                    attrapepile.bats.splice(i,1);
                               }
                            }
                            else if (bat.sprite.center.y > 0.78){
                                if (bat.isBat){
                                    attrapepile.missed += 1;
                                    attrapepile.lives -= 1;
                                    if (attrapepile.lives <= 0)
                                        ChangeState(attrapepile.stateMachine.GameOver);
                                    else{
                                        attrapepile.sound.wrong.play();
                                        ChangeState(attrapepile.stateMachine.Play);
                                    }
                                }
                                attrapepile.bats.splice(i,1);
                            }
                        }
                    },
                    Leave: function(){
                        inputManager.keyRepeatWait = attrapepile.saveData.inputWait;

                        globalEnv.arrowLeft.center = attrapepile.saveData.arrowLef
                        globalEnv.arrowLeft.clickable.center = attrapepile.saveData.arrowLef

                        globalEnv.arrowRight.center = attrapepile.saveData.arrowRight 
                        globalEnv.arrowRight.clickable.center = attrapepile.saveData.arrowRight 

                    },
                    name: "game: AttrapePile, state: Play"
                },
                Pause: {
                    Enter: function(){
                        inputManager.ClearClick();
                        inputManager.ClearKey();
                        inputManager.keyDown[" "] = function(){ChangeState(attrapepile.stateMachine.Play)}
                        inputManager.clickDown.push(globalEnv.buttonHome);
                        globalEnv.buttonPause.clickable.onClick = function(){ChangeState(attrapepile.stateMachine.Play)};
                        inputManager.clickDown.push(globalEnv.buttonHome);
                        inputManager.clickDown.push(globalEnv.buttonPause);
                    },
                    Update: function(){

                    },
                    name: "game AttrapePile, state: pause"
                },
                GameOver: {
                    Enter: function(){
                        inputManager.ClearClick();
                        inputManager.ClearKey();
                        globalEnv.objectToRender.push(attrapepile.heartCache);

                        globalEnv.objectToRender.push(globalEnv.mediumSquare);
                        globalEnv.objectToRender.push(globalEnv.buttonRestart);
                        globalEnv.objectToRender.push(globalEnv.buttonShare);
                        globalEnv.objectToRender.push(globalEnv.textShare);

                        globalEnv.objectToRender.push(attrapepile.textEnd );
                        globalEnv.objectToRender.push(attrapepile.textScore_f );

                        attrapepile.valueScore_f.text = attrapepile.score;
                        globalEnv.objectToRender.push(attrapepile.valueScore_f );

                        inputManager.clickDown.push(globalEnv.buttonRestart);
                        inputManager.clickDown.push(globalEnv.buttonShare);

                        attrapepile.sound.end.play();

                    },
                    Update: function(){

                    },
                    name: "game: AttrapePile, state: GameOver"
                }
            }
        //#endregion

        //#region methodes
            this.AddNewBat = function(){
                var center = {};
                lane = Math.floor(Math.random() * 9) ;
                center.x = 0.3 + lane * 0.05;
                center.y = -0.1;
                speed = 0.004 + 0.009 * Math.random() * (attrapepile.difficulty * attrapepile.difficulty);
                fallTime = globalEnv.timer + Math.round(0.75 / (speed/globalEnv.tickLength))
                if (Math.random() <= 0.5){
                    isBat = true;
                }else{
                    isBat = false;
                }
                if (!attrapepile.Valide(center, lane, fallTime, isBat))
                    return;
                var newBat = new FallingBat();
                newBat.sprite = new Sprite()
                if (isBat){
                    newBat.sprite.texture = attrapepile.goods[Math.floor(Math.random() * 4)];
                }else{
                    newBat.sprite.texture = attrapepile.fails[Math.floor(Math.random() * 4)];
                }
                newBat.sprite.center = center;
                newBat.sprite.size = {x:newBat.sprite.texture.width/1000,y:newBat.sprite.texture.height/1000*globalEnv.gameRatio};
                newBat.sprite.scale = 0.8;
                newBat.speed = speed;
                newBat.fallTime = fallTime;
                newBat.lane = lane;
                newBat.isBat = isBat;
                newBat.number = attrapepile.lastBat + 1;
                attrapepile.bats[newBat.number] = newBat;
                attrapepile.lastBat += 1;
            }

            this.Valide = function(center, lane, fallTime, isBat)
            {
                for (var i =0; i < attrapepile.bats.length; i++){
                    var bat = attrapepile.bats[i];
                    if (!bat)
                        continue;
                    if (bat.sprite){
                        if (((bat.sprite.center.x - center.x)*(bat.sprite.center.x - center.x) + (bat.sprite.center.y - center.y)*(bat.sprite.center.y - center.y)) < 0.04){
                            return false;                      
                        }
                    }
                    if (bat.lane == lane && bat.isBat != isBat && Math.abs(bat.fallTime - fallTime) < 1500 )
                        return false;
                    if (isBat && bat.isBat == isBat && Math.abs(bat.fallTime - fallTime) < 2000 )
                        return false;
                };
                return true;
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
        
        this.mousePose = {x:0.5,y:0.5};
        this.mouseStart = {x:0.5,y:0.5};

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
        attrapepile.isDrag = false;

    }

    this.MouseDown = function(event){
        var x = event.offsetX/globalEnv.canvas.width;
        var y = event.offsetY/globalEnv.canvas.height;
        globalEnv.mouseStart = {x:x,y:y};
        globalEnv.mousePose = {x:x,y:y};
        inputManager.CheckClick(x,y);
    }

    this.MouseMove = function(event){
        var x = event.offsetX/globalEnv.canvas.width;
        var y = event.offsetY/globalEnv.canvas.height;
        globalEnv.mousePose = {x:x,y:y};
    }

    this.TouchDown = function(event){
        var rect = globalEnv.canvas.getBoundingClientRect();
        var touchobj = event.changedTouches[0]; 
        var x = parseInt(touchobj.clientX-rect.left)/globalEnv.canvas.width; 
        var y = parseInt(touchobj.clientY-rect.top)/globalEnv.canvas.height; 
        globalEnv.mouseStart = {x:x,y:y};
        globalEnv.mousePose = {x:x,y:y};
        inputManager.CheckClick(x,y);
    }

    this.TouchMove = function(event){
        var rect = globalEnv.canvas.getBoundingClientRect();
        var touchobj = event.changedTouches[0]; 
        var x = parseInt(touchobj.clientX-rect.left)/globalEnv.canvas.width; 
        var y = parseInt(touchobj.clientY-rect.top)/globalEnv.canvas.height; 

        globalEnv.mousePose = {x:x,y:y}; 
    }

    this.CheckClick = function (x, y) {
        inputManager.alreadyCliked = true;
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
var attrapepile = new AttrapePile();
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
    ChangeGame(attrapepile);
    window.addEventListener('keydown', function(event){inputManager.KeyDown(event);}, false);
    window.addEventListener('keyup', function(event){inputManager.KeyUp(event);}, false);
    window.addEventListener('resize', function(){globalEnv.Resize();}, false);
    if (globalEnv.isMobile){
        globalEnv.canvas.addEventListener('touchstart', function(event){inputManager.TouchDown(event)},false);
        globalEnv.canvas.addEventListener('touchend', function(event){inputManager.MouseUp(event)},false);
        globalEnv.canvas.addEventListener('touchmove', function(event){inputManager.TouchMove(event)},false);
    }else{
        globalEnv.canvas.addEventListener('mousedown', function(event){inputManager.MouseDown(event)},false);
        globalEnv.canvas.addEventListener('mouseup', function(event){inputManager.MouseUp(event)},false);
        globalEnv.canvas.addEventListener('mousemove', function(event){inputManager.MouseMove(event)},false);
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