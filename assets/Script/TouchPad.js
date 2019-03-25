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
        currentAngle: {
            get () {
                return this._angle;
            },
            set (value) {
                this._angle = value;
            }
        },

        radius: {
            get () {
                return this._radius;
            },
            set (value) {
                this._radius = value;
            }
        },

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
        this._angle = 0;
        this._radius = windowSize.height / 4;
        this.startAngle = 0;
        this.offset = 1;
        this.delta = 0;
        this.lastDelta = 0;
        this.startY = 0;

        this.initEventListener();
    },

    start () {
        this.yangEye = this.slidingTrack.getChildByName("阴阳小球白");
        this.yinEye = this.slidingTrack.getChildByName("阴阳小球黑");

        var temp = Math.PI / 180;
        this.angle90 = 90 * temp;
        this.angle270 = 270 * temp;
    },

    update (dt) {

        //控制小球不能超过自己的区域
        if (this.isYinTouchPad) {
            if (this.yinEye.getPosition().x >= 0) {
                this.controlPaused = true;
                this.yinEye.setPosition(0, this.radius);
            } else {
                this.controlPaused = false;
            }
        } else {
            if (this.yangEye.getPosition().x <= 0) {
                this.controlPaused = true;
                this.yangEye.setPosition(0, this.radius);
            } else {
                this.controlPaused = false;
            }
        }

        cc.log(this.delta, this.angle, this.controlPaused);
    },

    initEventListener () {
        //响应触摸事件
        this.node.on ('touchstart', function (event) {
            this.padPressed = true;
            this.startY = event.getLocationY();
        }, this);

        this.node.on ('touchmove', function (event) {
            if (this.padPressed) {
                var y = event.getLocationY();
                this.delta = y - this.startY;
                if (this.controlPaused) {
                    this.delta -= this.deltaOffset(event.getDelta().y)
                }
                this.delta *= this.distanceMappingCoef;
                this.angle = this.startAngle + this.offset * this.delta / this.radius;
                this.updateEyePosition(this.angle);
            }
        }, this);

        this.node.on ('touchend', function (event) {
            this.padPressed = false;
            this.delta = 0;
            this.startAngle = this.angle;
        }, this);

        this.node.on ('touchcancel', function (event) {
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
        }
    },

    deltaOffset (deltaY) {
        if (this.isYinTouchPad) {
            if (this.yinEye.getPosition().x > 0) {
                return deltaY;
            } else {
                return -deltaY;
            }
        } else {
            if (this.yangEye.getPosition().x > 0) {
                return deltaY;
            } else {
                return -deltaY;
            }
        }
    }
});
