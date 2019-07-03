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

        //leader
        settedTime: 2,
        damping: 2,
        speed: 10,
        transformTime: 2,
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
        this.rigidbody = this.leader.getComponent(cc.RigidBody);
        this.leader.setPosition(cc.v2(Global.radius, 0));
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
        this.MAX_FPS = 60;
        this.FORCE_OFFSET = 1000;
        this.time = 0;

        this.initBuffer();

        //leader
        this.countDownBegin = false;
        this.movedSecond = 0;
        this.moving = false;
        this.cutsceneAnimPlaying = false;
        //this.remainingTimeLabel.string = "剩余时间: " + this.settedTime;
        this.currentOrigin = cc.v2();

        //cc.log(this.rigidbody.getMass());
        this.lastRandomPos = cc.v2();
        this.quadrant = 0;
        //this.startMove();
        //this.startNextRound();
        this.deltaTime = 0;
        this.margin = 100;

        this.applyForce = false;
        this.forceDirection = cc.v2();
        this.applyDuration = 0.5;
        this.appliedTime = 0;
        this.acceleration = this.speed / this.applyDuration;
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

        //leader
        if (Global.gameStarted && !this.cutsceneAnimPlaying) {
            if (!this.moving) {
                this.startMove();
            } else {
                let xDiff = this.leader.x - this.currentOrigin.x;
                let yDiff = this.leader.y - this.currentOrigin.y;
                let mo = Math.sqrt(Math.pow(xDiff, 2) + 
                                Math.pow(yDiff, 2));
                let unitVector = cc.v2(xDiff / mo, yDiff / mo);
                this.rigidbody.applyForceToCenter(cc.v2(unitVector.x * this.centripetalForce, 
                    unitVector.y * this.centripetalForce));
                
                // this.ctx.clear();
                // this.ctx.circle(this.leader.x, this.leader.y, 10);
                // this.ctx.circle(this.currentOrigin.x, this.currentOrigin.y, 10);
                // this.ctx.fill();
                // this.ctx.moveTo(this.leader.x, this.leader.y);
                // this.ctx.lineTo(unitVector.x * this.centripetalForce, unitVector.y * this.centripetalForce);
                // this.ctx.stroke();

                let halfLeaderHeight = this.yangEye.height / 2 * this.yangEye.scale;
                let halfLeaderWidth = this.yangEye.width / 2 * this.yangEye.scale;

                //当阴阳小球撞到右边和上下的墙壁时，调转放心
                if (this.leader.y > this.winSize.height / 2 - halfLeaderHeight) {
                    this.rigidbody.applyForceToCenter(cc.v2(0, -this.FORCE_OFFSET));
                } else if (this.leader.y < -this.winSize.height / 2 + halfLeaderHeight) {
                        // let speed = this.rigidbody.linearVelocity;
                        // this.rigidbody.linearVelocity = cc.v2(speed.x, -speed.y);
                        this.rigidbody.applyForceToCenter(cc.v2(0, this.FORCE_OFFSET));
                        //this.startNextRound();
                } else if (this.leader.x > this.winSize.width / 2 - halfLeaderWidth) {
                    // let speed = this.rigidbody.linearVelocity;
                    // this.rigidbody.linearVelocity = cc.v2(-speed.x, speed.y);
                    this.rigidbody.applyForceToCenter(cc.v2(-this.FORCE_OFFSET, 0));
                }
                //当阴阳小球在中间相遇时
                if (this.leader.x * 2 < halfLeaderWidth * 2 + 30) {
                    this.rigidbody.applyForceToCenter(cc.v2(this.FORCE_OFFSET, 0));
                    cc.log("太近了");
                    // let speed = this.rigidbody.linearVelocity;
                    // this.rigidbody.linearVelocity = cc.v2(-speed.x, speed.y);
                }
                if (this.deltaTime < this.transformTime) {
                    this.deltaTime += dt;
                } else {
                    this.deltaTime = 0;
                    this.startNextRound();
                }

                if (this.applyForce) {
                    this.appliedTime += dt;

                    this.rigidbody.applyForceToCenter(cc.v2(this.acceleration * this.forceDirection.x, 
                        this.acceleration * this.forceDirection.y));
                    if (this.appliedTime >= this.applyDuration) {
                        this.applyForce = false;
                        this.appliedTime = 0;
                    }
                }
            }
        }
    },


    lateUpdate (dt) {
        if (Global.gameStarted) {
            if (this.moving) {
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
        this.cutsceneAnimPlaying = true;
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
        this.reset();

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

    //leader methods
    startMove () {
        //this.moveLeaderTo(this.getRandomLeaderTarget());
        this.startNextRound();
        this.moving = true;
    },

    reset () {
        this.leader.setPosition(cc.v2(Global.radius, 0));
        this.rigidbody.linearVelocity = cc.v2();
        this.countDownBegin = false;
        this.movedSecond = 0;
        this.f = 0;
        this.moving = false;
    },

    startNextRound () {
        this.currentOrigin = this.getRandomLeaderTarget();
        let diffVector = cc.v2(this.leader.x - this.currentOrigin.x, this.leader.y - this.currentOrigin.y);
        let b = Math.sqrt(1 / (1 + Math.pow(diffVector.y, 2) / Math.pow(diffVector.x, 2)));
        let a = - diffVector.y * b / diffVector.x;

        let r = this.currentOrigin.x - cc.winSize.width / 2;
        let t = this.currentOrigin.y - cc.winSize.height / 2;
        if (r > t) {
            r = t;
        }

        //a, b 是垂直与diffVector的 单位向量 (a, b)
        this.rigidbody.linearVelocity = cc.v2(this.speed * a, this.speed * b);
        //this.rigidbody.applyLinearImpulse(cc.v2(this.speed * a, this.speed * b), cc.v2(0, 0));
        // this.forceDirection = cc.v2(a, b);
        // this.applyForce = true;
        //centripetaForce 是向心力
        this.centripetalForce = this.rigidbody.getMass() * Math.pow(this.speed, 2) / r;
        cc.log(this.centripetalForce);
    },

    moveLeaderTo (position) {
        var x = position.x;
        var y = position.y;

        this.target = cc.v2(x, y);
        let xOffset = x - this.leader.x;
        let yOffset = y - this.leader.y;
        // this.startAngle = Math.atan(yOffset / xOffset);
        // this.startDistance = Math.sqrt(Math.pow(xOffset, 2) + Math.pow(yOffset, 2));
        this.countDownBegin = true;

        //计算小球通过点击处需要的力
        let xf = xOffset / Math.pow(this.settedTime, 2) * this.rigidbody.getMass() * 2;
        let yf = yOffset / Math.pow(this.settedTime, 2) * this.rigidbody.getMass() * 2;

        //如果有初始速度的话
        if (this.rigidbody.linearVelocity != cc.v2()) {
            xf -= 2 * this.rigidbody.linearVelocity.x / this.settedTime * this.rigidbody.getMass();
            yf -= 2 * this.rigidbody.linearVelocity.y / this.settedTime * this.rigidbody.getMass();
        }

        this.rigidbody.linearDamping = 0;
        this.f = cc.v2(xf, yf);
    },

    getRandomLeaderTarget () {
        let quarterWidth = cc.winSize.width / 4;
        let halfHeight = cc.winSize.height / 2;

        let boxWidth = quarterWidth / 4;
        let boxHeight = halfHeight / 4;
        // let xDiff = this.node.x - quarterWidth;
        // let yDiff = this.node.y - halfHeight;

        let target = cc.v2(Math.random() * boxWidth, Math.random() * boxHeight);

        let nextQuadrant = 0;
        while (nextQuadrant == 0 || nextQuadrant == this.quadrant) {
            nextQuadrant = Math.ceil(Math.random() * 4);
        }
        this.quadrant = nextQuadrant;
        cc.log(this.quadrant);

        if (nextQuadrant == 1) {
            target.x += quarterWidth - quarterWidth / 4;
        } else if (nextQuadrant == 2) {
            target.x += quarterWidth;
        } else if (nextQuadrant == 3) {
            target.x += quarterWidth - quarterWidth / 4;
            target.y = -target.y;
        } else if (nextQuadrant == 4) {
            target.x += quarterWidth;
            target.y = -target.y;
        }
        cc.log(target);
        return target;
    },
});
