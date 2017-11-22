var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        var _this = _super.call(this) || this;
        _this.once(egret.Event.ADDED_TO_STAGE, _this.onAddToStage, _this);
        return _this;
    }
    Main.prototype.onAddToStage = function (event) {
        this.theLineFlag = false;
        this.theline = new egret.Shape();
        this.addChild(this.theline);
        this.addToStage();
    };
    Main.prototype.drawingLine = function (thelinex, theliney) {
        this.theline.graphics.clear();
        this.theline.graphics.lineStyle(2, 0x000fff);
        this.theline.graphics.moveTo(this.theLineBeginX, this.theLineBeginY);
        this.theline.graphics.lineTo(thelinex, theliney);
    };
    Main.prototype.createABall = function () {
        var result = new egret.Sprite();
        result.graphics.beginFill(0x000fff);
        result.graphics.drawCircle(50, 50, 10);
        result.graphics.endFill();
        return result;
    };
    Main.prototype.launchCollisionTest = function () {
        var body = new p2.Body();
        var shpCircle = new p2.Circle();
        //创建平面形状
        var shpPlane = new p2.Plane();
        var bodyCircle = new p2.Body({ position: [1, 100], mass: 0.05 });
        bodyCircle.addShape(shpCircle);
        var world = new p2.World();
        //将之前创建的刚体加入world
        world.addBody(bodyCircle);
        var ball = this.createABall();
        bodyCircle.displays = [ball];
        this.addChild(ball);
        var factor = 5;
        egret.Ticker.getInstance().register(function (dt) {
            if (dt < 10) {
                return;
            }
            if (dt > 1000) {
                return;
            }
            world.step(dt / 1000);
            var stageHeight = egret.MainContext.instance.stage.stageHeight;
            var l = world.bodies.length;
            for (var i = 0; i < l; i++) {
                var boxBody = world.bodies[i];
                var box = boxBody.displays[0];
                if (box) {
                    box.x = boxBody.position[0] * factor;
                    box.y = stageHeight - boxBody.position[1] * factor;
                    box.rotation = 360 - boxBody.angle * 180 / Math.PI;
                    if (boxBody.sleepState == p2.Body.SLEEPING) {
                        box.alpha = 0.5;
                    }
                    else {
                        box.alpha = 1;
                    }
                }
                console.log(boxBody.position[0], boxBody.position[1]);
            }
        }, this);
        this._iTouchCollideStatus = TouchCollideStatus.NO_TOUCHED;
        this._bShapeTest = false;
        this.stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchHandler, this);
    };
    Main.prototype.checkCollision = function (stageX, stageY) {
        /*** 本示例关键代码段开始 ***/
        this._dot = new egret.Shape;
        this._dot.graphics.beginFill(0x00ff00);
        this._dot.graphics.drawCircle(stageX, stageY, 5);
        this._dot.graphics.endFill();
        /*** 本示例关键代码段结束 ***/
        /// 小圆点同步手指位置
        this._dot.x = stageX;
        this._dot.y = stageY;
        /// 文字信息更新
    };
    Main.prototype.touchHandler = function (evt) {
        switch (evt.type) {
            case egret.TouchEvent.TOUCH_MOVE:
                if (this.theLineFlag)
                    this.drawingLine(evt.stageX, evt.stageY);
                break;
            case egret.TouchEvent.TOUCH_BEGIN:
                //if( !this._txInfo.hitTestPoint( evt.stageX, evt.stageY ) ){ 
                this.theLineBeginX = evt.stageX;
                this.theLineBeginY = evt.stageY;
                this.drawingLine(evt.stageX, evt.stageY);
                this.theLineFlag = true;
                this.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.touchHandler, this);
                this.stage.once(egret.TouchEvent.TOUCH_END, this.touchHandler, this);
                //}
                break;
            case egret.TouchEvent.TOUCH_END:
                this.theline.graphics.clear();
                this.theLineFlag = false;
                this.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.touchHandler, this);
                this.stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchHandler, this);
                break;
        }
    };
    Main.prototype.addToStage = function () {
        this.launchCollisionTest();
    };
    return Main;
}(egret.DisplayObjectContainer));
__reflect(Main.prototype, "Main");
var TouchCollideStatus = (function () {
    function TouchCollideStatus() {
    }
    TouchCollideStatus.NO_TOUCHED = 0;
    TouchCollideStatus.TOUCHED_NO_COLLIDED = 1;
    TouchCollideStatus.COLLIDED = 2;
    return TouchCollideStatus;
}());
__reflect(TouchCollideStatus.prototype, "TouchCollideStatus");
//# sourceMappingURL=Main.js.map