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
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.eyeCollided = false;
    },


    start () {
        this.windowSize = cc.winSize;
        if (this.node.name == "Yang") {
            this.isYang = true;
        } else {
            this.isYang = false;
        }
    },

    // update (dt) {},

    onCollisionEnter: function (other, self) {
        cc.log('on collision enter', self.node.getPosition(), self.world);
        this.enterPos = self.node.getPosition();
        this.eyeCollided = true;
        // var angle = this.getAngleByPosition(pos);
        // if (this.isYang) {
        //     if (pos.y > 0) {
        //
        //     } else {
        //         self.node.setPosition(this.getPositionByAngle(angle + 1));
        //         cc.log("set!")
        //     }
        //     cc.log("yang angle: " + angle);
        // }
    },

    onCollisionStay: function (other, self) {
        self.node.setPosition(this.enterPos);
    },

    onCollisionExit: function (other, self) {
        cc.log('on collision exit');
        this.eyeCollided = false;
    },

    getPositionByAngle (angle) {
        var x = Math.cos(angle) * Global.radius;
        var y = Math.sin(angle) * Global.radius;
        return new cc.Vec2(x, y);
    },

    getAngleByPosition (position) {
        var tan = position.y / position.x;
        return Math.atan(tan);
    }
});
