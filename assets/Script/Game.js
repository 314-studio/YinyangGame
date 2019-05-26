// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

//Game全局类，控制和调动整个游戏的行为
cc.Class({
    extends: cc.Component,

    properties: {
        debug: true,

        touchPad: {
            default: null,
            type: cc.Prefab
        },

        slidingTrack: {
            default: null,
            type: cc.Node
        },

        scoreDisplay: {
            default: null,
            type: cc.Label
        },

        halo:{
            default: null,
            type: cc.Prefab
        },

        yinyangFluid: {
            default: null,
            type: cc.Node
        },

        camera: {
            default: null,
            type: cc.Node
        },

        progressBar: {
            default: null,
            type: cc.Node
        },

        touchPadNode: {
            default: null,
            type: cc.Node
        },

        wechatRanking: {
            default: null,
            type: cc.Node
        },

        velocityMapping: true,

        difficulty: 'D',

        distanceMappingCoef: 5
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;

        this.initUI();

        //初始化触摸节点
        var windowSize = cc.winSize;
        Global.debug = this.debug;
        Global.radius = Math.round(windowSize.height / 4);
        this.yinControlPad = cc.instantiate(this.touchPad);
        this.yangControlPad = cc.instantiate(this.touchPad);

        this.yinControlPad.parent = this.touchPadNode;
        this.yangControlPad.parent = this.touchPadNode;

        this.yinControlPad.setPosition(-windowSize.width / 4, 0);
        this.yangControlPad.setPosition(windowSize.width / 4, 0);

        if (Global.debug) {
            cc.log("右触摸节点x位置：", this.yangControlPad.getPosition().x,
                this.yangControlPad.getPosition().y);
            cc.log("右触摸节点大小：", this.yangControlPad.width,
                this.yangControlPad.height);
            manager.enabledDebugDraw = true;
        }

        this.slidingTrackScript = this.slidingTrack.getComponent("SlidingTrack");
        this.yinControlPadScript = this.yinControlPad.getComponent("TouchPad");
        this.yangControlPadScript = this.yangControlPad.getComponent("TouchPad");

        this.yinControlPadScript.slidingTrack = this.slidingTrack;
        this.yangControlPadScript.slidingTrack = this.slidingTrack;
        this.yinControlPadScript.game = this;
        this.yangControlPadScript.game = this;
        this.yinControlPadScript.thisIsYinTouchPad();

        //加载音乐与节拍
        this.levelSongLoaded = false;
        this.beginTempoCount = false;
        this.tempoCount = 0;
        this.loadMusicAndTempo(this.difficulty);
        this.songEnded = false;
        this.lastTempo = false;

        //得分
        this.score = 0;
        this.cameraScript = this.camera.getComponent("CameraControl");

        this.levelCount = 0;
        this.progressBar.getComponent("ProgressBar").game = this;
    },

    start () {
        this.gameStarted = false;
        this.touching = false;
        cc.log(cc.sys.dump());
        this.deltaTime = 0;
        this.haloEmergeAnimDuration = this.halo.data.getComponent(cc.Animation).defaultClip.duration;
        //this.haloEmergeAnimDuration = 1.3;

        if (Global.debug) {
            this.scoreDisplay.string = Global.radius;
        }

        // this.scheduleOnce(function() {
        //     this.playCutsceneAnim();
        // }, 5);
    },

    update (dt) {
        if (this.levelSongLoaded && this.gameStarted) {
            this.startNextLevel();
            this.levelSongLoaded = false;
        }
        this.generateHalo(dt);

        //如果音乐播放结束，说明用户还没死，进入下一关
        if (this.songEnded) {
            this.loadNextLevelSong();
            this.songEnded = false;
        }
    },

    startGame () {
        // cc.tween(this.slidingTrack)
        //     .to(1, {scale: 1.4}, { easing: 'quadInOut'})
        //     .start();
        // cc.tween(this.yinyangFluid)
        //     .to(1, {scale: 1.4}, { easing: 'quadInOut'})
        //     .start();
    },

    startNextLevel () {
        this.audioID = cc.audioEngine.play(this.music, false, 1);
        this.beginTempoCount = true;
        this.yinyangFluid.getComponent("YinyangFluid").startGame();
        this.slidingTrackScript.playOpeningAnimation(false);
        this.levelCount++;
        this.progressBar.getComponent("ProgressBar").bulidProgressBar(this.tempo.length);
    },

    loadNextLevelSong () {
        this.loadMusicAndTempo('A');
    },

    endGame () {
        //播放结束动画与显示结束后的UI
        this.gameStarted = false;
        this.yinyangFluid.getComponent("YinyangFluid").gameStarted = false;
        this.slidingTrackScript.resetYinyangPosition();
        this.slidingTrackScript.playOpeningAnimation(true);
        cc.audioEngine.stop(this.audioID);
        this.stopGenerateHalo();
        this.wechatRanking.getComponent("RankingView").showRanking();
    },

    stopGenerateHalo () {
        //重置节拍计数
        this.tempoCount++;
        this.lastTempo = false;
        this.deltaTime = 0;
        this.tempoCount = 0;
        this.beginTempoCount = false;
    },

    generateHalo (dt) {
        //随音乐节拍生成光环
        if (this.beginTempoCount) {
            this.deltaTime += dt;
            if (this.deltaTime >= this.tempo[this.tempoCount] - this.haloEmergeAnimDuration) {
                if (this.lastTempo) {
                    this.beginTempoCount = false;
                    let haloH  = cc.instantiate(this.halo);
                    let haloL = cc.instantiate(this.halo);
                    haloH.parent = this.node;
                    haloL.parent = this.node;
                    haloH.getComponent("Halo").setSlidingTrack(this.slidingTrack);
                    haloL.getComponent("Halo").setSlidingTrack(this.slidingTrack);
                    haloH.getComponent("Halo").game = this;
                    haloL.getComponent("Halo").game = this;

                    haloH.setPosition(0, Global.radius);
                    haloL.setPosition(0, -Global.radius);

                    //重置节拍计数
                    this.tempoCount++;
                    this.lastTempo = false;
                    this.deltaTime = 0;
                    this.tempoCount = 0;

                    //歌曲最后的两个环出现，歌曲结束，停止出圈与计分
                    if (this.levelCount != 0) {
                        this.playCutsceneAnim();
                    }
                    this.beginTempoCount = false;
                } else {
                    let pos = this.slidingTrackScript.generateRamdomHaloPositon(Global.radius);
                    let halo = cc.instantiate(this.halo);
                    halo.parent = this.node;
                    var haloScript = halo.getComponent("Halo");
                    haloScript.setSlidingTrack(this.slidingTrack);
                    haloScript.game = this;

                    var rand = Math.random();
                    if (rand < 0.5) {
                        halo.setPosition(pos);
                        haloScript.play(true);
                    } else {
                        halo.setPosition(-pos.x, pos.y);
                        haloScript.play(false);
                    }
                    this.tempoCount++;
                }
            }

            if (this.tempoCount == this.tempo.length - 1) {
                this.lastTempo = true;
            }
        }
    },

    playCutsceneAnim () {
        this.yinyangFluid.getComponent("YinyangFluid").cutsceneAnimPlaying = true;
        this.scheduleOnce(function() {
            this.cameraScript.shakeLong();
        }, 1);
        this.scheduleOnce(function() {
            this.cameraScript.rotate(20);
            this.deltaTime = 0;
            //todo: 音乐结束的时间问题
            //this.songEnded = true;
        }, 12);
    },

    gainScore (hittedPosY) {
        // TODO: 判断平台，处理震动效果
        if (cc.sys.isMobile) {
            wx.vibrateShort({
                success: function () {
                    console.log('震动成功！');
                }
            });
        }

        this.cameraScript.shake();

        this.score += 1;
        this.scoreDisplay.string = this.score;
    },

    loadMusicAndTempo (difficulty) {
        let self = this;
        cc.loader.loadRes('Musics/Limousine', cc.AudioClip, function (err, music) {
            if (err) {
                cc.error(err);
                return;
            }
            self.music = music;
            self.levelSongLoaded = true;
        });
        cc.loader.loadRes('Json/Limousine', function (err, tempo) {
            var tempo = tempo.json;
            var test_tempo = new Array();
            switch(difficulty) {
                case "D":
                    for (var i = 0; i < tempo.length; i++) {
                        if (tempo[i][1] == self.difficulty) {
                            test_tempo.push(tempo[i][0]);
                        }
                    }
                    break;
                case "A":
                    for (var i = 0; i < tempo.length; i++) {
                        if (tempo[i][1] != "S" ) {
                            test_tempo.push(tempo[i][0]);
                        }
                    }
                    break;
                case "S":
                    for (var i = 0; i < tempo.length; i++) {
                        test_tempo.push(tempo[i][0]);
                    }
                    break;
            }
            self.tempo = test_tempo;
        });
    },

    initUI () {
        
    },
});
