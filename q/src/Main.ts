class Main extends egret.DisplayObjectContainer {

    public constructor() {
        super();
        this.once( egret.Event.ADDED_TO_STAGE, this.onAddToStage, this );
    }

    private theLineFlag:boolean;
    private theline:egret.Shape;
    private theLineBeginX:number;
    private theLineBeginY:number;
    private playerA:egret.Shape;

    private onAddToStage(event:egret.Event) {
        this.theLineFlag=false;
        this.theline = new egret.Shape();
        this.addChild(this.theline);
        this.addToStage();
    }


    private drawingLine(thelinex:number,theliney:number):void {
        this.theline.graphics.clear();
        this.theline.graphics.lineStyle(2, 0x000fff);
        this.theline.graphics.moveTo(this.theLineBeginX, this.theLineBeginY);
        this.theline.graphics.lineTo(thelinex, theliney);
    }

    private _iTouchCollideStatus:number;
    private _bShapeTest:boolean;


    private createABall():egret.Sprite{
        var result:egret.Sprite = new egret.Sprite();
        result.graphics.beginFill(0x000fff);
        result.graphics.drawCircle(50,50,10);
        result.graphics.endFill();
        return result;
    }

    private launchCollisionTest():void {
        var body:p2.Body = new p2.Body();
        var shpCircle:p2.Shape = new p2.Circle();
        //创建平面形状
        var shpPlane:p2.Plane = new p2.Plane();


        var bodyCircle:p2.Body = new p2.Body({position:[1,100],mass:0.05});
        bodyCircle.addShape( shpCircle );

        var world:p2.World = new p2.World();
        //将之前创建的刚体加入world
        world.addBody( bodyCircle );

        var ball:egret.DisplayObject = this.createABall()
        bodyCircle.displays = [ball];
        this.addChild(ball);

        
        var factor:number = 5;

        egret.Ticker.getInstance().register(function (dt) {
            if (dt < 10) {
                return;
            }
            if (dt > 1000) {
                return;
            }
            world.step(dt / 1000);

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
                console.log(boxBody.position[0],boxBody.position[1]);
            }
            
        }, this);

        

        this._iTouchCollideStatus = TouchCollideStatus.NO_TOUCHED;
        this._bShapeTest = false;
        this.stage.addEventListener( egret.TouchEvent.TOUCH_BEGIN, this.touchHandler, this );
    }

    private checkCollision( stageX:number, stageY:number ):void {
        /*** 本示例关键代码段开始 ***/
        this._dot = new egret.Shape;
        this._dot.graphics.beginFill( 0x00ff00 );
        this._dot.graphics.drawCircle( stageX, stageY, 5 );
        this._dot.graphics.endFill();
        /*** 本示例关键代码段结束 ***/

            /// 小圆点同步手指位置
        this._dot.x = stageX;
        this._dot.y = stageY;

        /// 文字信息更新
        
    }

    private touchHandler( evt:egret.TouchEvent ){
        switch ( evt.type ){
            case egret.TouchEvent.TOUCH_MOVE:
                if ( this.theLineFlag )
                    this.drawingLine( evt.stageX, evt.stageY );
                break;
            case egret.TouchEvent.TOUCH_BEGIN:
                //if( !this._txInfo.hitTestPoint( evt.stageX, evt.stageY ) ){ 
                    this.theLineBeginX=evt.stageX;
                    this.theLineBeginY=evt.stageY;
                    this.drawingLine(evt.stageX, evt.stageY);
                    this.theLineFlag=true;
                    this.stage.addEventListener( egret.TouchEvent.TOUCH_MOVE, this.touchHandler, this );
                    this.stage.once( egret.TouchEvent.TOUCH_END, this.touchHandler, this );
                //}
                break;
            case egret. TouchEvent.TOUCH_END:
                this.theline.graphics.clear();
                this.theLineFlag=false;
                this.stage.removeEventListener( egret.TouchEvent.TOUCH_MOVE, this.touchHandler, this );
                this.stage.addEventListener( egret.TouchEvent.TOUCH_BEGIN, this.touchHandler, this );
                break;
        }
    }
    

    private _bird:egret.Bitmap;
    private _dot:egret.Shape;
    private _txInfo:egret.TextField;

    private addToStage():void {
        
        this.launchCollisionTest();
        
    }

}


class TouchCollideStatus{
    public static NO_TOUCHED:number = 0;
    public static TOUCHED_NO_COLLIDED:number = 1;
    public static COLLIDED:number = 2;
}