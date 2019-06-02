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

        slidingTrack: {
            default: null,
            type: cc.Node
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

        wechatRanking: {
            default: null,
            type: cc.Node
        },

        uiNode: {
            default: null,
            type: cc.Node
        },

        touchPad: {
            default: null,
            type: cc.Node
        },

        gamePauseView: {
            default: null,
            type: cc.Node
        },

        bagua: {
            default: null,
            type: cc.Prefab
        },

        songs: {
            default: null,
            type: cc.JsonAsset
        },

        velocityMapping: true,

        difficulty: 'D',
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        //点击来操作小球时不需要检测碰撞
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;

        //初始化触摸节点
        var windowSize = cc.winSize;
        Global.debug = this.debug;
        Global.radius = Math.round(windowSize.height / 4);

        this.slidingTrackScript = this.slidingTrack.getComponent("SlidingTrack");

        //todo: 删除
        this.slidingTrackScript.game = this;


        //加载音乐与节拍
        this.levelSongLoaded = false;
        this.beginGenerateHalo = false;
        this.tempoCount = 0;
        this.levelEnded = false;

        //得分
        this.score = 0;
        this.cameraScript = this.camera.getComponent("CameraControl");
        this.scoreDisplay = this.uiNode.getChildByName("Score").getComponent(cc.Label);
        this.musicNameDisplay = this.uiNode.getChildByName("MusicName").getComponent(cc.Label);

        this.levelCount = 0;
        this.progressBar.getComponent("ProgressBar").game = this;

        this.gamePauseView.active = false;
        this.gamePauseView.setContentSize(cc.winSize.width, cc.winSize.height);
        this.gamePauseView.on('touchend', function (event) {
            this.resumeGame(false);
        }, this);

        //settings layout
        this.gamePauseView.getChildByName("layout").getComponent("Settings").game = this;
        this.musicOffset = 0;

        //combo和得分倍数
        this.comboNode = this.uiNode.getChildByName("Combo");
        this.comboNode.active = false;
        this.combo = 0;
        this.magnificationNode = this.uiNode.getChildByName("Magnification");
        this.magnificationNode.active = false;
        this.magnification = 1;
    },

    start () {
        //游戏没开始时，UI不显示
        this.uiNode.getComponent("UIControl").game = this;
        this.uiNode.active = false;

        //this.gameStarted = false;
        //touching用来做暂停效果
        this.touching = false;
        cc.log(cc.sys.dump());
        this.deltaTime = 0;
        this.haloEmergeAnimDuration = 
            this.halo.data.getComponent(cc.Animation).defaultClip.duration - 0.4;

        //debug
        // this.scheduleOnce(function() {
        //     this.playCutsceneAnim();
        // }, 2);

        this.loadNextLevelSong();

        this.right = true;
        this.beginTempoCount = false;

        this.vibrationEnabled = true;
    },

    update (dt) {
        if (this.levelSongLoaded && Global.gameStarted) {
            this.startNextLevel();
            this.levelSongLoaded = false;
        }
        this.generateHalo(dt);

        //如果音乐播放结束，说明用户还没死，进入下一关
        if (this.levelEnded) {
            this.loadNextLevelSong();
            this.levelEnded = false;
        }
    },

    startNextLevel () {
        cc.audioEngine.stop(this.audioEngine);
        this.audioID = cc.audioEngine.play(this.music, false, 1);
        this.beginGenerateHalo = true;
        this.yinyangFluid.getComponent("YinyangFluid").startGame();
        this.slidingTrackScript.playOpeningAnimation(false);
        this.levelCount++;
        this.progressBar.getComponent("ProgressBar").bulidProgressBar(this.tempo.length);

        this.uiNode.active = true;
        this.combo = 0;
        this.magnification = 1;
    },

    loadNextLevelSong () {
        var songs = this.songs.json;
        var musicName = "";
        var singerLabel = this.uiNode.getChildByName("Singer").getComponent(cc.Label);

        if (this.levelCount < songs.length) {
            musicName = songs[this.levelCount].name;
            singerLabel.string = songs[this.levelCount].author;
        } else {
            var count = Math.round(Math.random() * (this.songs.length - 1));
            musicName = songs[count].name;
            singerLabel.string = songs[count].author;
        }

        this.musicNameDisplay.string = musicName;
        var difficulty = 'D';
        if (musicName == "Limousine") {
            difficulty = 'S';
            singerLabel.string = " ";
        }

        this.loadMusicAndTempo(musicName, difficulty);
    },

    endGame () {
        //播放结束动画与显示结束后的UI
        Global.gameStarted = false;
        //this.yinyangFluid.getComponent("YinyangFluid").gameStarted = false;
        this.slidingTrackScript.resetYinyangPosition();
        this.slidingTrackScript.playOpeningAnimation(true);
        cc.audioEngine.stop(this.audioID);
        this.stopGenerateHalo();

        //提交并显示得分
        this.wechatRanking.getComponent("RankingView").showRanking(this.score);
        this.levelCount = 0;

        this.uiNode.getComponent("UIControl").pauseBtn.active = false;
    },

    restartGame () {
        //重置关卡
        this.levelCount = 0;
        this.stopGenerateHalo();

        this.wechatRanking.active = false;
        this.uiNode.getComponent("UIControl").pauseBtn.active = true;
        this.progressBar.getComponent("ProgressBar").clear();
        this.uiNode.active = false;
        this.loadNextLevelSong();

        //重置得分
        this.score = 0;
        this.scoreDisplay.string = this.getScoreString(this.score);
        this.combo = 0;
        this.magnification = 1;
    },

    pauseGame (showPauseView) {
        cc.audioEngine.pause(this.audioID);
        this.uiNode.getChildByName("Pause").active = false;
        var halos = this.touchPad.getComponent("ClickPad").halos;
        for (let i = 0; i < halos.length; i++) {
            if (halos[i].active) {
                halos[i].getComponent(cc.Animation).pause();
            }
        }
        if (showPauseView) {
            this.gamePauseView.active = true;
        }
        this.uiNode.getComponent("UIControl").restartGameBtn.active = false;
    },

    resumeGame (rightAway) {
        var delay = 0.5;
        if (rightAway) {
            delay = 0;
        }
        
        this.uiNode.getChildByName("Pause").active = true;
        this.gamePauseView.active = false;
        var halos = this.touchPad.getComponent("ClickPad").halos;
        this.scheduleOnce(function() {
            cc.audioEngine.resume(this.audioID);
            for (let i = 0; i < halos.length; i++) {
                if (halos[i].active) {
                    if (rightAway) {
                        halos[i].destroy();
                    }
                    halos[i].getComponent(cc.Animation).resume();
                }
            }
        }, delay);
        this.uiNode.getComponent("UIControl").restartGameBtn.active = true;
    },

    stopGenerateHalo () {
        //重置节拍计数
        this.deltaTime = 0;
        this.tempoCount = 0;
        this.beginGenerateHalo = false;
    },

    generateHalo (dt) {
        //随音乐节拍生成光环
        if (this.beginGenerateHalo) {
            var playedTime = cc.audioEngine.getCurrentTime(this.audioID);
            //this.deltaTime += dt;
            if (playedTime >= this.tempo[this.tempoCount] - 
                    this.haloEmergeAnimDuration + this.musicOffset) {
                //todo: 更改clickpad
                var touchPadControl = this.touchPad.getComponent("ClickPad"); //判定点击击中光环

                let pos = this.slidingTrackScript.generateRamdomHaloPositon(Global.radius);
                let halo = cc.instantiate(this.halo);
                halo.parent = this.slidingTrack;
                touchPadControl.addHalo(halo);
                var haloScript = halo.getComponent("Halo");
                haloScript.setSlidingTrack(this.slidingTrack);
                haloScript.game = this;

                //var rand = Math.random();
                if (this.right) {
                    halo.setPosition(pos);
                    haloScript.play(true);
                    this.right = false;
                } else {
                    halo.setPosition(-pos.x, pos.y);
                    haloScript.play(false);
                    this.right = true;
                }
                this.tempoCount++;
            }

            if (this.tempoCount == this.tempo.length) {
                this.beginGenerateHalo = false;

                //重置节拍计数
                this.deltaTime = 0;
                this.tempoCount = 0;

                this.scheduleOnce(function() {
                    //歌曲最后的两个环出现，歌曲结束，停止出圈与计分
                    if (this.levelCount != 0) {
                        this.playCutsceneAnim();
                    }
                }, this.haloEmergeAnimDuration + 1);
            }
        }
    },

    playCutsceneAnim () {
        this.uiNode.active = false;
        this.touchPad.active = false;

        this.yinyangFluid.getComponent("YinyangFluid").cutsceneAnimPlaying = true;
        // this.scheduleOnce(function() {
        //     this.cameraScript.shakeLong();
        // }, 1);
        var bagua = null;
        this.scheduleOnce(function() {
            bagua = cc.instantiate(this.bagua);
            bagua.parent = this.node;
        }, 1);
        this.scheduleOnce(function() {
            this.slidingTrackScript.moveEyetoYinyang();
            this.cameraScript.playCutsceneAnim(true);
            this.progressBar.getComponent("ProgressBar").clear();
            //this.cameraScript.rotate(10);
            var duration = 4;
            cc.tween(this.yinyangFluid)
            .by(duration, {angle: 720})
            .repeat(3)
            .start();
            cc.tween(this.slidingTrack)
            .by(duration, {angle: 720})
            .repeat(3)
            .start();
            this.deltaTime = 0;
        }, 4);
        this.scheduleOnce(function() {
            //bagua.getComponent(cc.Animation).defaultClip.wrapMode = cc.WrapMode.Reverse;
            bagua.getComponent(cc.Animation).play("BaGua_reverse");
        }, 15);
        this.scheduleOnce(function() {
            //todo: 音乐结束的时间问题
            this.levelEnded = true;
            this.yinyangFluid.getComponent("YinyangFluid").cutsceneAnimPlaying = false;

            this.touchPad.active = true;
        }, 16);
    },

    gainScore (score) {
        //判断平台，处理震动效果
        if (this.vibrationEnabled) {
            if (cc.sys.platform == cc.sys.WECHAT_GAME) {
                wx.vibrateShort({
                    success: function () {
                        console.log('震动成功！');
                    }
                });
            }
        }

        this.cameraScript.shake();

        if (this.magnification > 0) {
            this.score += score * this.magnification;
        }
        this.scoreDisplay.string = this.getScoreString(this.score);
    },

    getScoreString (score) {
        var count = 0;
        var temp = score;
        while (temp >= 1) {
            temp /= 10
            count++;
        }

        if (count == 0) {
            return "0000" + score;
        } else if (count == 1) {
            return "000" + score;
        } else if (count == 2) {
            return "00" + score;
        } else if (count == 3) {
            return "0" + score;
        } else {
            return score;
        }
    },

    loadMusicAndTempo (musicName, difficulty) {
        var musicUrl = 'Musics/' + musicName + ".mp3";
        var jsonUrl = 'Json/' + musicName;
        if (musicName == "Limonsine") {
            musicUrl = 'Music/' + musicName + ".wav";
        }
        let self = this;
        cc.loader.loadRes(musicUrl, cc.AudioClip, function (err, music) {
            if (err) {
                cc.error(err);
                return;
            }
            self.music = music;
            self.levelSongLoaded = true;
        });
        cc.loader.loadRes(jsonUrl, function (err, tempo) {
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

    setMusicPlayOffset (offset) {
        this.musicOffset = offset;
    },

    calComboByHit (hitted) {
        //var comboLabel = this.comboNode.getComponent(cc.Label);
        if (hitted) {
            this.combo++;
        } else {
            this.combo = 0;
            cc.tween(this.comboNode)
                .to(1, {opacity: 0})
                .call(() => {this.comboNode.active = false})
                .start();
            this.magnification = 1;
            this.onMagnificationChange();
        }
        this.comboNode.getComponent(cc.Label).string = "Combo: " + this.combo;
        if (this.combo >= 4) {
            if (!this.comboNode.active) {
                this.comboNode.active = true;
                this.comboNode.runAction(cc.fadeIn(1.0));
            }
            cc.tween(this.comboNode)
            .to(0.2, {scale: 2})
            .to(0.2, {scale: 1})
            .start();

            if (this.combo >= this.magnification * 8) {
                this.magnification++;
                this.onMagnificationChange();
            }
        }
    },

    onMagnificationChange () {
        if (this.magnification > 1) {
            if (!this.magnificationNode.active) {
                this.magnificationNode.active = true;
                this.magnificationNode.runAction(cc.fadeIn(1.0));
            }
            cc.tween(this.magnificationNode)
            .to(0.2, {scale: 2})
            .to(0.2, {scale: 1})
            .start();
        } else {
            cc.tween(this.magnificationNode)
            .to(1, {opacity: 0})
            .call(() => {this.magnificationNode.active = false})
            .start();
        }
        this.magnificationNode.getComponent(cc.Label).string = "X" + this.magnification;
    },
});
