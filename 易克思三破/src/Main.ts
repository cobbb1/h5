/**
 * 第三方 物理引擎演示
 */

class Main extends egret.DisplayObjectContainer {

    /**
     * 加载进度界面
     */
    private loadingView:LoadingUI;

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event:egret.Event) {
        //设置加载进度界面
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);

        //初始化Resource资源加载库
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    }

    /**
     * 配置文件加载完成,开始预加载preload资源组。
     */
    private onConfigComplete(event:RES.ResourceEvent):void {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.loadGroup("preload");
    }

    /**
     * preload资源组加载完成
     */
    private onResourceLoadComplete(event:RES.ResourceEvent):void {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            this.createGameScene();
        }
    }

    /**
     * preload资源组加载进度
     */
    private onResourceProgress(event:RES.ResourceEvent):void {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    }

    private _isDebug:boolean = false;

    /**
     * 创建游戏场景
     */
    private createGameScene():void {
        
        var factor:number = 50;

        //创建world
        var world:p2.World = new p2.World();
        world.sleepMode = p2.World.BODY_SLEEPING;

        //创建plane
        var planeShape:p2.Plane = new p2.Plane();
        var planeBody:p2.Body = new p2.Body();
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
                var stageHeight:number = egret.MainContext.instance.stage.stageHeight;
                var l = world.bodies.length;
                for (var i:number = 0; i < l; i++) {
                    var boxBody:p2.Body = world.bodies[i];
                    var box:egret.DisplayObject = boxBody.displays[0];
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

        function onTouch(e:egret.TouchEvent):void {
            var positionX:number = Math.floor(e.stageX / factor);
            var positionY:number = Math.floor((egret.MainContext.instance.stage.stageHeight - e.stageY) / factor);
			addOneBox(positionX,positionY);
        }
		function addOneBox(positionX,positionY) {
			if (Math.random() > 0.5) {
                //添加方形刚体
                var boxShape:p2.Shape = new p2.Rectangle(2, 1);
                var boxBody:p2.Body = new p2.Body({ mass: 1, position: [positionX, positionY], angularVelocity: 1});
                boxBody.addShape(boxShape);
                world.addBody(boxBody);

                var display:egret.DisplayObject = self.createBitmapByName("rect");
                display.width = (<p2.Rectangle>boxShape).width * factor;
                display.height = (<p2.Rectangle>boxShape).height * factor;
            }
            else {
                //添加圆形刚体
                var boxShape:p2.Shape = new p2.Circle(1);
                var boxBody:p2.Body = new p2.Body({ mass: 1, position: [positionX, positionY]});
                boxBody.addShape(boxShape);
                world.addBody(boxBody);

                var display:egret.DisplayObject = self.createBitmapByName("circle");
                display.width = (<p2.Circle>boxShape).radius * 2 * factor;
                display.height = (<p2.Circle>boxShape).radius * 2 * factor;
            }

            if (!self._isDebug) {
                display.anchorOffsetX = display.width / 2
				display.anchorOffsetY = display.height / 2;
                boxBody.displays = [display];
                self.addChild(display);
            }
		}
		for(var i=0;i<8;i++){
			addOneBox(2*i+2,2*i+5);
		}
		
		var bitmapFont:egret.BitmapFont = RES.getRes("font_fnt");

		var bitmapText:egret.BitmapText = new egret.BitmapText();

		bitmapText.text = "Click!"
	
		bitmapText.font = bitmapFont;
		bitmapText.anchorOffsetX = bitmapText.width / 2;
		bitmapText.anchorOffsetY = bitmapText.height / 2;
		bitmapText.x = this.stage.stageWidth / 2;
		bitmapText.y = this.stage.stageHeight / 2;
		this.addChild(bitmapText);
		bitmapText.touchEnabled = true;
		bitmapText.addEventListener(egret.TouchEvent.TOUCH_TAP,(event:egret.TouchEvent)=>{
			this.removeChild(bitmapText);
		},this);
		
    }

    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     */
    private createBitmapByName(name:string):egret.Bitmap {
        var result:egret.Bitmap = new egret.Bitmap();
        var texture:egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }
}


