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
        speed: 10
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.rigidbody = this.node.getComponent(cc.RigidBody);
        this.node.setPosition(cc.v2(Global.radius, 0));

        this.rtx = this.node.getComponent(cc.Graphics);
    },

    start () {
        // this.countDownBegin = false;
        // this.movedSecond = 0;
        // this.moving = true;
        // this.cutsceneAnimPlaying = false;
        // //this.remainingTimeLabel.string = "剩余时间: " + this.settedTime;
        // this.currentOrigin = cc.v2();

        // cc.log(this.rigidbody.getMass());
        // this.lastRandomPos = cc.v2();
        // this.quadrant = 0;
        // this.startMove();
        // this.startNextRound();
    },

    update (dt) {
        // if (Global.gameStarted && !this.cutsceneAnimPlaying) {
        //     if (!this.moving) {
        //         this.startMove();
        //     } else {
        //         let xDiff = this.node.x - this.currentOrigin.x;
        //         let yDiff = this.node.y - this.currentOrigin.y;
        //         let mo = Math.sqrt(Math.pow(xDiff) + 
        //                         Math.pow(yDiff));
        //         let unitVector = cc.v2(xDiff / mo, yDiff / mo);
        //         this.rigidbody.applyForceToCenter(cc.v2(unitVector.x * this.centripetalForce, unitVector.y * this.centripetalForce));
                
        //         //this.rtx.moveTo(this.node.getPosition());
        //         this.rtx.clear();
        //         this.rtx.circle(0, 0, 10);
        //         this.rtx.circle(this.currentOrigin.x, this.currentOrigin.y, 10);
        //         this.rtx.fill();
        //     }
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

    startNextRound () {
        this.currentOrigin = this.getRandomLeaderTarget();
        let diffVector = cc.v2(this.node.x - this.currentOrigin.x, this.node.y - this.currentOrigin.y);
        let b = Math.sqrt(1 / (1 + Math.pow(diffVector.y, 2) / Math.pow(diffVector.x, 2)));
        let a = - diffVector.y * b / diffVector.x;

        let r = this.currentOrigin.x - cc.winSize.width / 2;
        let t = this.currentOrigin.y - cc.winSize.height / 2;
        if (r > t) {
            r = t;
        }

        //a, b 是垂直与diffVector的 单位向量 (a, b)
        this.rigidbody.linearVelocity = cc.v2(this.speed * a, this.speed * b);
        //centripetaForce 是向心力
        this.centripetalForce = this.rigidbody.getMass() * Math.pow(this.speed, 2) / r;
        cc.log(this.centripetalForce);
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
