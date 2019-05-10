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

        springConstant: 0.005,
        springConstantBaseline: 0.005,
        damping: 0.99,
        iteration: 5
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

        //A phase difference to apply to each sine
        this.offset = 0;
        this.NUM_BACKGROUND_WAVES= 7;
        this.BACKGROUND_WAVE_MAX_HEIGHT = 6;
        this.BACKGROUND_WAVE_COMPRESSION = 1 / 10;
        this.sineOffsets = [];
        this.sineAmplitudes = [];
        this.sineStretches = [];
        this.offsetStretches = [];

        this.X_OFFSET = 0;

    },

    start () {
        for (var i = 0; i < this.jointAmount; i++) {
            this.joints[i].setPosition(0,
                 this.windowsSize.height / 2 - (i * this.windowsSize.height / (this.jointAmount - 1)));
        }
        this.ctx = this.getComponent(cc.Graphics);
        this.backgroundWaveData();
    },

    update (dt) {
        if (!Global.gameStarted) {
            this.offset += 1;
            this.updateWavePoints(this.joints, dt);
        }
        if (Global.moving) {
            this.setupJoints(this.yangEye, true);
            this.setupJoints(this.yinEye, false);
        }

        this.drawCurve();
    },

    //开场液体动画
    openingJointAnim () {
    },

    backgroundWaveData () {
        for (var i = 0; i < this.NUM_BACKGROUND_WAVES; i++) {
            var sineOffset = -Math.PI + 2 * Math.PI * Math.random();
            this.sineOffsets.push(sineOffset);
            var sineAmplitude = Math.random() * this.BACKGROUND_WAVE_MAX_HEIGHT;
            this.sineAmplitudes.push(sineAmplitude);
            var sineStretche = Math.random() * this.BACKGROUND_WAVE_COMPRESSION;
            this.sineStretches.push(sineStretche);
            var offsetStretche = Math.random() * this.BACKGROUND_WAVE_COMPRESSION;
            this.offsetStretches.push(offsetStretche);
            cc.log("backgroundWaveData: " + "sineOffset: " + sineOffset +
                " sineAmplitude: " + sineAmplitude + " sineStretche: " +
                sineStretche + " offsetStretche: " + offsetStretche);
        }
    },

    overlapSines (x) {
        var result = 0;
        for (var i = 0; i < this.NUM_BACKGROUND_WAVES; i++) {
            result = result + this.sineOffsets[i] +
                this.sineAmplitudes[i] * Math.sin(x * this.sineStretches[i] +
                this.offset * this.offsetStretches[i]);
        }
        return result;
    },

    updateWavePoints (points, dt) {
        for (var i = 0; i < this.iteration; i++) {
            for (var n = 0; n < points.length; n++) {
                var p = points[n];
                var pScript = p.getComponent('ChainJoint');
                var force = 0;

                var forceFromLeft, forceFromRight;

                if (n == 0) {
                    var dy = points[points.length - 1].x - p.x;
                    forceFromLeft = this.springConstant * dy;
                } else {
                    var dy = points[n - 1].x - p.x;
                    forceFromLeft = this.springConstant * dy;
                }
                if (n == points.length - 1) {
                    var dy = points[0].x - p.x;
                    forceFromRight = this.springConstant * dy;
                } else {
                    var dy = points[n + 1].x - p.x;
                    forceFromRight = this.springConstant * dy;
                }

                var dy = this.X_OFFSET - p.x;
                var forceToBaseline = this.springConstantBaseline * dy;

                force += forceFromLeft + forceFromRight + forceToBaseline;

                var acceleration = force / pScript.mass;

                pScript.spd = this.damping * pScript.spd + acceleration;

                p.x = this.overlapSines(p.y + this.windowsSize.height / 2 + pScript.spd);

                cc.log("节点位置：", p.x, p.y);
            }
        }
    },

    //每帧计算每个节点与阴阳小球的距离，并将距离保存在节点中
    setupJoints (eye, isYang) {
        for (var i = 1; i < this.jointAmount - 1; i++) {
            var joint = this.joints[i];
            var jointScript = joint.getComponent("ChainJoint");
            var xOffset = joint.getPosition().x - eye.getPosition().x;
            var yOffset = joint.getPosition().y - eye.getPosition().y;
            var offset = Math.round(Math.sqrt(Math.pow(xOffset, 2) + Math.pow(yOffset, 2)));
            if (isYang) {
                jointScript.disToYang = offset;
            } else {
                jointScript.disToYin = offset;
            }
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
