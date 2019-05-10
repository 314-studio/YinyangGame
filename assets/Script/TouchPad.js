// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

//该类控制的节点接受用户的控制输入，包括鼠标和触摸
cc.Class({
    extends: cc.Component,

    properties: {
        distanceMappingCoef: 1,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        var windowSize = cc.winSize;
        this.node.setContentSize(windowSize.width / 2, windowSize.height);

        this.padPressed = false;
        this.isYinTouchPad = false;
        this.controlPaused = false;
        this.angle = 0;
        this.radius = Global.radius;
        this.startAngle = 0;
        this.offset = 1;

        this.initEventListener();
    },

    start () {
        this.yangEye = this.slidingTrack.getChildByName("阴阳小球白");
        this.yinEye = this.slidingTrack.getChildByName("阴阳小球黑");

        var temp = Math.PI / 180;
        this.angle90 = 90 * temp;
        this.angle90Plus = this.angle90 + 0.01;
        this.angle270 = 270 * temp;
    },

    update (dt) {

        //控制小球不能超过自己的区域
        if (!this.controlPaused) {
            if (this.isYinTouchPad) {
                if (this.yinEye.getPosition().x > 0) {
                    this.controlPaused = true;
                    if (this.yinEye.getPosition().y > 0) {
                        this.yinEye.setPosition(0, this.radius);
                    } else {
                        this.yinEye.setPosition(0, -this.radius);
                    }
                }
            } else {
                if (this.yangEye.getPosition().x < 0) {
                    this.controlPaused = true;
                    if (this.yangEye.getPosition().y > 0) {
                        this.yangEye.setPosition(0, this.radius);
                    } else {
                        this.yangEye.setPosition(0, -this.radius);
                    }
                }
            }
        }
    },

    initEventListener () {
        var startY = 0;
        var delta = 0;
        var lastDelta = 0;

        //响应触摸事件
        this.node.on ('touchstart', function (event) {
            if (!Global.gameStarted) {
                Global.gameStarted = true;
                this.slidingTrack.getComponent("SlidingTrack")
                    .playOpeningAnimation(false);
            }

            Global.moving = true;
            this.padPressed = true;
            startY = event.getLocationY();
        }, this);

        this.node.on ('touchmove', function (event) {
            if (this.padPressed) {
                var y = event.getLocationY();
                delta = y - startY;
                delta *= this.distanceMappingCoef;

                if (this.controlPaused) {
                    if (this.isYinTouchPad) {
                        if (this.yinEye.getPosition().y > 0) {
                            if (delta < lastDelta) {
                                this.controlPaused = false;
                                startY = y;
                                this.startAngle = this.angle90Plus;
                                delta = 0;
                            }
                        } else {
                            if (delta > lastDelta) {
                                this.controlPaused = false;
                                startY = y;
                                this.startAngle = this.angle270;
                                delta = 0;
                            }
                        }
                    } else {
                        if (this.yangEye.getPosition().y > 0) {
                            if (delta < lastDelta) {
                                this.controlPaused = false;
                                startY = y;
                                this.startAngle = this.angle90;
                                delta = 0;
                            }
                        } else {
                            if (delta > lastDelta) {
                                this.controlPaused = false;
                                startY = y;
                                this.startAngle = -this.angle90;
                                delta = 0;
                            }
                        }
                    }
                }
                this.angle = this.startAngle + this.offset * delta / this.radius;

                if (!this.controlPaused) {
                    this.updateEyePosition(this.angle);
                }
                lastDelta = delta;
            }
        }, this);

        this.node.on ('touchend', function (event) {
            //Global.moving = false;
            this.padPressed = false;
            this.delta = 0;
            this.startAngle = this.angle;
        }, this);

        this.node.on ('touchcancel', function (event) {
            //Global.moving = false;
            this.padPressed = false;
            this.delta = 0;
            this.startAngle = this.angle;
        }, this);
    },

    //用于初始化阴球的位置
    thisIsYinTouchPad () {
        this.offset = -1;
        this.startAngle = 3.14;
        this.angle = 3.14;
        this.isYinTouchPad = true;
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
