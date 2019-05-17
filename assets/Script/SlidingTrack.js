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
        openingAnimDuration: 0.5
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.yangEye = this.node.getChildByName("Yang");
        this.yinEye = this.node.getChildByName("Yin");

        this.maxAngle = 70 * Math.PI / 180;

        this.ctx = this.getComponent(cc.Graphics);
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

        this.initActions();

        this.playOpeningAnimation(true);
    },

    update (dt) {


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

    playOpeningAnimation (enable) {
        if (enable) {
            this.yangEye.runAction(this.yangOpeningAction);
            this.scheduleOnce(function() {
                this.yinEye.runAction(this.yinOpeningAction);
            }, this.openingAnimDuration / 2);
        } else {
            this.yangEye.stopAction(this.yangOpeningAction);
            this.unscheduleAllCallbacks();  //动作未开始的话停止定时任务
            this.yinEye.stopAction(this.yinOpeningAction);
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

    // initActions () {
    //     this.yangOpeningAction = cc.repeatForever(
    //         cc.sequence(
    //             cc.moveTo(this.openingAnimDuration,
    //                 this.circlePosForAngle(this.yangEye.getPosition(),
    //                 1.57, this.openingAnimRadius))
    //                 .easing(cc.easeSineInOut()),
    //             cc.moveTo(this.openingAnimDuration,
    //                 this.circlePosForAngle(this.yangEye.getPosition(),
    //                 3.6, this.openingAnimRadius))
    //                 .easing(cc.easeSineInOut()),
    //             cc.moveTo(this.openingAnimDuration,
    //                 this.circlePosForAngle(this.yangEye.getPosition(),
    //                 5.76, this.openingAnimRadius))
    //                 .easing(cc.easeSineInOut())
    //         )
    //     );
    //
    //     this.yinOpeningAction = cc.repeatForever(
    //         cc.sequence(
    //             cc.moveTo(this.openingAnimDuration,
    //                 this.circlePosForAngle(this.yinEye.getPosition(),
    //                 1.57, this.openingAnimRadius))
    //                 .easing(cc.easeSineInOut()),
    //             cc.moveTo(this.openingAnimDuration,
    //                 this.circlePosForAngle(this.yinEye.getPosition(),
    //                 3.6, this.openingAnimRadius))
    //                 .easing(cc.easeSineInOut()),
    //             cc.moveTo(this.openingAnimDuration,
    //                 this.circlePosForAngle(this.yinEye.getPosition(),
    //                 5.76, this.openingAnimRadius))
    //                 .easing(cc.easeSineInOut())
    //         )
    //     );
    // },
});
