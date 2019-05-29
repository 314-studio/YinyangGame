// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

//SlidingTrack是阴阳两球滑动的轨道，用于给小球和光环提供坐标
cc.Class({
    extends: cc.Component,

    properties: {
        openingAnimRadius: 10,
        openingAnimSmoothness: 1,
        openingAnimDuration: 0.5,

        enableClickToMove: true,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.yangEye = this.node.getChildByName("Yang");
        this.yinEye = this.node.getChildByName("Yin");

        this.maxAngle = 70 * Math.PI / 180;

        this.ctx = this.getComponent(cc.Graphics);

        this.openingAnimPlaying = false;

        //this.smoothness = 1;
    },

    start () {
        if (Global.debug) {
            this.drawDebugCircle();
            cc.log("parent Position: ", this.node.getPosition().x,
                this.node.getPosition().y);
        }
        this.yangEye.setPosition(Global.radius, 0);
        this.yinEye.setPosition(-Global.radius, 0);

        //cc.log("新的位置",this.generateRamdomHaloPositon());

        //用于储存阴阳移动的路径点
        this.pathPoints = new Array();

        this.initActions();

        this.playOpeningAnimation(true);

        // if (this.enableClickToMove) {
            
        // }
        this.slidingAngle = 0;
        //this.currentAngle = 0;
    },

    update (dt) {
        if (Global.gameStarted) {
            if (this.sliding) {
                var pos = this.posOnCircleFormAngle(this.slidingAngle);
                this.yangEye.setPosition(pos);
                this.yinEye.setPosition(cc.v2(-pos.x, -pos.y));
            } else {
                if (this.enableClickToMove) {
                    if (this.pathPoints.length > 0) {
                        this.slideTo(this.pathPoints[0]);
                        this.pathPoints.splice(0, 1);
                        this.slidingAngle = this.positionToAngle(this.yangEye.getPosition());
                    }
                }
            }
        }


        if (Global.debug) {
            this.ctx.clear();
            this.drawDebugCircle();
            this.ctx.circle(this.yinEye.getPosition().x,
                this.yinEye.getPosition().y, Global.radius);
            this.ctx.circle(this.yangEye.getPosition().x,
                this.yangEye.getPosition().y, Global.radius);
            this.ctx.stroke();
        }
    },

    addPathPoint (point) {
        this.pathPoints.push(point);
    },

    //
    slideTo (point) {
        this.sliding = true;
        var angle = this.positionToAngle(point);

        var pos = this.circlePosForAngle(cc.v2(0, 0), angle, Global.radius);
        // this.ctx.clear();
        // this.ctx.circle(pos.x, pos.y, 10);
        // this.ctx.fill();

        cc.tween(this)
            .to(0.5, {slidingAngle: angle}, {easing: 'quadInOut'})
            .call(() => {this.sliding = false; cc.log("滑动完成");})
            .start();

        //cc.log(angle);
    },

    positionToAngle (point) {
        var angle = Math.atan(point.y / point.x);
        if (point.x < 0) {
            angle += Math.PI;
        }
        return angle;
    },

    posOnCircleFormAngle (angle) {
        var x = Math.cos(angle) * Global.radius;
        var y = Math.sin(angle) * Global.radius;
        return cc.v2(x, y);
    },

    resetYinyangPosition () {
        cc.tween(this.yangEye)
            .to(1, {position: cc.v2(Global.radius, 0)}, {easing: 'quadInOut'})
            .start();
        cc.tween(this.yinEye)
            .to(1, {position: cc.v2(-Global.radius, 0)}, {easing: 'quadInOut'})
            .start();
    },

    playOpeningAnimation (enable) {
        if (enable) {
            if (!this.openingAnimPlaying) {
                this.yangEye.runAction(this.yangOpeningAction);
                this.scheduleOnce(function() {
                    this.yinEye.runAction(this.yinOpeningAction);
                }, this.openingAnimDuration / 2);
                this.openingAnimPlaying = true;
            }
        } else {
            if (this.openingAnimPlaying) {
                this.yangEye.stopAction(this.yangOpeningAction);
                this.unscheduleAllCallbacks();  //动作未开始的话停止定时任务
                this.yinEye.stopAllActions();
                this.openingAnimPlaying = false;
            }
        }
    },

    drawDebugCircle () {

        this.ctx.circle(0, 0, Global.radius);
        this.ctx.stroke();
    },

    generateRamdomHaloPositon (radius) {
        var angle = Math.random() * 2 * this.maxAngle - this.maxAngle;
        return this.circlePosForAngle(new cc.Vec2(0, 0), angle, radius);
    },

    circlePosForAngle (origin, angle, radius) {
        var x = Math.cos(angle) * radius + origin.x;
        var y = Math.sin(angle) * radius + origin.y;

        //cc.log(x, y)

        return new cc.Vec2(x, y);
    },

    initActions () {
        this.yangOpeningAction = cc.repeatForever(
            cc.sequence(
                cc.moveBy(this.openingAnimDuration, cc.v2(this.openingAnimRadius, 0))
                    .easing(cc.easeSineInOut()),
                cc.moveBy(this.openingAnimDuration, cc.v2(-this.openingAnimRadius, 0))
                    .easing(cc.easeSineInOut())
            )
        );

        this.yinOpeningAction = cc.repeatForever(
            cc.sequence(
                cc.moveBy(this.openingAnimDuration, cc.v2(this.openingAnimRadius, 0))
                    .easing(cc.easeSineInOut()),
                cc.moveBy(this.openingAnimDuration, cc.v2(-this.openingAnimRadius, 0))
                    .easing(cc.easeSineInOut())
            )
        );
    },
});
