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
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.yinForce = 0;
        this.yangForce = 0;

        this.combinedForce = 0;
        
        this.forceDebugLineCoef = 1;
    },

    start () {
        this.drawDebugInfo();
    },

    update (dt) {
        this.drawDebugInfo();
        var x = this.node.getPosition().x;
        x += dt * this.combinedForce;
        this.node.setPosition(x, this.node.getPosition().y);
        //this.debugUpdate(dt);
        // var ctx = this.getComponent(cc.Graphics);
        // ctx.clear();
        // ctx.moveTo(0, 0);
        // ctx.lineTo(this.combinedForce, 0);
        // ctx.stroke();
    },

    drawDebugInfo () {
        var ctx = this.getComponent(cc.Graphics);
        ctx.circle(0, 0, 5);
        ctx.fill();
    },

    debugUpdate (dt) {
        var ctx = this.getComponent(cc.Graphics);
        ctx.clear();

        ctx.moveTo(0, 0);
        ctx.strokeColor = cc.Color.BLACK;
        ctx.lineTo(this.yinForce * this.forceDebugLineCoef, 0);
        ctx.stroke();

        ctx.moveTo(0, 0)
        ctx.strokeColor = cc.Color.WHITE;
        ctx.lineTo(this.yangForce * this.forceDebugLineCoef, 0);
        ctx.stroke();
    },

    applyYinyangForce (force) {
        if (force > 0) {
            this.yinForce = force;
        } else {
            this.yangForce = force;
        }
        this.combinedForce = this.yangForce + this.yinForce;
    }
});
