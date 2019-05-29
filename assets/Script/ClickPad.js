// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        slidingTrack: {
            default: null,
            type: cc.Node
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        var winSize = cc.winSize;
        this.node.width = winSize.width;
        this.node.height = winSize.height;

        //touchpad
        this.touchMove = false;
        //this.node.setContentSize(winSize.width, winSize.height);

        this.gamePaused = false;
    },

    start () {
        this.yangEye = this.slidingTrack.getChildByName("Yang");
        this.yinEye = this.slidingTrack.getChildByName("Yin");
        
        this.slidingTrackControl = this.slidingTrack.getComponent("SlidingTrack");

        this.touchPos = cc.v2();

        this.initEventListener();

        this.halos = new Array();

        this.tempoDetectOffset = 30;

        var temp = Math.PI / 180;
        this.angle90 = 90 * temp;
        this.angle90Plus = this.angle90 + 0.01;
        this.angle270 = 270 * temp;
    },

    // update (dt) {
    //     //touchpad

    // },

    initEventListener: function () {
        //响应触摸事件
        this.node.on ('touchstart', function (event) {
            if (!Global.gameStarted) {
                Global.gameStarted = true;
            }
            this.clicked(event.getLocation());
        }, this);

        this.node.on ('touchmove', function (event) {
            this.slidingTrackControl.touchMove = true;
            var x = event.getLocationX() - cc.winSize.width / 2;
            var delta = event.getDelta();

            if (x >= 0) {
                this.slidingTrackControl.moveEyeByDelta(true, delta);
            } else {
                this.slidingTrackControl.moveEyeByDelta(false, delta);
            }

        }, this);

        this.node.on ('touchend', function (event) {
            //this.clicked(event.getLocation());
            this.slidingTrackControl.touchMove = false;

        }, this);

        this.node.on ('touchcancel', function (event) {
            this.slidingTrackControl.touchMove = false;
        }, this);
    },

    clicked: function (location) {
        var winSize = cc.winSize;
        var x = location.x - winSize.width / 2;
        var y = location.y - winSize.height / 2;
        cc.log("clicked on " + location + " x: " + x+ " y: " + y);

        //todo:播放水波纹动画

        //清空halos中失效的halo 和已经被点击过的halo
        var temp = new Array();
        for (var i = 0; i < this.halos.length; i++) {
            if (this.halos[i].active) {
                var haloEmerged = this.halos[i].getComponent("Halo").haloEmerged;
                if (haloEmerged) {
                    temp.push(this.halos[i]);
                }
            }
        }
        this.halos = temp;

        if (this.halos.length > 0) {
            //判断是否点击到光环
            var hittedHalos = new Array();
            var hitCount = 0;
            for (var i = 0; i < this.halos.length; i++) {
                var xDiff = Math.abs(this.halos[i].x - x);
                var yDiff = Math.abs(this.halos[i].y - y);
                if (xDiff < this.tempoDetectOffset && yDiff < this.tempoDetectOffset) {
                    hittedHalos.push(this.halos[i]);
                    hitCount++;
                }
            }
            if (hitCount > 0) {
                //hittedHalos[0].getComponent("Halo").checkHitByClick();
                if (hitCount == 1) {
                    hittedHalos[0].getComponent("Halo").checkHitByClick();
                } else {
                    //处理多个光环重叠的情况
                    var states = new Array(hittedHalos.length);
                    for (var i = 0; i < hittedHalos.length; i++) {
                        states[i] = hittedHalos[i].getComponent("Halo").animState;
                    }
                    var temp = 0;
                    var count = 0;
                    for (var i = 0; i < hittedHalos.length; i++) {
                        if (states[i].time > temp) {
                            temp = states[i].time;
                            count = i;
                        }
                    }
                    hittedHalos[count].getComponent("Halo").checkHitByClick();
                }
            }
        }

        //将左右两边的点击都移到左边
        if (x < 0) {
            x = -x;
            y = -y;
        }
        //然后让阴阳小球移动到这个点
        this.slidingTrackControl.addPathPoint(cc.v2(x, y));
    },

    addHalo (halo) {
        this.halos.push(halo);
    },

    updateEyePosition (angle) {
        if (this.isYinTouchPad) {
            var xYin = Math.cos(angle) * this.radius;
            var yYin = Math.sin(angle) * this.radius;
            this.yinEye.setPosition(xYin, yYin);
        } else {
            var xYang = Math.cos(angle) * this.radius;
            var yYang = Math.sin(angle) * this.radius;
            this.yangEye.setPosition(xYang, yYang);
            //cc.log("yang");
        }
    },
});
