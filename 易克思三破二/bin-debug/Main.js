/**
 * 第三方 物理引擎演示
 */
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
        _this._isDebug = false;
        _this.addEventListener(egret.Event.ADDED_TO_STAGE, _this.onAddToStage, _this);
        return _this;
    }
    Main.prototype.onAddToStage = function (event) {
        //设置加载进度界面
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);
        //初始化Resource资源加载库
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    };
    /**
     * 配置文件加载完成,开始预加载preload资源组。
     */
    Main.prototype.onConfigComplete = function (event) {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.loadGroup("preload");
    };
    /**
     * preload资源组加载完成
     */
    Main.prototype.onResourceLoadComplete = function (event) {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            this.createGameScene();
        }
    };
    /**
     * preload资源组加载进度
     */
    Main.prototype.onResourceProgress = function (event) {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    };
    /**
     * 创建游戏场景
     */
    Main.prototype.createGameScene = function () {
        var _this = this;
        var factor = 50;
        //创建world
        var world = new p2.World();
        world.sleepMode = p2.World.BODY_SLEEPING;
        //创建plane
        var planeShape = new p2.Plane();
        var planeBody = new p2.Body();
        planeBody.addShape(planeShape);
        planeBody.displays = [];
        world.addBody(planeBody);
        egret.Ticker.getInstance().register(function (dt) {
            if (dt < 10) {
                return;
            }
            if (dt > 1000) {
                return;
            }
            world.step(dt / 1000);
            if (!self._isDebug) {
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
                }
            }
        }, this);
        //鼠标点击添加刚体
        this.stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, onTouch, this);
        var self = this;
        function onTouch(e) {
            var positionX = Math.floor(e.stageX / factor);
            var positionY = Math.floor((egret.MainContext.instance.stage.stageHeight - e.stageY) / factor);
            addOneBox(positionX, positionY);
        }
        function addOneBox(positionX, positionY) {
            if (Math.random() > 0.5) {
                //添加方形刚体
                var boxShape = new p2.Rectangle(2, 1);
                var boxBody = new p2.Body({ mass: 1, position: [positionX, positionY], angularVelocity: 1 });
                boxBody.addShape(boxShape);
                world.addBody(boxBody);
                var display = self.createBitmapByName("rect");
                display.width = boxShape.width * factor;
                display.height = boxShape.height * factor;
            }
            else {
                //添加圆形刚体
                var boxShape = new p2.Circle(1);
                var boxBody = new p2.Body({ mass: 1, position: [positionX, positionY] });
                boxBody.addShape(boxShape);
                world.addBody(boxBody);
                var display = self.createBitmapByName("circle");
                display.width = boxShape.radius * 2 * factor;
                display.height = boxShape.radius * 2 * factor;
            }
            if (!self._isDebug) {
                display.anchorOffsetX = display.width / 2;
                display.anchorOffsetY = display.height / 2;
                boxBody.displays = [display];
                self.addChild(display);
            }
        }
        for (var i = 0; i < 8; i++) {
            addOneBox(2 * i + 2, 2 * i + 5);
        }
        var bitmapFont = RES.getRes("font_fnt");
        var bitmapText = new egret.BitmapText();
        bitmapText.text = "Click!";
        bitmapText.font = bitmapFont;
        bitmapText.anchorOffsetX = bitmapText.width / 2;
        bitmapText.anchorOffsetY = bitmapText.height / 2;
        bitmapText.x = this.stage.stageWidth / 2;
        bitmapText.y = this.stage.stageHeight / 2;
        this.addChild(bitmapText);
        bitmapText.touchEnabled = true;
        bitmapText.addEventListener(egret.TouchEvent.TOUCH_TAP, function (event) {
            _this.removeChild(bitmapText);
        }, this);
    };
    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     */
    Main.prototype.createBitmapByName = function (name) {
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        return result;
    };
    return Main;
}(egret.DisplayObjectContainer));
__reflect(Main.prototype, "Main");
//# sourceMappingURL=Main.js.map