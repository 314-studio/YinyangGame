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
        debug: false,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.yangEye = this.node.getChildByName("阴阳小球白");
        this.yinEye = this.node.getChildByName("阴阳小球黑");

        this.maxAngle = 85 * Math.PI / 180;

        var windowSize = cc.winSize;
        this.radius = windowSize.height / 4;

        this.ctx = this.getComponent(cc.Graphics);
    },

    start () {
        if (this.debug) {
            this.drawDebugCircle();
            cc.log("parent Position: ", this.node.getPosition().x, this.node.getPosition().y);
        }
        this.yangEye.setPosition(this.radius, 0);
        this.yinEye.setPosition(-this.radius, 0);

        //cc.log("新的位置",this.generateRamdomHaloPositon());
    },

    update (dt) {
        if (this.debug) {
            this.ctx.clear();
            this.drawDebugCircle();
            this.ctx.circle(this.yinEye.getPosition().x, this.yinEye.getPosition().y, this.radius);
            this.ctx.circle(this.yangEye.getPosition().x, this.yangEye.getPosition().y, this.radius);
            this.ctx.stroke();
        }
    },

    drawDebugCircle () {
        
        this.ctx.circle(0, 0, this.radius);
        this.ctx.stroke();


    },

    generateRamdomHaloPositon () {
        var angle = Math.random() * 2 * this.maxAngle - this.maxAngle;
        var x = Math.cos(angle) * this.radius;
        var y = Math.sin(angle) * this.radius;

        return new cc.Vec2(x, y);
    },
});
