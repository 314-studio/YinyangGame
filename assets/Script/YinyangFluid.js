
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
var BorderKnot = require("BorderKnot");
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
        iteration: 5,
        borderKnotAmount: 80,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // -- Everything inside me is dark and twisted.
        // -- So am I.

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

        //过场(cutscene)动画相关
        this.cutsceneAnimPlaying = false;
        this.actionDelta = 0;
    },

    start () {
        //this.gameStarted = false;
        //初始化节点的位置
        for (var i = 0; i < this.jointAmount; i++) {
            this.joints[i].setPosition(0,
                 this.windowsSize.height / 2 - (i * this.windowsSize.height / (this.jointAmount - 1)));
        }
        this.ctx = this.getComponent(cc.Graphics);
        //初始化背景波纹sine值
        this.backgroundWaveData();

        this.initBorderKnots();

        this.borderReseted = true;

        this.delta = 0;
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

        if (this.cutsceneAnimPlaying) {
            if (this.borderReseted) {
                this.borderReseted = false;
            }

            this.actionDelta += dt;
            this.delta += dt;

            if (this.delta >= 1) {
                var count = Math.round(Math.random() * (this.borderKnotAmount - 1));
                this.borderKnots[count].stripped = true;
            }

            for (var i = 0; i < this.borderKnots.length; i++) {
                this.borderKnots[i].update(this.actionDelta, dt);
            }
        } else {
            //过场动画结束播放后，如果边界点没有重置，就重置边界点。
            if (!this.borderReseted) {
                for (var i = 0; i < this.borderKnots.length; i++) {
                    this.borderKnots[i].reset();
                }
                this.actionDelta = 0;
                this.borderReseted = true;
            }
        }

        //this.debugDraw();
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

    startGame () {
        // Global.gameStarted = true;
        // for (var i = 0; i < this.jointAmount; i++) {
        //     this.joints[i].getComponent("ChainJoint").gameStarted = true;
        // }
    },

    initBorderKnots () {
        var winWidth = this.windowsSize.width;
        var winHeight = this.windowsSize.height;
        var upperMidpoint = cc.v2(0, this.windowsSize.height / 2);
        var lowerMidpoint = cc.v2(0, -this.windowsSize.height / 2);
        //长宽节点的数量一样
        var knotsOnEachBorder = this.borderKnotAmount / 4;
        var wSpacing = winWidth / knotsOnEachBorder;
        var hSpacing = winHeight / knotsOnEachBorder;
        //cc.log("border knot spacing: " + spacing);

        var halfWidth = winWidth / 2;
        var halfHeight = winHeight / 2;

        //顺时针生成边界节点
        var upperBorder = this.generateKnots(knotsOnEachBorder, wSpacing, true,
            -halfWidth, halfHeight);
        var lowerBorder = this.generateKnots(knotsOnEachBorder, -wSpacing, true,
            halfWidth, -halfHeight);
        var leftBorder = this.generateKnots(knotsOnEachBorder, hSpacing, false,
            -halfHeight, -halfWidth);
        var rightBorder = this.generateKnots(knotsOnEachBorder, -hSpacing, false,
            halfHeight, halfWidth);

        var whiteBorder = new Array();
        var blackBorder = new Array();
        for (var i = lowerBorder.length / 2; i < lowerBorder.length; i++) {
            whiteBorder.push(lowerBorder[i]);
        }
        whiteBorder = whiteBorder.concat(leftBorder);
        for (var i = 0; i < upperBorder.length; i++) {
            if (i < upperBorder.length / 2) {
                whiteBorder.push(upperBorder[i]);
            } else if (i == upperBorder.length / 2) {
                whiteBorder.push(upperBorder[i]);
                blackBorder.push(upperBorder[i]);
            } else {
                blackBorder.push(upperBorder[i]);
            }
        }
        blackBorder = blackBorder.concat(rightBorder);
        for (var i = 0; i < lowerBorder.length / 2 + 1; i++) {
            blackBorder.push(lowerBorder[i]);
        }

        cc.log(knotsOnEachBorder, whiteBorder, blackBorder);

        this.borderKnots = upperBorder.concat(rightBorder).concat(lowerBorder)
                           .concat(leftBorder);
        cc.log("all border knots: ", this.borderKnots);

        this.setupBorderKnots(this.borderKnots);

        this.whiteBorderKnots = whiteBorder;
        this.blackBorderKnots = blackBorder;
    },

    setupBorderKnots (knots) {
        //将被一个边界节点的前后节点绑定在该节点上
        for (var i = 0; i < knots.length; i++) {
            if (i == 0) {
                knots[i].previousKnot = knots[knots.length - 1];
                knots[i].latterKnot = knots[1];
            } else if (i == knots.length - 1) {
                knots[i].previousKnot = knots[knots.length - 2];
                knots[i].latterKnot = knots[0];
            } else {
                knots[i].previousKnot = knots[i - 1];
                knots[i].latterKnot = knots[i + 1];
            }
            knots[i].initiate(12);

            //knots[i].playAction();
        }
    },

    generateKnots (knotAmount, spacing, onX, startValue, offset) {
        var knots = new Array(knotAmount);
        for (var i = 0; i < knotAmount; i++) {
            var knot = new BorderKnot();
            if (onX) {
                knot.x = startValue + i * spacing;
                knot.y = offset;
            } else {
                knot.x = offset;
                knot.y = startValue + i * spacing;
            }
            knots[i] = knot;
        }
        return knots;
    },

    debugDraw () {
        for (var i = 0; i < this.borderKnots.length; i++) {
            this.ctx.rect(this.borderKnots[i].x - 5, this.borderKnots[i].y - 5, 10, 10);
            this.ctx.fillColor = cc.Color.RED;
            this.ctx.fill();
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

        var cutsceneWhitePoints = new Array(this.blackBorderKnots.length);
        var cutsceneBlackPoints = new Array(this.whiteBorderKnots.length);

        if (this.cutsceneAnimPlaying) {
            for (var i = 0; i < this.blackBorderKnots.length; i++) {
                cutsceneBlackPoints[i] = [this.blackBorderKnots[i].x,
                    this.blackBorderKnots[i].y];
            }
            for (var i = 0; i < this.whiteBorderKnots.length; i++) {
                cutsceneWhitePoints[i] = [this.whiteBorderKnots[i].x,
                    this.whiteBorderKnots[i].y];
            }

            this.ctx.circle(0, 0, Global.radius * 2 - 1);
            this.ctx.fillColor = cc.Color.BLACK;
            this.ctx.fill();

            this.ctx.moveTo(cutsceneBlackPoints[0][0], cutsceneBlackPoints[0][1]);
            for (var t = 0; t < 1; t += 0.01) {
                var point = bSpline(t, degree, cutsceneBlackPoints);
                if (t > 0) {
                    this.ctx.lineTo(point[0], point[1]);
                }
            }
            this.ctx.lineTo(cutsceneBlackPoints[cutsceneBlackPoints.length - 1][0],
                cutsceneBlackPoints[cutsceneBlackPoints.length - 1][1]);
        } else {
            this.ctx.rect(-this.windowsSize.width / 2, -this.windowsSize.height / 2,
                            this.windowsSize.width, this.windowsSize.height);
        }
        this.ctx.fillColor = cc.Color.BLACK;
        this.ctx.fill();

        this.ctx.moveTo(points[0][0], points[0][1]);
        for (var t = 0; t < 1; t += 0.01) {
            var point = bSpline(t, degree, points);
            if (t > 0) {
                this.ctx.lineTo(point[0], point[1]);
            }
        }
        this.ctx.lineTo(points[this.jointAmount-1][0], points[this.jointAmount-1][1]);

        if (this.cutsceneAnimPlaying) {
            for (var t = 0; t < 1; t += 0.01) {
                var point = bSpline(t, degree, cutsceneWhitePoints);
                if (t > 0) {
                    this.ctx.lineTo(point[0], point[1]);
                }
            }
        } else {
            this.ctx.lineTo(-this.windowsSize.width / 2, -this.windowsSize.height / 2);
            this.ctx.lineTo(-this.windowsSize.width / 2, this.windowsSize.height / 2);
            this.ctx.lineTo(points[0][0], points[0][1]);
        }
        this.ctx.fillColor = cc.Color.WHITE;
        this.ctx.fill();
    },
});
