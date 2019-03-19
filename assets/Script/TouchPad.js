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
        angle: {
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
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        var windowSize = cc.winSize;
        this.node.setContentSize(windowSize.width / 2, windowSize.height);

        this._angle = 0;
        this._radius = 0;
        this.startAngle = 0;
        this.offset = 1;

        this.initEventListener();
    },

    start () {

    },

    // update (dt) {},

    initEventListener () {
        var padPressed = false;
        var startY = 0; 
        var delta = 0;

        //响应鼠标事件
        this.node.on ('mousedown', function (event) {
            padPressed = true;
            startY = event.getLocationY();
        }, this);

        this.node.on ('mousemove', function (event) {
            if (padPressed) {
                var y = event.getLocationY();
                delta = y - startY;
                this.angle = this.startAngle + this.offset * delta / this.radius;
            }

        }, this);

        this.node.on ('mouseup', function (event) {
            padPressed = false;
            delta = 0;
            this.startAngle = this.angle;
        }, this);

        this.node.on ('mouseleave', function (event) {
            padPressed = false;
            delta = 0;
            this.startAngle = this.angle;
        }, this);


        //响应触摸事件
        this.node.on ('touchstart', function (event) {
            padPressed = true;
            startY = event.getLocationY();
        }, this);

        this.node.on ('touchmove', function (event) {
            if (padPressed) {
                var y = event.getLocationY();
                delta = y - startY;
                this.angle = this.startAngle + this.offset * delta / this.radius;
            }
        }, this);

        this.node.on ('touchend', function (event) {
            padPressed = false;
            delta = 0;
            this.startAngle = this.angle;
        }, this);

        this.node.on ('touchcancel', function (event) {
            padPressed = false;
            delta = 0;
            this.startAngle = this.angle;
        }, this);
    },

    thisIsYinEye (currentAngle) {
        this.offset = -1;
        this.startAngle = currentAngle;
        this.angle = currentAngle;
    },
});
