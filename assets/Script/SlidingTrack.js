// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

//SlidingTrack是阴阳两球滑动的轨道，用于提供小球的具体位置

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

        radius: 20

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.yangEye = this.node.getChildByName("阴阳小球白");
        this.yinEye = this.node.getChildByName("阴阳小球黑");

        this.maxAngle = 85 * Math.PI / 180;

        var windowSize = cc.winSize;
        this.radius = windowSize.height / 4;
    },

    start () {
        this.drawDebugCircle();
        cc.log("parent Position: ", this.node.getPosition().x, this.node.getPosition().y);
        this.yangEye.setPosition(this.radius, 0);
        this.yinEye.setPosition(-this.radius, 0);

        //cc.log("新的位置",this.generateRamdomHaloPositon());
    },

    //update (dt) {},

    drawDebugCircle () {
        var ctx = this.getComponent(cc.Graphics);
        ctx.circle(0, 0, this.radius);
        ctx.stroke();
    },

    moveYinyangEye (deltaYin, deltaYang, coef) {
        if (!(deltaYin == 3.14 && deltaYang == 0)){
            var angleYin = coef * deltaYin;
            var angleYang = coef * deltaYang;

            //cc.log("阴阳信息: ", deltaYin, deltaYang, coef);
            //cc.log("阴阳角度：", angleYin, angleYang);
            //cc.log("测试运算：", this.yinEye.getPosition.x);

            var xYin = Math.cos(angleYin) * this.radius;
            var yYin = Math.sin(angleYin) * this.radius;
            var xYang = Math.cos(angleYang) * this.radius;
            var yYang = Math.sin(angleYang) * this.radius;

            //cc.log("阴阳位置（阴XY，阳XY）：", xYin, yYin, xYang, yYang);

            this.yinEye.setPosition(xYin, yYin);
            this.yangEye.setPosition(xYang, yYang);
        }
    },

    generateRamdomHaloPositon () {
        var angle = Math.random() * 2 * this.maxAngle - this.maxAngle;
        var x = Math.cos(angle) * this.radius;
        var y = Math.sin(angle) * this.radius;

        return new cc.Vec2(x, y);
    }
});
