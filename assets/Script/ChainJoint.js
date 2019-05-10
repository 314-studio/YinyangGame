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
        forceCoef: 5,
        resistance: 5,
        attractionCoef: 1,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        var labelNode = this.node.getChildByName('label');
        labelNode.color = cc.Color.MAGENTA;
        this.debugLabel = labelNode.getComponent(cc.Label);

        this.yinAttraction = 0;
        this.yangAttraction = 0;
        this.disToYang = 0;
        this.lastDisToYang = 0;
        this.disToYin = 0;
        this.lastDisToYin = 0;

        this.combinedForce = 0;
        this.confictMode = false;

        this.forceDebugLineCoef = 1;
        this.awayFromEye = false;

        this.spd = 0;
        this.mass = 1;
    },

    start () {
        if (Global.debug) {
            this.drawDebugInfo();
        } else {
            this.debugLabel.enabled = false;
        }
    },

    update (dt) {
        if (Global.debug) {
            this.debugUpdate(dt);
        }

        if (Global.moving) {
            //计算节点受到的阴阳小球的推力
            var yangForce = Global.radius - this.disToYang;
            var yinForce = Global.radius - this.disToYin;

            if (yangForce < 0) {
                yangForce = 0;
            } else if (yangForce > 0) {
                yangForce = -yangForce;
            }
            if (yinForce < 0) {
                yinForce = 0;
            }

            if (yangForce != 0 && yinForce != 0) {
                this.confictMode = true;
            }

            if (yangForce == 0 && yinForce == 0 &&
                this.disToYin == Global.radius && this.disToYang == Global.radius) {
                    this.confictMode = true;
                }

            if (this.confictMode) {
                if (this.disToYin > Global.radius || this.disToYang > Global.radius) {
                    this.awayFromEye = true;
                    this.confictMode = false;
                }
            }

            this.combinedForce = yinForce + yangForce;

            if (Global.debug) {
                this.debugLabel.string = "disToYin: " + this.disToYin +
                    " disToYang: " + this.disToYang + " yangForce: " +
                    yangForce + " yinForce: " + yinForce + " confictMode: " +
                    this.confictMode + " awayFromEye: " + this.awayFromEye;
            }

            //实现小球被推走的效果
            if (this.combinedForce != 0) {
                var x = this.node.getPosition().x;
                x += this.combinedForce * dt * this.forceCoef;
                this.node.setPosition(x, this.node.getPosition().y);
            }

            //当小球不受力时使其回到中心
            if (this.combinedForce == 0 && this.disToYang > Global.radius
                && this.disToYin > Global.radius || this.awayFromEye) {
                var h = this.node.getPosition().x;
                h -= this.node.getPosition().x * dt * this.attractionCoef;
                this.node.setPosition(h, this.node.getPosition().y);
            }

            if (this.awayFromEye) {
                if (this.disToYang > Global.radius && this.disToYin > Global.radius) {
                    this.awayFromEye = false;
                }
            }
        }


    },

    appendDebugMessage (message) {
        var msg = this.debugLabel.string + " " + message;
        this.debugLabel.string = msg;
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
    },

    applyYinAttraction (attraction) {
        this.yinAttraction = attraction;
    },

    applyYangAttraction (attraction) {
        this.yangAttraction = attraction;
    }
});
