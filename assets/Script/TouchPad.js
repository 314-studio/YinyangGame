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
        //Todo: 将小球的控制移到此处避免卡顿问题
        if (this.isYinTouchPad) {
            if (this.angle <= this.angle90) {
               this.setPause(this.angle90)
            } else if (this.angle >= this.angle270) {
                this.setPause(this.angle270)
            }
        } else {
            if (this.angle >= this.angle90) {
                this.setPause(this.angle90)
            } else if (this.angle <= -this.angle90) {
                this.setPause(-this.angle90)
            }
        }

        if (!this.controlPaused) {
            this.currentAngle = this.angle;
        } else {
            if (this.isYinTouchPad) {
                if (this.angle > this.angle90 || this.angle < this.angle270) {
                    this.controlPaused = false;
                }
            } else {
                if (this.angle < this.angle90 || this.angle > -this.angle90) {
                    this.controlPaused = false;
                }
            }
        }

        if (!(this.currentAngle == 3.14 && this.currentAngle == 0)){

            if (this.isYinTouchPad) {
                var xYin = Math.cos(this.currentAngle) * this.radius;
                var yYin = Math.sin(this.currentAngle) * this.radius;
                this.yinEye.setPosition(xYin, yYin);
            } else {
                var xYang = Math.cos(this.currentAngle) * this.radius;
                var yYang = Math.sin(this.currentAngle) * this.radius;
                this.yangEye.setPosition(xYang, yYang);
            }
        }
    },

    setPause (angle) {
        this.angle = angle;
        this.startAngle = angle;
        this.controlPaused = true;
    },

    initEventListener () {
        var startY = 0; 
        var delta = 0;

        //响应鼠标事件
        this.node.on ('mousedown', function (event) {
            this.padPressed = true;
            startY = event.getLocationY();
        }, this);

        this.node.on ('mousemove', function (event) {
            if (this.padPressed) {
                var y = event.getLocationY();
                delta = y - startY;
                delta *= this.distanceMappingCoef;
                this.angle = this.startAngle + this.offset * delta / this.radius;
            }

        }, this);

        this.node.on ('mouseup', function (event) {
            this.padPressed = false;
            delta = 0;
            this.startAngle = this.angle;
        }, this);

        this.node.on ('mouseleave', function (event) {
            this.padPressed = false;
            delta = 0;
            this.startAngle = this.angle;
        }, this);


        //响应触摸事件
        this.node.on ('touchstart', function (event) {
            this.padPressed = true;
            startY = event.getLocationY();
        }, this);

        this.node.on ('touchmove', function (event) {
            if (this.padPressed) {
                var y = event.getLocationY();
                delta = y - startY;
                delta *= this.distanceMappingCoef;
                this.angle = this.startAngle + this.offset * delta / this.radius;
            }
        }, this);

        this.node.on ('touchend', function (event) {
            this.padPressed = false;
            delta = 0;
            this.startAngle = this.angle;
        }, this);

        this.node.on ('touchcancel', function (event) {
            this.padPressed = false;
            delta = 0;
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
});
