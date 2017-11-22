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
var HitTest = (function (_super) {
    __extends(HitTest, _super);
    function HitTest() {
        var _this = _super.call(this) || this;
        _this.addEventListener(egret.Event.ADDED_TO_STAGE, _this.onAddToStage, _this);
        return _this;
    }
    HitTest.prototype.onAddToStage = function (event) {
        this.drawText();
        var shp = new egret.Shape();
        shp.graphics.beginFill(0xff0000);
        shp.graphics.drawRect(0, 0, 100, 100);
        shp.graphics.endFill();
        shp.width = 100;
        shp.height = 100;
        this.addChild(shp);
        var isHit = shp.hitTestPoint(10, 10);
        this.infoText.text = "碰撞结果" + isHit;
    };
    HitTest.prototype.drawText = function () {
        this.infoText = new egret.TextField();
        this.infoText.y = 200;
        this.infoText.text = "碰撞结果";
        this.addChild(this.infoText);
    };
    return HitTest;
}(egret.DisplayObjectContainer));
__reflect(HitTest.prototype, "HitTest");
//# sourceMappingURL=HitTest.js.map