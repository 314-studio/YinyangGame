// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

//SlidingTrack是阴阳两球滑动的轨道，用于给小球和光环提供坐标
cc.Class({
    extends: cc.Component,

    properties: {
        leader: {
            type: cc.Node,
            default: null
        },

        openingAnimRadius: 10,
        openingAnimSmoothness: 1,
        openingAnimDuration: 0.5,

        enableClickToMove: true,

        lagSeconds: 1,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.yangEye = this.node.getChildByName("Yang");
        this.yinEye = this.node.getChildByName("Yin");

        this.maxAngle = 70 * Math.PI / 180;

        this.ctx = this.getComponent(cc.Graphics);

        this.openingAnimPlaying = false;
        this.touchMove = false;
        this.sliding = false;

        //this.smoothness = 1;
    },

    start () {
        if (Global.debug) {
            this.drawDebugCircle();
            cc.log("parent Position: ", this.node.getPosition().x,
                this.node.getPosition().y);
        }
        this.yangEye.setPosition(Global.radius, 0);
        this.yinEye.setPosition(-Global.radius, 0);

        //cc.log("新的位置",this.generateRamdomHaloPositon());

        //用于储存阴阳移动的路径点
        this.pathPoints = new Array();

        //新的阴阳移动
        this.target = cc.v2();
        //this.haloEmergeAnimDuration = 0;

        this.initActions();

        this.playOpeningAnimation(true);

        // if (this.enableClickToMove) {

        // }
        this.slidingAngle = 0;
        //this.currentAngle = 0;
        this.winSize = cc.winSize;
        this.haloSpawnMargin = 40;
        
        //用于跟随
        this.leaderControl = this.leader.getComponent('Leader');
        this.MAX_FPS = 60;
        this.time = 0;

        this.initBuffer();
    },

    initBuffer () {
        this.leader.setPosition(cc.v2(Global.radius, 0));
        var bufferLength = Math.ceil(this.lagSeconds * this.MAX_FPS);
        this._positionBuffer = new Array(bufferLength);
        this._timeBuffer = new Array(bufferLength);

        this._positionBuffer[0] = this._positionBuffer[1] = this.leader.getPosition();
        this._timeBuffer[0] = this._timeBuffer[1] = this.time;
        this._oldestIndex = 0;
        this._newestIndex = 1;
    },

    update (dt) {
        if (Global.gameStarted) {
            this.time += dt;
            // if (this.sliding) {
            //     //if (!this.touchMove) {
            //         var pos = this.posOnCircleFormAngle(this.slidingAngle);
            //         this.yangEye.setPosition(pos);
            //         this.yinEye.setPosition(cc.v2(-pos.x, -pos.y));
            //         cc.log(this.slidingAngle, pos);
            //     //} else {
            //         //this.sliding = false;
            //     //}
            // }
            // } else {
            //     if (this.enableClickToMove) {
            //         if (this.pathPoints.length > 0) {
            //             this.slideTo(this.pathPoints[0]);
            //             this.pathPoints.splice(0, 1);
            //             this.slidingAngle = this.positionToAngle(this.yangEye.getPosition());
            //         }
            //     }
            // }
            

            //控制小球不能超过自己的区域
            // if (this.touchMove) {
            //     if (this.yinEye.getPosition().x > 0) {
            //         if (this.yinEye.getPosition().y > 0) {
            //             this.yinEye.setPosition(0, Global.radius);
            //         } else {
            //             this.yinEye.setPosition(0, -Global.radius);
            //         }
            //     }
            //     if (this.yangEye.getPosition().x < 0) {
            //         if (this.yangEye.getPosition().y > 0) {
            //             this.yangEye.setPosition(0, Global.radius);
            //         } else {
            //             this.yangEye.setPosition(0, -Global.radius);
            //         }
            //     }
            // }
        }


        if (Global.debug) {
            this.ctx.clear();
            this.drawDebugCircle();
            this.ctx.circle(this.yinEye.getPosition().x,
                this.yinEye.getPosition().y, Global.radius);
            this.ctx.circle(this.yangEye.getPosition().x,
                this.yangEye.getPosition().y, Global.radius);
            this.ctx.stroke();
        }
    },


    lateUpdate (dt) {
        if (Global.gameStarted) {
            if (this.leaderControl.moving) {
                // Insert newest position into our cache.
                // If the cache is full, overwrite the latest sample.
                var newIndex = (this._newestIndex + 1) % this._positionBuffer.length;
                if (newIndex != this._oldestIndex) {
                    this._newestIndex = newIndex;
                }

                this._positionBuffer[this._newestIndex] = this.leader.getPosition();
                this._timeBuffer[this._newestIndex] = this.time;

                // Skip ahead in the buffer to the segment containing our target time.
                var targetTime = this.time - this.lagSeconds;
                var nextIndex;
                while (this._timeBuffer[nextIndex = (this._oldestIndex + 1) % this._timeBuffer.length] < targetTime) {
                    this._oldestIndex = nextIndex;
                }

                // Interpolate between the two samples on either side of our target time.
                var span = this._timeBuffer[nextIndex] - this._timeBuffer[this._oldestIndex];
                var progress = 0;
                if (span > 0) {
                    progress = (targetTime - this._timeBuffer[this._oldestIndex]) / span;
                }

                this.yangEye.setPosition(this._positionBuffer[this._oldestIndex].lerp(this._positionBuffer[nextIndex], progress));
                this.yinEye.setPosition(cc.v2(-this.yangEye.x, -this.yangEye.y));
            } else if (this.sliding) {
                var pos = this.posOnCircleFormAngle(this.slidingAngle);
                this.yangEye.setPosition(pos);
                this.yinEye.setPosition(cc.v2(-pos.x, -pos.y));
                cc.log(this.slidingAngle, pos);
            }
        }
    },

    moveEyeByDelta (isYang, delta) {
        var angle = Math.atan(delta.y / Global.radius);
        if (isYang) {
            var currentAngle = this.positionToAngle(this.yangEye.getPosition());
            this.yangEye.setPosition(this.posOnCircleFormAngle(currentAngle + angle));
        } else {
            var currentAngle = this.positionToAngle(this.yinEye.getPosition());
            this.yinEye.setPosition(this.posOnCircleFormAngle(currentAngle - angle));
        }
    },

    //动画结束后将阴阳小球移动到能形成阴阳的地方
    moveEyetoYinyang () {
        this.touchMove = false;
        this.leaderControl.cutsceneAnimPlaying = true;
        this.resetYinyangPosition();
        this.scheduleOnce(function() {
            //todo: 随机决定小球形成阴阳的放向
            // let a = Math.random() * 2;
            // let pos = cc.v2();
            // if (a < 1) {
            //     pos = cc.v2(0, Global.radius);
            // } else {
            //     pos = cc.v2(0, -Global.radius);
            // }
            this.slideTo(cc.v2(0, Global.radius));
        }, 1);
    },

    addPathPoint (point) {
        //添加路径点的方式，有可能出bug？
        if (this.pathPoints.length == 2) {
            this.pathPoints[1] = point;
        } else {
            this.pathPoints.push(point);
        }
    },

    //
    slideTo (point) {
        this.sliding = true;
        var angle = this.positionToAngle(point);

        //var pos = this.circlePosForAngle(cc.v2(0, 0), angle, Global.radius);
        // this.ctx.clear();
        // this.ctx.circle(pos.x, pos.y, 10);
        // this.ctx.fill();

        cc.tween(this)
            .to(0.5, {slidingAngle: angle}, {easing: 'quadInOut'})
            .call(() => {this.sliding = false; cc.log("滑动完成");})
            .start();

        //cc.log(angle);
    },

    positionToAngle (point) {
        var angle = Math.atan(point.y / point.x);
        if (point.x < 0) {
            angle += Math.PI;
        }
        return angle;
    },

    posOnCircleFormAngle (angle) {
        var x = Math.cos(angle) * Global.radius;
        var y = Math.sin(angle) * Global.radius;
        return cc.v2(x, y);
    },

    resetYinyangPosition () {
        this.leaderControl.reset();

        cc.tween(this.yangEye)
            .to(1, {position: cc.v2(Global.radius, 0)}, {easing: 'quadInOut'})
            .start();
        cc.tween(this.yinEye)
            .to(1, {position: cc.v2(-Global.radius, 0)}, {easing: 'quadInOut'})
            .start();
    },

    playOpeningAnimation (enable) {
        if (enable) {
            if (!this.openingAnimPlaying) {
                this.yangEye.runAction(this.yangOpeningAction);
                this.scheduleOnce(function() {
                    this.yinEye.runAction(this.yinOpeningAction);
                }, this.openingAnimDuration / 2);
                this.openingAnimPlaying = true;
            }
        } else {
            if (this.openingAnimPlaying) {
                this.yangEye.stopAction(this.yangOpeningAction);
                this.unscheduleAllCallbacks();  //动作未开始的话停止定时任务
                this.yinEye.stopAllActions();
                this.openingAnimPlaying = false;
            }
        }
    },

    drawDebugCircle () {

        this.ctx.circle(0, 0, Global.radius);
        this.ctx.stroke();
    },

    getLeaderPosition () {
        return this.leader.getPosition();
    },

    generateRamdomHaloPositon () {
        //var angle = Math.random() * 2 * this.maxAngle - this.maxAngle;
        //return this.circlePosForAngle(new cc.Vec2(0, 0), angle, radius);
        //只随机生成右边的位置，game里处理到底是左边还是右边
        var x = Math.random() * (this.winSize.width / 2 - this.haloSpawnMargin * 2) + this.haloSpawnMargin;
        var y = Math.random() * (this.winSize.height / 2 - this.haloSpawnMargin * 2) + this.haloSpawnMargin;
        //cc.log(x, y);
        return cc.v2(x, y);
    },

    circlePosForAngle (origin, angle, radius) {
        var x = Math.cos(angle) * radius + origin.x;
        var y = Math.sin(angle) * radius + origin.y;

        //cc.log(x, y)

        return new cc.Vec2(x, y);
    },

    initActions () {
        this.yangOpeningAction = cc.repeatForever(
            cc.sequence(
                cc.moveBy(this.openingAnimDuration, cc.v2(this.openingAnimRadius, 0))
                    .easing(cc.easeSineInOut()),
                cc.moveBy(this.openingAnimDuration, cc.v2(-this.openingAnimRadius, 0))
                    .easing(cc.easeSineInOut())
            )
        );

        this.yinOpeningAction = cc.repeatForever(
            cc.sequence(
                cc.moveBy(this.openingAnimDuration, cc.v2(this.openingAnimRadius, 0))
                    .easing(cc.easeSineInOut()),
                cc.moveBy(this.openingAnimDuration, cc.v2(-this.openingAnimRadius, 0))
                    .easing(cc.easeSineInOut())
            )
        );
    },
});
