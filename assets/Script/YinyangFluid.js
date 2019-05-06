// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

var bSpline = require("b-spline");

//该类制作了随小球移动而变化的黑白流体的动画效果
cc.Class({
    extends: cc.Component,

    properties: {
        debug: true,

        subdivisionLevel: 40,  //构成黑白流体分界线的节点的细分程度，数值越小，节点数量越多

        //构成黑白流体分界线的节点
        chainJoint: {
            default: null,
            type: cc.Prefab
        },

        //黑白小球与光环出现的轨道
        slidingTrack: {
            default: null,
            type: cc.Node
        },

        inverseFuncConstance: 500,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.moving = true;
        this.yangLastX = 160;
        this.yinLastX = 0;

        this.windowsSize = cc.winSize;
        this.jointAmount = Math.round(this.windowsSize.height / this.subdivisionLevel + 1);
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
        this.ctx = this.getComponent(cc.Graphics);
    },

    update (dt) {
        var yangX = this.yangEye.getPosition().x;
        var yangY = this.yangEye.getPosition().y;
        var yinX = this.yinEye.getPosition().x;
        var yinY = this.yinEye.getPosition().y;
        if (yangX != this.yangLastX) {
            this.yangSpeed = Math.abs(yangX - this.yangLastX);
            this.yinSpeed = Math.abs(yinX - this.yinLastX);
            this.yangLastX = yangX;
            this.yinLastX = yinX;
            
            var yangHeading = yangY - this.yangLastY;
            var yinHeading = yinY - this.yinLastY;
            if (yangHeading < 0) {
                this.yangUp = false;
            } else {
                this.yangUp = true;
            }
            if (yinHeading < 0) {
                this.yinUp = false;
            } else {
                this.yinUp = true;
            }
            cc.log(this.yangSpeed, "heading Up?", this.yangUp);
        } else {
            this.yangLastY = yangY;
            this.yinLastY = yinY;
            this.yangLastX = yangX;
            this.yinLastX = yinX;
        }

        if (this.moving) {
            //cc.log("阳球力：");
            this.applyJointForce(this.yangEye, true, this.yangSpeed);
            //cc.log("阴球力：");
            this.applyJointForce(this.yinEye, false, this.yinSpeed);

            this.drawCurve();
        }

        this.drawCurve();
    },

    applyJointForce (eye, isYang, speed) {
        for (var i = 0; i < this.jointAmount; i++) {
            var joint = this.joints[i];
            var jointScript = joint.getComponent("ChainJoint");
            var xOffset = joint.getPosition().x - eye.getPosition().x;
            var yOffset = joint.getPosition().y - eye.getPosition().y;
            var offset = Math.sqrt(Math.pow(xOffset, 2) + Math.pow(yOffset, 2));

            //阴阳小球推力
            var force = this.radius - offset;

            //阴阳小球吸引力
            var attraction = 0;
            if (offset < this.radius + 20) {
                attraction = speed * 10;
            }

            if (force < 0) {
                force = 0;
                jointScript.awayFromEye = true;
            } else {
                jointScript.awayFromEye = false;
            }

            if (isYang) {
                force = -force;
                jointScript.applyYangForce(force);
                jointScript.applyYangAttraction(attraction);
            } else {
                jointScript.applyYinForce(force);
            }

            //cc.log("力的大小：", force);
        }
    },

    //画线与白色液体，黑色是背景图片
    drawCurve () {
        var points = new Array(this.jointAmount);
        for (var i = 0; i < this.jointAmount; i ++) {
            var joint = this.joints[i];
            points[i] = [joint.getPosition().x, joint.getPosition().y];
        }
        var degree = 2;
        this.ctx.clear();
        this.ctx.moveTo(points[0][0], points[0][1]);
        for (var t = 0; t < 1; t += 0.01) {
            var point = bSpline(t, degree, points);
            //cc.log("point到底是什么？",point)
            if (t > 0) {
                this.ctx.lineTo(point[0], point[1]);
            }
        }
        this.ctx.lineTo(points[this.jointAmount-1][0], points[this.jointAmount-1][1]);
        this.ctx.lineTo(-this.windowsSize.width / 2, -this.windowsSize.height / 2);
        this.ctx.lineTo(-this.windowsSize.width / 2, this.windowsSize.height / 2);
        this.ctx.lineTo(points[0][0], points[0][1]);
        this.ctx.fill();
    },
});
