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
        subdivisionLevel: 40,

        chainJoint: {
            default: null,
            type: cc.Prefab
        },

        slidingTrack: {
            default: null,
            type: cc.Node
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.windowsSize = cc.winSize;
        this.jointAmount = this.windowsSize.height / this.subdivisionLevel + 1;
        cc.log("节点数量: ", this.jointAmount);

        this.joints = new Array(this.jointAmount);

        for (var i = 0; i < this.jointAmount; i++) {
            var joint = cc.instantiate(this.chainJoint);
            joint.parent = this.node;
            this.joints[i] = joint;
        }

        this.yangEye = this.slidingTrack.getChildByName("阴阳小球白");
        this.yinEye = this.slidingTrack.getChildByName("阴阳小球黑");

        this.xForceCoef = 0.01;
        this.yForceCoef = 0.01;
        this.forceCoef = 4000;
        this.radius = this.windowsSize.height / 4;
    },

    start () {
        for (var i = 0; i < this.jointAmount; i++) {
            this.joints[i].setPosition(0,
                 this.windowsSize.height / 2 - (i * this.windowsSize.height / (this.jointAmount - 1)));
        }
    },

    update (dt) {
        cc.log("阳球力：");
        this.applyJointForce(this.yangEye);
        cc.log("阴球力：");
        this.applyJointForce(this.yinEye);
    },

    applyJointForce (eye) {
        for (var i = 1; i < this.jointAmount - 1; i++) {
            var joint = this.joints[i];
            var jointScript = joint.getComponent("ChainJoint");
            var xOffset = joint.getPosition().x - eye.getPosition().x;
            var yOffset = joint.getPosition().y - eye.getPosition().y;
            var offsetPow = Math.pow(xOffset, 2) + Math.pow(yOffset, 2);

            var force = 0;
            if (offsetPow >= Math.pow(this.radius, 2) + 2) {
                force = 0;
            } else {
                var offsetAtan = Math.atan(yOffset / xOffset);
                cc.log("距离的平方：", offsetPow);
                force = this.forceCoef / Math.sqrt(offsetPow);
            }

            if (eye.getPosition().x > 0) {
                force = -force
            }

            // var force = this.xForceCoef * (Math.pow(this.radius, 2) - Math.pow(xOffset, 2)) - 
            //     this.yForceCoef * Math.pow(yOffset, 2);
            // if (eye.getPosition().x > 0) {
            //     force = -force
            // }
            //var force = this.xForceCoef * xOffset + this.yForceCoef * yOffset;
            jointScript.applyYinyangForce(force);

            cc.log("力的大小：", force);
        }
    }
});
