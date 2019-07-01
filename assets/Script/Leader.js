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
        //remainingTimeLabel: cc.Label,
        settedTime: 2,
        damping: 2,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.rigidbody = this.node.getComponent(cc.RigidBody);
        this.node.setPosition(cc.v2(Global.radius, 0));
    },

    start () {
        this.countDownBegin = false;
        this.movedSecond = 0;
        this.moving = true;
        this.cutsceneAnimPlaying = false;
        //this.remainingTimeLabel.string = "剩余时间: " + this.settedTime;

        cc.log(this.rigidbody.getMass());
        this.lastRandomPos = cc.v2();
        this.quadrant = 0;
        this.startMove();
    },

    update (dt) {
        if (Global.gameStarted && !this.cutsceneAnimPlaying) {
            if (!this.moving) {
                this.startMove();
            } else {
                if (this.countDownBegin) {
                    this.movedSecond += dt;

                    //处理小球移动
                    this.rigidbody.applyForceToCenter(this.f);

                    if (this.movedSecond >= this.settedTime) {
                        this.countDownBegin = false;
                        this.movedSecond = 0;

                        this.scheduleOnce(function() {
                            this.moveLeaderTo(this.getRandomLeaderTarget());
                        }, 0.3);
                    }
                    //this.remainingTimeLabel.string = "剩余时间: " + (this.settedTime - this.movedSecond).toFixed(2);
                } else if (this.rigidbody.linearVelocity.x != 0 && this.rigidbody.linearVelocity.y != 0) {
                    //let coef = this.rigidbody.linearVelocity.x / this.rigidbody.linearVelocity.y;
                    this.rigidbody.linearDamping = this.damping;
                }
            }
        }

        //需要重置node的位置防止在高速撞击时重复变换速度
        //碰撞后速度发生变化，导致不能经过控制点
        // if (this.node.x < -cc.winSize.width / 2 + this.node.width / 2 * this.node.scale ||
        //     this.node.x > cc.winSize.width / 2 - this.node.width / 2 * this.node.scale) {
        //     this.rigidbody.linearVelocity = cc.v2(-this.rigidbody.linearVelocity.x,
        //         this.rigidbody.linearVelocity.y);
        //     //this.node.x = -cc.winSize.width / 2 + this.node.width / 2 * this.node.scale;
        // } else if (this.node.y > cc.winSize.height / 2 - this.node.height / 2 * this.node.scale ||
        //     this.node.y < -cc.winSize.height / 2 + this.node.height / 2 * this.node.scale) {
        //     this.rigidbody.linearVelocity = cc.v2(this.rigidbody.linearVelocity.x,
        //         -this.rigidbody.linearVelocity.y);
        // }
    },

    startMove () {
        this.moveLeaderTo(this.getRandomLeaderTarget());
        this.moving = true;
    },

    reset () {
        this.node.setPosition(cc.v2(Global.radius, 0));
        this.rigidbody.linearVelocity = cc.v2();
        this.countDownBegin = false;
        this.movedSecond = 0;
        this.f = 0;
        this.moving = false;
    },

    moveLeaderTo (position) {
        var x = position.x;
        var y = position.y;

        this.target = cc.v2(x, y);
        let xOffset = x - this.node.x;
        let yOffset = y - this.node.y;
        // this.startAngle = Math.atan(yOffset / xOffset);
        // this.startDistance = Math.sqrt(Math.pow(xOffset, 2) + Math.pow(yOffset, 2));
        this.countDownBegin = true;

        //计算小球通过点击处需要的力
        let xf = xOffset / Math.pow(this.settedTime, 2) * this.rigidbody.getMass() * 2;
        let yf = yOffset / Math.pow(this.settedTime, 2) * this.rigidbody.getMass() * 2;

        //如果有初始速度的话
        if (this.rigidbody.linearVelocity != cc.v2()) {
            xf -= 2 * this.rigidbody.linearVelocity.x / this.settedTime * this.rigidbody.getMass();
            yf -= 2 * this.rigidbody.linearVelocity.y / this.settedTime * this.rigidbody.getMass();
        }

        this.rigidbody.linearDamping = 0;
        this.f = cc.v2(xf, yf);
    },

    getRandomLeaderTarget () {
        let quarterWidth = cc.winSize.width / 4;
        let halfHeight = cc.winSize.height / 2;

        let boxWidth = quarterWidth / 4;
        let boxHeight = halfHeight / 4;
        // let xDiff = this.node.x - quarterWidth;
        // let yDiff = this.node.y - halfHeight;

        let target = cc.v2(Math.random() * boxWidth, Math.random() * boxHeight);

        let nextQuadrant = 0;
        while (nextQuadrant == 0 || nextQuadrant == this.quadrant) {
            nextQuadrant = Math.ceil(Math.random() * 4);
        }
        this.quadrant = nextQuadrant;
        cc.log(this.quadrant);

        if (nextQuadrant == 1) {
            target.x += quarterWidth - quarterWidth / 4;
        } else if (nextQuadrant == 2) {
            target.x += quarterWidth;
        } else if (nextQuadrant == 3) {
            target.x += quarterWidth - quarterWidth / 4;
            target.y = -target.y;
        } else if (nextQuadrant == 4) {
            target.x += quarterWidth;
            target.y = -target.y;
        }
        cc.log(target);
        return target;
    },
});
