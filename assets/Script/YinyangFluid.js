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

        this.yangEye = this.slidingTrack.getChildByName("Yang");
        this.yinEye = this.slidingTrack.getChildByName("Yin");

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

        //曲线弯曲度，次方
        this.curveDegree = 2;

        //过场(cutscene)动画相关
        this.cutsceneAnimPlaying = true;
        this.eachBorderJointAmount = 3;
        this.initCutsceneJoint();
        this.cutsceenPointAnimDuration = 4;
        this.bSplineOffset = 30;
    },

    start () {
        this.bSplineOffsetM = Math.cos(Math.PI * 45 / 180) * this.bSplineOffset;
        //初始化受力节点的位置与渲染用节点
        for (var i = 0; i < this.jointAmount; i++) {
            this.joints[i].setPosition(0,
                 this.windowsSize.height / 2 - (i * this.windowsSize.height / (this.jointAmount - 1)));
        }
        this.ctx = this.getComponent(cc.Graphics);
        //初始化背景波纹sine值
        this.backgroundWaveData();

        this.playCutsenceAnim();
    },

    update (dt) {
        if (!Global.gameStarted) {
            this.offset += 1;
            this.updateWavePoints(this.joints, dt);
        } else {
            this.setupJoints(this.yangEye, true);
            this.setupJoints(this.yinEye, false);
        }

        this.drawCurve();
        this.drawDebugInfo();
    },

    shake (positionY) {
        cc.log("击中点Y: " + positionY);
    },

    //初始化背景波纹sine值，使用多个杂乱的正弦波来模拟水波的效果
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

    //对于给定的x，求在多个正弦波下重合的结果
    overlapSines (x) {
        var result = 0;
        for (var i = 0; i < this.NUM_BACKGROUND_WAVES; i++) {
            result = result + this.sineOffsets[i] +
                this.sineAmplitudes[i] * Math.sin(x * this.sineStretches[i] +
                this.offset * this.offsetStretches[i]);
        }
        return result;
    },

    //每帧更新新的波纹的位置
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

                //cc.log("节点位置：", p.x, p.y);
            }
        }
    },

    //每帧计算每个节点与阴阳小球的距离，并将距离保存在节点中
    setupJoints (eye, isYang) {
        for (var i = 0; i < this.jointAmount; i++) {
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

    initCutsceneJoint () {
        //从左下角开始顺时针构建节点
        var halfWindowWidth = this.windowsSize.width / 2;
        var halfWindowHeight = this.windowsSize.height / 2;
        this.whiteBorderJoints = new Array(
            cc.v2(-halfWindowWidth, -halfWindowHeight),
            cc.v2(-halfWindowWidth, 0),
            cc.v2(-halfWindowWidth, halfWindowHeight),
        );
        this.blackBorderJoints = new Array(
            cc.v2(halfWindowWidth, halfWindowHeight),
            cc.v2(halfWindowWidth, 0),
            cc.v2(halfWindowWidth, -halfWindowHeight),
        );
    },

    playCutsenceAnim () {
        var middlePPP = this.slidingTrack.getComponent("SlidingTrack")
            .circlePosForAngle(cc.v2(0, 0), 45 * Math.PI / 180, Global.radius * 2);
        middlePPP = cc.v2(middlePPP.x + this.bSplineOffsetM, middlePPP.y + this.bSplineOffsetM);
        cc.tween(this.whiteBorderJoints[0])
            .to(this.cutsceenPointAnimDuration, {x: -middlePPP.x, y: -middlePPP.y})
            .start();
        cc.tween(this.whiteBorderJoints[1])
            .to(this.cutsceenPointAnimDuration, {x: -Global.radius * 2 - this.bSplineOffset, y: 0})
            .start();
        cc.tween(this.whiteBorderJoints[2])
            .to(this.cutsceenPointAnimDuration, {x: -middlePPP.x, y: middlePPP.y})
            .start();
        cc.tween(this.blackBorderJoints[0])
            .to(this.cutsceenPointAnimDuration, {x: middlePPP.x, y: middlePPP.y})
            .start();
        cc.tween(this.blackBorderJoints[1])
            .to(this.cutsceenPointAnimDuration, {x: Global.radius * 2 + this.bSplineOffset, y: 0})
            .start();
        cc.tween(this.blackBorderJoints[2])
            .to(this.cutsceenPointAnimDuration, {x: middlePPP.x, y: -middlePPP.y})
            .start();
    },

    //画线与白色液体，黑色是背景图片
    drawCurve () {
        var points = new Array(this.jointAmount);
        for (var i = 0; i < this.jointAmount; i ++) {
            var joint = this.joints[i];
            points[i] = [joint.getPosition().x, joint.getPosition().y];
        }

        //黑白阴阳边界，如果播放过场动画的话，开始实时计算边界点的位置
        var whitePoints = new Array(this.eachBorderJointAmount + 2);
        var blackPoints = new Array(this.eachBorderJointAmount + 2);
        if (this.cutsceneAnimPlaying) {
            whitePoints[0] = points[this.jointAmount - 1];
            whitePoints[this.eachBorderJointAmount + 1] = points[0];
            for (var i = 0; i < this.eachBorderJointAmount; i++) {
                whitePoints[i + 1] = [this.whiteBorderJoints[i].x,
                                      this.whiteBorderJoints[i].y];
            }
            blackPoints[0] = points[0];
            blackPoints[this.eachBorderJointAmount + 1] = points[this.jointAmount - 1];
            for (var i = 0; i < this.eachBorderJointAmount; i++) {
                blackPoints[i + 1] = [this.blackBorderJoints[i].x,
                                      this.blackBorderJoints[i].y];
            }
        }
        var whitePointsSmooth = new Array();

        this.ctx.clear();

        //画黑色液体
        this.ctx.moveTo(points[this.jointAmount-1][0], points[this.jointAmount-1][1]);
        if (this.cutsceneAnimPlaying) {
            for (var t = 0; t < 1; t += 0.02) {
                var point = bSpline(t, this.curveDegree, whitePoints);
                if (t > 0) {
                    whitePointsSmooth.push(point);
                    this.ctx.lineTo(point[0], point[1]);
                }
            }
            this.ctx.lineTo(whitePoints[whitePoints.length - 1][0], whitePoints[whitePoints.length - 1][1]);
            for (var t = 0; t < 1; t += 0.02) {
                var point = bSpline(t, this.curveDegree, blackPoints);
                if (t > 0) {
                    this.ctx.lineTo(point[0], point[1]);
                }
            }
        } else {
            for (var i = 0; i < this.eachBorderJointAmount; i++) {
                this.ctx.lineTo(this.whiteBorderJoints[i].x, this.whiteBorderJoints[i].y);
            }
            this.ctx.lineTo(points[0][0], points[0][1])
            for (var i = 0; i < this.eachBorderJointAmount; i++) {
                this.ctx.lineTo(this.blackBorderJoints[i].x, this.blackBorderJoints[i].y);
            }
        }
        this.ctx.lineTo(points[this.jointAmount-1][0], points[this.jointAmount-1][1]);
        this.ctx.fillColor = cc.Color.BLACK;
        this.ctx.fill();

        //画白色液体及曲线
        this.ctx.moveTo(points[0][0], points[0][1]);
        for (var t = 0; t < 1; t += 0.01) {
            var point = bSpline(t, this.curveDegree, points);
            //cc.log("point到底是什么？",point)
            if (t > 0) {
                this.ctx.lineTo(point[0], point[1]);
            }
        }
        this.ctx.lineTo(points[this.jointAmount-1][0], points[this.jointAmount-1][1]);

        if (this.cutsceneAnimPlaying) {
            for (var i = 0; i < whitePointsSmooth.length; i++) {
                this.ctx.lineTo(whitePointsSmooth[i][0], whitePointsSmooth[i][1]);
            }
        } else {
            for (var i = 0; i < this.eachBorderJointAmount; i++) {
                this.ctx.lineTo(this.whiteBorderJoints[i].x, this.whiteBorderJoints[i].y);
            }
        }
        this.ctx.lineTo(points[0][0], points[0][1]);
        this.ctx.fillColor = cc.Color.WHITE;
        this.ctx.fill();
    },

    drawDebugInfo () {
        this.ctx.circle(0, 0, Global.radius * 2);
        this.ctx.stroke();
    },
});
