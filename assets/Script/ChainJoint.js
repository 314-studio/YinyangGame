// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

//构成黑白流体分界线的节点上挂载的脚本，用于控制节点的移动
cc.Class({
    extends: cc.Component,

    properties: {
        debug: true,
        forceCoef: 5
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.yinForce = 0;
        this.yangForce = 0;

        this.combinedForce = 0;
        
        this.forceDebugLineCoef = 1;
        this.awayFromEye = false;
    },

    start () {
        if (this.debug) {
            this.drawDebugInfo();
        }
    },

    update (dt) {
        if (this.debug) {
            this.debugUpdate(dt);
        }

        this.combinedForce = this.yinForce + this.yangForce;

        var x = this.node.getPosition().x;
        x += this.combinedForce * dt * this.forceCoef;
        this.node.setPosition(x, this.node.getPosition().y);

        if (this.combinedForce == 0 && this.awayFromEye) {
            var h = this.node.getPosition().x;
            h -= this.node.getPosition().x * dt * this.forceCoef;
            this.node.setPosition(h, this.node.getPosition().y);
        }
    },

    drawDebugInfo () {
        var ctx = this.getComponent(cc.Graphics);
        ctx.circle(0, 0, 5);
        ctx.fill();
    },

    debugUpdate (dt) {
        var ctx = this.getComponent(cc.Graphics);
        ctx.clear();

        this.drawDebugInfo();
        // ctx.moveTo(0, 0);
        // ctx.strokeColor = cc.Color.BLACK;
        // ctx.lineTo(this.yinForce * this.forceDebugLineCoef, 0);
        // ctx.stroke();

        // ctx.moveTo(0, 0)
        // ctx.strokeColor = cc.Color.WHITE;
        // ctx.lineTo(this.yangForce * this.forceDebugLineCoef, 0);
        // ctx.stroke();

        ctx.moveTo(0, 0);
        if (this.combinedForce > 0) {
            ctx.strokeColor = cc.Color.RED;
            ctx.lineTo(this.combinedForce, 0);
            ctx.stroke();
        } else if (this.combinedForce < 0) {
            ctx.strokeColor = cc.Color.ORANGE;
            ctx.lineTo(this.combinedForce, 0);
            ctx.stroke();
        }
    },

    applyYinForce (force) {
        this.yinForce = force;
    },

    applyYangForce (force) {
        this.yangForce = force;
    }
});
