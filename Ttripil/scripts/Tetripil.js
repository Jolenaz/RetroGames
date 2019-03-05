//#region Globale Variables
let GIFfps = 10;

var FontLoaded = false;

let GameName = "ttripil";

//
//  variable contenant le nombre de lignes faites :
//      tetripile.lines
//
//  variable contenant le nombre de piles collecteées :
//      tetripile.batLanded
//      
//
//

var ShareOnfb = function(){
    var url= encodeURI("https://www.facebook.com/sharer.php?u=https://www.jerecyclemespiles.com/recyclercestjouer/mediafb/sh.php?jeu=" + GameName + "&score=" + tetripile.score + "&id=" + getId());

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
    
    var BShape = function(texture){
        this.texture = texture;
        this.canGo = function (x,y,that=this){
            for (var i = 0; i < 4; i++)
            {
                if (x + that.modules[i].offsetX < 0 || x + that.modules[i].offsetX > 9)
                    return false;
                if (y + that.modules[i].offsetY < 0 || y + that.modules[i].offsetY > 18)
                    return false;
                if (tetripile.map[y + that.modules[i].offsetY][x + that.modules[i].offsetX] < 0)
                    return false;
            }
            return true;
        };
        this.canGoRight = function (that = this){ return that.canGo(tetripile.curPos.x + 1, tetripile.curPos.y    )};
        this.canGoLeft  = function (that = this){ return that.canGo(tetripile.curPos.x - 1, tetripile.curPos.y    )};
        this.canGoDown  = function (that = this){ return that.canGo(tetripile.curPos.x    , tetripile.curPos.y + 1)};
        this.canGoRotate  = function (that = this){
            var rotNum = Math.trunc(tetripile.curNum / 10) * 10 + (((tetripile.curNum % 10) + 1) % 4);
            return tetripile.shapes[rotNum].canGo(
                tetripile.curPos.x + that.rot.x,
                tetripile.curPos.y + that.rot.y
            )};
        this.PutBat = function(that = this){
            for (var i = 0; i < 4; i++){
                tetripile.map[tetripile.curPos.y + that.modules[i].offsetY][tetripile.curPos.x + that.modules[i].offsetX] = tetripile.curNum * 10 + i;
            }
        };
        this.StopBat = function(that = this){
            for (var i = 0; i < 4; i++){
                tetripile.map[tetripile.curPos.y + that.modules[i].offsetY][tetripile.curPos.x + that.modules[i].offsetX] = -(tetripile.curNum * 10 + i);
            }
        };
        this.RemoveBat = function(that = this){
            for (var i = 0; i < 4; i++){
                tetripile.map[tetripile.curPos.y + that.modules[i].offsetY][tetripile.curPos.x + that.modules[i].offsetX] = 0;
            }
        };
    }
    
//#endregion

//#region _____________Assets
    var textureManager = {
        mediumSquare: new Texture("assets/images/MediumSquare_776x388.png",776,388),
        bigSquare: new Texture("assets/images/tetripile/BigSquare_428x720.png",428,720),
        littleSquare: new Texture("assets/images/tetripile/LittleSquare_194x194.png",194,194),
        batBlue_0: new Texture("assets/images/tetripile/BatBlue_0_36x144.png",36,144),
        batBlue_1: new Texture("assets/images/tetripile/BatBlue_1_144x36.png",144,36),
        batGreen_0: new Texture("assets/images/tetripile/BatGreen_0_108x72.png",108,72),
        batGreen_1: new Texture("assets/images/tetripile/BatGreen_1_72x108.png",72,108),
        batGrey_0: new Texture("assets/images/tetripile/BatGrey_0_108x71.png",108,71),
        batGrey_1: new Texture("assets/images/tetripile/BatGrey_1_71x108.png",71,108),
        batGrey_2: new Texture("assets/images/tetripile/BatGrey_2_108x71.png",108,71),
        batGrey_3: new Texture("assets/images/tetripile/BatGrey_3_71x108.png",71,108),
        batNavy_0: new Texture("assets/images/tetripile/BatNavy_0_72x108.png",72,108),
        batNavy_1: new Texture("assets/images/tetripile/BatNavy_1_108x72.png",108,72),
        batNavy_2: new Texture("assets/images/tetripile/BatNavy_2_72x108.png",72,108),
        batNavy_3: new Texture("assets/images/tetripile/BatNavy_3_108x72.png",108,72),
        batOrange: new Texture("assets/images/tetripile/BatOrange_72x72.png",72,72),
        batPurple_0: new Texture("assets/images/tetripile/BatPurple_0_108x72.png",108,72),
        batPurple_1: new Texture("assets/images/tetripile/BatPurple_1_72x108.png",72,108),
        batRed_0: new Texture("assets/images/tetripile/BatRed_0_72x108.png",72,108),
        batRed_1: new Texture("assets/images/tetripile/BatRed_1_108x72.png",108,72),
        batRed_2: new Texture("assets/images/tetripile/BatRed_2_72x108.png",72,108),
        batRed_3: new Texture("assets/images/tetripile/BatRed_3_108x72.png",108,72),
        buttonRestart: new Texture("assets/images/ButtonRestart_437x66.png",437,66),
        buttonShare: new Texture("assets/images/ButtonShare_233x45.png",233,45),
        buttonHome: new Texture("assets/images/ButtonHome_296x296.png",296,296),
        buttonPause: new Texture("assets/images/ButtonPause_293x293.png",293,293),
        arrowDown: new Texture("assets/images/ArrowDown_283x283.png",283,283),
        arrowUp: new Texture("assets/images/ArrowUp_283x283.png",283,283),
        arrowRight: new Texture("assets/images/ArrowRight_283x283.png",283,283),
        arrowLeft: new Texture("assets/images/ArrowLeft_283x283.png",283,283),
        arrowRot: new Texture("assets/images/ArrowRot_283x302.png",283,302),
        cache: new Texture("assets/images/Cache_100x100.png",100,100),
        heart : new Texture("assets/images/Live_48x43.png",48,43),
    };
//#endregion

//#region _____________Tetripile_____________
    var Tetripile = function(){

        //#region ___Variables
            this.state = null;
            this.score = 0;
            this.level = 0;
            this.lines = 0;
            this.batLanded = 0;
            this.map = [];
            this.curNum = 0;
            this.nextNum = 0;
            this.curPos = {x:0,y:0};
            this.shapes = [];
            this.curShape = function(that=this){return this.shapes[that.curNum]};
            this.curState = null;
            this.lineCompleted = [];
            this.mapSaved = [];
            this.fromPause = false;
        //#endregion

        //#region ___Sprites
            this.bigSquare = new Sprite();
            this.bigSquare.texture = textureManager.bigSquare;
            this.bigSquare.size = {x:428/1000 * 0.9,y:720/1000*globalEnv.gameRatio * 0.9};
            this.bigSquare.center = {x:0.5, y:this.bigSquare.size.y/2};

            this.littleSquare = new Sprite();
            this.littleSquare.texture = textureManager.littleSquare;
            this.littleSquare.size = {x:this.littleSquare.texture.width/1000,y:this.littleSquare.texture.height/1000*globalEnv.gameRatio};
            this.littleSquare.center = {x:0.85,y:0.37};

            this.nextBat = new Sprite();
            this.nextBat.texture = textureManager.batBlue_0;
            this.nextBat.size = {x:this.nextBat.texture.width/1000,y:this.nextBat.texture.height/1000*globalEnv.gameRatio};
            this.nextBat.center = {x:0.85,y:0.37};                

            this.textScore0_f = new MyText("SCORE",{x:0.5,y:0.27},40,"center");
            this.textScore1_f = new MyText("Piles collectées",{x:0.5,y:0.35},27,"center");
            this.valueScore_f = new MyText("",{x:0.5,y:0.4},30,"center");
            this.textCollectd_f = new MyText("Lignes de piles recyclées",{x:0.5,y:0.47},27,"center");
            this.valueCollectd_f = new MyText("",{x:0.5,y:0.52},30,"center");

            this.textScore = new MyText("Piles",{x:0.05,y:0.30},20,"left");
            this.textScore0 = new MyText("Collectées",{x:0.05,y:0.34},20,"left");
            this.valueScore = new MyText("0",{x:0.15,y:0.4},30,"center");
            this.textLines = new MyText("Lignes",{x:0.05,y:0.50},20,"left");
            this.textLines0 = new MyText("Recyclées",{x:0.05,y:0.54},20,"left");
            this.valueLines = new MyText("0",{x:0.15,y:0.6},30,"center");
            this.textLevel = new MyText("Level",{x:0.05,y:0.74},30,"left");
            this.valueLevel = new MyText("0",{x:0.15,y:0.8},30,"center");

            this.sound = {};
            this.sound.rot =  new Audio("assets/sounds/9084.mp3");
            this.sound.down = new Audio("assets/sounds/9085.mp3");
            this.sound.fall = new Audio("assets/sounds/9088.mp3");
            this.sound.end = new Audio("assets/sounds/end.wav");

        //#endregion

        //#region ___shapes
            this.shapes[10] = new BShape(textureManager.batGrey_0);
            this.shapes[10].modules = [{offsetX : 1, offsetY :  0}, {offsetX : 0, offsetY :  1}, {offsetX : 1, offsetY :  1}, {offsetX : 2, offsetY :  1}];
            this.shapes[10].rot = {x:1,y:0};

            this.shapes[11] = new BShape(textureManager.batGrey_1);
            this.shapes[11].modules = [{offsetX : 0, offsetY :  0}, {offsetX : 0, offsetY :  1}, {offsetX : 1, offsetY :  1}, {offsetX : 0, offsetY :  2}];
            this.shapes[11].rot = {x:-1,y:1};

            this.shapes[12] = new BShape(textureManager.batGrey_2);
            this.shapes[12].modules = [{offsetX : 0, offsetY :  0}, {offsetX : 1, offsetY :  0}, {offsetX : 1, offsetY :  1}, {offsetX : 2, offsetY :  0}];
            this.shapes[12].rot = {x:0,y:-1};

            this.shapes[13] = new BShape(textureManager.batGrey_3);
            this.shapes[13].modules = [{offsetX : 1, offsetY :  0}, {offsetX : 0, offsetY :  1}, {offsetX : 1, offsetY :  1}, {offsetX : 1, offsetY :  2}];
            this.shapes[13].rot = {x:0,y:0};

            this.shapes[20] = new BShape(textureManager.batBlue_0);
            this.shapes[20].modules = [{offsetX : 0, offsetY :  0}, {offsetX : 0, offsetY :  1}, {offsetX : 0, offsetY :  2}, {offsetX : 0, offsetY :  3}];
            this.shapes[20].rot = {x:-2,y:2};

            this.shapes[22] = this.shapes[20];

            this.shapes[21] = new BShape(textureManager.batBlue_1);
            this.shapes[21].modules = [{offsetX : 0, offsetY :  0}, {offsetX : 1, offsetY :  0}, {offsetX : 2, offsetY :  0}, {offsetX : 3, offsetY :  0}];
            this.shapes[21].rot = {x:2,y:-2};

            this.shapes[23] = this.shapes[21];

            this.shapes[30] = new BShape(textureManager.batOrange);
            this.shapes[30].modules = [{offsetX : 0, offsetY :  0}, {offsetX : 0, offsetY :  1}, {offsetX : 1, offsetY :  0}, {offsetX : 1, offsetY :  1}];
            this.shapes[30].rot = {x:0,y:0};

            this.shapes[31] = this.shapes[30];
            this.shapes[32] = this.shapes[30];
            this.shapes[33] = this.shapes[30];

            this.shapes[40] = new BShape(textureManager.batGreen_0);
            this.shapes[40].modules = [{offsetX : 1, offsetY :  0}, {offsetX : 2, offsetY :  0}, {offsetX : 0, offsetY :  1}, {offsetX : 1, offsetY :  1}];
            this.shapes[40].rot = {x:1,y:-1};

            this.shapes[42] = this.shapes[40];

            this.shapes[41] = new BShape(textureManager.batGreen_1);
            this.shapes[41].modules = [{offsetX : 0, offsetY :  0}, {offsetX : 0, offsetY :  1}, {offsetX : 1, offsetY :  1}, {offsetX : 1, offsetY :  2}];
            this.shapes[41].rot = {x:-1,y:1};

            this.shapes[43] = this.shapes[41];

            this.shapes[50] = new BShape(textureManager.batPurple_0);
            this.shapes[50].modules = [{offsetX : 0, offsetY :  0}, {offsetX : 1, offsetY :  0}, {offsetX : 1, offsetY :  1}, {offsetX : 2, offsetY :  1}];
            this.shapes[50].rot = {x:1,y:-1};

            this.shapes[52] = this.shapes[50];

            this.shapes[51] = new BShape(textureManager.batPurple_1);
            this.shapes[51].modules = [{offsetX : 1, offsetY :  0}, {offsetX : 1, offsetY :  1}, {offsetX : 0, offsetY :  1}, {offsetX : 0, offsetY :  2}];
            this.shapes[51].rot = {x:-1,y:1};

            this.shapes[53] = this.shapes[51];

            this.shapes[60] = new BShape(textureManager.batRed_0);
            this.shapes[60].modules = [{offsetX : 1, offsetY : 0}, {offsetX : 1, offsetY : 1}, {offsetX : 0, offsetY : 2}, {offsetX : 1, offsetY : 2}];
            this.shapes[60].rot = {x:0,y:1};

            this.shapes[61] = new BShape(textureManager.batRed_1);
            this.shapes[61].modules = [{offsetX : 0, offsetY : 0}, {offsetX : 0, offsetY : 1}, {offsetX : 1, offsetY : 1}, {offsetX : 2, offsetY : 1}];
            this.shapes[61].rot = {x:0,y:0};

            this.shapes[62] = new BShape(textureManager.batRed_2);
            this.shapes[62].modules = [{offsetX : 0, offsetY : 0}, {offsetX : 1, offsetY : 0}, {offsetX : 0, offsetY : 1}, {offsetX : 0, offsetY : 2}];
            this.shapes[62].rot = {x:-1,y:0};

            this.shapes[63] = new BShape(textureManager.batRed_3);
            this.shapes[63].modules = [{offsetX : 0, offsetY : 0}, {offsetX : 1, offsetY : 0}, {offsetX : 2, offsetY : 0}, {offsetX : 2, offsetY : 1}];
            this.shapes[63].rot = {x:1,y:-1};

            this.shapes[70] = new BShape(textureManager.batNavy_0);
            this.shapes[70].modules = [{offsetX : 0, offsetY : 0}, {offsetX : 0, offsetY : 1}, {offsetX : 0, offsetY : 2}, {offsetX : 1, offsetY : 2}];
            this.shapes[70].rot = {x:0,y:1};

            this.shapes[71] = new BShape(textureManager.batNavy_1);
            this.shapes[71].modules = [{offsetX : 0, offsetY : 0}, {offsetX : 1, offsetY : 0}, {offsetX : 2, offsetY : 0}, {offsetX : 0, offsetY : 1}];
            this.shapes[71].rot = {x:0,y:0};

            this.shapes[72] = new BShape(textureManager.batNavy_2);
            this.shapes[72].modules = [{offsetX : 0, offsetY : 0}, {offsetX : 1, offsetY : 0}, {offsetX : 1, offsetY : 1}, {offsetX : 1, offsetY : 2}];
            this.shapes[72].rot = {x:-1,y:1};

            this.shapes[73] = new BShape(textureManager.batNavy_3);
            this.shapes[73].modules = [{offsetX : 2, offsetY : 0}, {offsetX : 0, offsetY : 1}, {offsetX : 1, offsetY : 1}, {offsetX : 2, offsetY : 1}];
            this.shapes[73].rot = {x:1,y:-1};


        //#endregion

        //#region ___StateMachine
            this.stateMachine = {
                NewGame: {
                    Enter: function(){
                        globalEnv.objectToRender = [];
                        inputManager.ClearClick();
                        inputManager.ClearKey();
                        globalEnv.arrowLeft.center = {x:0.75,y:0.7};
                        globalEnv.arrowRight.center = {x:0.95,y:0.7};
                        globalEnv.buttonHome.center = {x:0.15,y:0.12};
                        globalEnv.buttonPause.center = {x:0.85,y:0.12};
                        tetripile.score = 0;
                        tetripile.level = 1;
                        tetripile.lines = 0;
                        tetripile.batLanded = 0;
                        tetripile.fromPause = false;
                        tetripile.map =  [[000,000,000,000,000,000,000,000,000,000],
                                [000,000,000,000,000,000,000,000,000,000],
                                [000,000,000,000,000,000,000,000,000,000],
                                [000,000,000,000,000,000,000,000,000,000],
                                [000,000,000,000,000,000,000,000,000,000],
                                [000,000,000,000,000,000,000,000,000,000],
                                [000,000,000,000,000,000,000,000,000,000],
                                [000,000,000,000,000,000,000,000,000,000],
                                [000,000,000,000,000,000,000,000,000,000],
                                [000,000,000,000,000,000,000,000,000,000],
                                [000,000,000,000,000,000,000,000,000,000],
                                [000,000,000,000,000,000,000,000,000,000],
                                [000,000,000,000,000,000,000,000,000,000],
                                [000,000,000,000,000,000,000,000,000,000],
                                [000,000,000,000,000,000,000,000,000,000],
                                [000,000,000,000,000,000,000,000,000,000],
                                [000,000,000,000,000,000,000,000,000,000],
                                [000,000,000,000,000,000,000,000,000,000],
                                [000,000,000,000,000,000,000,000,000,000]];
                    },
                    Update: function(timer){
                        ChangeState(tetripile.stateMachine.Play);
                    },
                    name: "game : Tetripile, state : Newgame"
                },
                Play: {
                    Enter: function(){
                        globalEnv.objectToRender = [];
                        inputManager.ClearClick();
                        inputManager.ClearKey();
                        globalEnv.objectToRender.push(tetripile.bigSquare);
                        globalEnv.objectToRender.push(tetripile.littleSquare);
                        globalEnv.objectToRender.push(tetripile.nextBat);
                        globalEnv.objectToRender.push(tetripile.mapRender);
                        globalEnv.objectToRender.push(tetripile.textScore);
                        globalEnv.objectToRender.push(tetripile.textScore0);
                        globalEnv.objectToRender.push(tetripile.valueScore);
                        globalEnv.objectToRender.push(tetripile.textLines);
                        globalEnv.objectToRender.push(tetripile.textLines0);
                        globalEnv.objectToRender.push(tetripile.valueLines);
                        globalEnv.objectToRender.push(tetripile.textLevel);
                        globalEnv.objectToRender.push(tetripile.valueLevel);
                        globalEnv.objectToRender.push(globalEnv.corepile);
                        globalEnv.objectToRender.push(globalEnv.arrowLeft);
                        globalEnv.objectToRender.push(globalEnv.arrowRight);
                        globalEnv.objectToRender.push(globalEnv.arrowDown);
                        globalEnv.objectToRender.push(globalEnv.arrowRot);
                        globalEnv.objectToRender.push(globalEnv.buttonHome);
                        globalEnv.objectToRender.push(globalEnv.buttonPause);
                        inputManager.keyDown["ArrowLeft"] = tetripile.tryMoveLeft;
                        inputManager.keyRepeat["ArrowLeft"] = tetripile.tryMoveLeft;
                        inputManager.keyDown["ArrowRight"] = tetripile.tryMoveRight;
                        inputManager.keyRepeat["ArrowRight"] = tetripile.tryMoveRight;
                        inputManager.keyDown["ArrowUp"] = tetripile.tryRotate;
                        inputManager.keyDown["ArrowDown"] = function(){tetripile.tryMoveDown(); tetripile.score += tetripile.level};
                        inputManager.keyRepeat["ArrowDown"] = function(){tetripile.tryMoveDown(); tetripile.score += tetripile.level};
                        globalEnv.arrowLeft.clickable.onClick = tetripile.tryMoveLeft;
                        globalEnv.arrowRight.clickable.onClick = tetripile.tryMoveRight;
                        globalEnv.arrowDown.clickable.onClick = tetripile.tryMoveDown;
                        globalEnv.arrowRot.clickable.onClick = tetripile.tryRotate;
                        inputManager.clickDown.push(globalEnv.arrowLeft);
                        inputManager.clickDown.push(globalEnv.arrowRight);
                        inputManager.clickDown.push(globalEnv.arrowDown);
                        inputManager.clickDown.push(globalEnv.arrowRot);
                        inputManager.clickRepeat.push(globalEnv.arrowLeft);
                        inputManager.clickRepeat.push(globalEnv.arrowRight);
                        inputManager.clickRepeat.push(globalEnv.arrowDown);

                        inputManager.keyDown[" "] = function(){ChangeState(tetripile.stateMachine.Pause)}
                        inputManager.clickDown.push(globalEnv.buttonHome);
                        globalEnv.buttonPause.clickable.onClick = function(){ChangeState(tetripile.stateMachine.Pause)};
                        inputManager.clickDown.push(globalEnv.buttonHome);
                        inputManager.clickDown.push(globalEnv.buttonPause);

                        if (tetripile.fromPause == false)
                            tetripile.AddNewBat();
                        else
                            tetripile.fromPause = false
                        globalEnv.timer = 0;
                    },
                    Update: function(timer){
                        tetripile.valueScore.text = tetripile.batLanded ;
                        tetripile.valueLevel.text = tetripile.level;
                        tetripile.valueLines.text = tetripile.lines;
                        if (timer > (1000 /(1.06 * tetripile.level))){
                            globalEnv.timer = 0;
                            tetripile.tryMoveDown();
                        }
                    },
                    name: "game : Tetripile, state : Play"
                },
                Landed: {
                    Enter: function(){
                        inputManager.ClearKey();
                        inputManager.ClearClick();
                        tetripile.lineCompleted = tetripile.LineCompleted();
                        tetripile.sound.down.play();
                        tetripile.batLanded += 1;
                        tetripile.valueScore.text = tetripile.batLanded ;

                        if (tetripile.lineCompleted.length > 0){
                            if (tetripile.lineCompleted.length == 4){
                                tetripile.batLanded *= 2;
                            }
                            ChangeState(tetripile.stateMachine.Blinking)
                        }
                        else{
                            ChangeState(tetripile.stateMachine.Play)
                        }
                    },
                    Update: null,
                    name: "game: Tetripile, state: Landed"
                },
                Blinking: {
                    Enter: function(){
                        tetripile.mapSavedfull = JSON.parse(JSON.stringify(tetripile.map));
                        tetripile.RemoveLine();                                                
                        tetripile.mapSavedEmpty = JSON.parse(JSON.stringify(tetripile.map));
                        tetripile.map = tetripile.mapSavedfull;
                        globalEnv.timer = 0;
                    },
                    Update: function(timer){
                        if (timer == 40 || timer == 120 || timer == 200){
                            tetripile.map = tetripile.mapSavedEmpty;
                        }
                        else if (timer == 80 || timer == 160){
                            tetripile.map = tetripile.mapSavedfull;
                        }
                        else if (timer >= 240){
                            ChangeState(tetripile.stateMachine.GoDown)
                        }
                    },
                    name: "game: Tetripile, state: Blinking"
                },
                GoDown: {
                    Enter: function(){
                        tetripile.AllGoDown();
                        ChangeState(tetripile.stateMachine.Play)
                    },
                    Update: null,
                    name: "game: Tetripile, state: GoDown"
                },
                GameOver: {
                    Enter: function(){
                        inputManager.ClearKey();
                        inputManager.ClearClick();
                        globalEnv.objectToRender.push(globalEnv.mediumSquare);
                        globalEnv.objectToRender.push(globalEnv.buttonRestart);
                        globalEnv.objectToRender.push(globalEnv.buttonShare);
                        globalEnv.objectToRender.push(globalEnv.textShare);
                        inputManager.clickDown.push(globalEnv.buttonRestart);
                        inputManager.clickDown.push(globalEnv.buttonShare);
                        globalEnv.objectToRender.push(tetripile.textScore0_f);
                        globalEnv.objectToRender.push(tetripile.textScore1_f);
                        tetripile.valueScore_f.text = tetripile.batLanded;
                        tetripile.valueCollectd_f.text = tetripile.lines;
                        globalEnv.objectToRender.push(tetripile.valueCollectd_f);
                        globalEnv.objectToRender.push(tetripile.textCollectd_f);
                        globalEnv.objectToRender.push(tetripile.valueScore_f);
                        tetripile.sound.end.play();
                    },
                    Update: function(timer){},
                    name: "game: Tetripile, state: GameOver"
                },
                Pause: {
                    Enter: function(){
                        inputManager.ClearClick();
                        inputManager.ClearKey();
                        inputManager.keyDown[" "] = function(){ChangeState(tetripile.stateMachine.Play)}
                        inputManager.clickDown.push(globalEnv.buttonHome);
                        globalEnv.buttonPause.clickable.onClick = function(){ChangeState(tetripile.stateMachine.Play)};
                        inputManager.clickDown.push(globalEnv.buttonHome);
                        inputManager.clickDown.push(globalEnv.buttonPause);
                        tetripile.fromPause = true;
                    },
                    Update: null,
                    name: "game: Tetripile, state: Pause"
                }
            }
        //#endregion

        //#region ___Methodes
            this.AddNewBat = function(that=this){
                if (that.nextNum == 0)
                    that.nextNum = (Math.floor(Math.random() * 7) + 1) * 10;
                that.curNum = that.nextNum;
                that.nextNum = (Math.floor(Math.random() * 7) + 1) * 10;
                that.nextBat.texture = that.shapes[that.nextNum].texture;
                that.nextBat.size = {x:this.nextBat.texture.width/1000,y:this.nextBat.texture.height/1000*globalEnv.gameRatio};
                if (that.curShape().canGo(4,0)){
                    that.curPos = {x:4,y:0};
                    that.curShape().PutBat();
                }
                else{
                    ChangeState(tetripile.stateMachine.GameOver);
                }
            }

            this.mapRender = {};
            this.mapRender.render = function () {
                for (var i = 0; i < 10; i++) {
                    for (var j = 0; j < 19; j++) {
                        if (tetripile.map[j][i] != 0) {
                            var magicNumber = Math.abs(tetripile.map[j][i]);
                            globalEnv.ctx.drawImage(
                                tetripile.shapes[Math.trunc(magicNumber / 10)].texture.img,
                                tetripile.shapes[Math.trunc(magicNumber / 10)].modules[magicNumber % 10].offsetX * 36,
                                tetripile.shapes[Math.trunc(magicNumber / 10)].modules[magicNumber % 10].offsetY * 36,
                                36,
                                36,
                                (tetripile.bigSquare.center.x + tetripile.bigSquare.size.x * (34/428 - 1/2 + i * 36/428)) * globalEnv.canvas.width,
                                (tetripile.bigSquare.center.y + tetripile.bigSquare.size.y *( j * 36/720 - 1/2 + 1/720) ) * globalEnv.canvas.height,
                                tetripile.bigSquare.size.x * 36/428 * globalEnv.canvas.width,
                                tetripile.bigSquare.size.y * 36/720 * globalEnv.canvas.height);
                        }
                    }
                }
            }

            this.tryMoveDown = function(){
                if (tetripile.curShape().canGoDown())
                {
                    tetripile.curShape().RemoveBat();
                    tetripile.curPos.y += 1;
                    tetripile.curShape().PutBat();
                }
                else
                {
                    tetripile.curShape().StopBat();
                    ChangeState(tetripile.stateMachine.Landed);
                }
            }

            this.tryMoveRight = function() {
                if (tetripile.curShape().canGoRight()) {
                    tetripile.curShape().RemoveBat();
                    tetripile.curPos.x += 1;
                    tetripile.curShape().PutBat();
                }
            }

            this.tryMoveLeft = function() {
                if (tetripile.curShape().canGoLeft()) {
                    tetripile.curShape().RemoveBat();
                    tetripile.curPos.x -= 1;
                    tetripile.curShape().PutBat();
                }
            }

            this.tryRotate = function() {
                if (tetripile.curShape().canGoRotate()) {
                    tetripile.curShape().RemoveBat();
                    tetripile.curPos.x += tetripile.curShape().rot.x;
                    tetripile.curPos.y += tetripile.curShape().rot.y;
                    tetripile.curNum = Math.trunc(tetripile.curNum / 10) * 10 + (((tetripile.curNum % 10) + 1) % 4)
                    tetripile.curShape().PutBat();
                    tetripile.sound.rot.pause();
                    tetripile.sound.rot.currentTime = 0;
                    tetripile.sound.rot.play();
                }
            }

            this.LineCompleted = function () {
                var ret = [];

                for (var j = 0; j < 19; j++) {
                    var lineCompleted = true;
                    for (var i = 0; i < 10; i++) {
                        if (tetripile.map[j][i] >= 0) {
                            lineCompleted = false;
                        }
                    }
                    if (lineCompleted) {
                        tetripile.score += 10 * tetripile.level;
                        tetripile.lines += 1
                        if (tetripile.lines % 6 == 0 && tetripile.level < 10) {
                            tetripile.level += 1;
                        }
                        ret.push(j);
                    }
                }
                return ret;
            }

            this.RemoveLine = function(){
                for (var k = 0; k < tetripile.lineCompleted.length; k++){
                    for (var i = 0; i < 10; i++){
                        tetripile.map[tetripile.lineCompleted[k]][i] = 0
                    }   
                }
            }

            this.AllGoDown = function(){
                for (k = 0; k < tetripile.lineCompleted.length; k++) {
                    for (var j = 18; j >= 0; j--) {
                        for (var i = 0; i < 10; i++) {
                            if (j < tetripile.lineCompleted[k]) {
                                tetripile.map[j + 1][i] = tetripile.map[j][i];
                                tetripile.map[j][i] = 0;
                            }
                        }
                    }
                }
                
            tetripile.sound.down.pause();
            tetripile.sound.down.currentTime = 0;
            tetripile.sound.fall.play();
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
                window.location = ".."
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
        inputManager.CheckClick(x,y);
    }

    this.TouchDown = function(event){
        var rect = globalEnv.canvas.getBoundingClientRect();
        var touchobj = event.changedTouches[0]; 
        var x = parseInt(touchobj.clientX-rect.left)/globalEnv.canvas.width; 
        var y = parseInt(touchobj.clientY-rect.top)/globalEnv.canvas.height; 
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
var tetripile = new Tetripile();
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
    ChangeGame(tetripile);
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