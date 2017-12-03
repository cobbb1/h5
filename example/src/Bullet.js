var Bullet = (function(_super){
    function Bullet(){
        Role.call(this);
        //初始化
        // this.init();
    }
    //是否缓存了动画
    Laya.class(Bullet,"Bullet",_super);
    Bullet.prototype=new Role()
    var _proto = Bullet.prototype;
    _proto.init = function(_type,_camp,_hp,_speed,_hitRadius,_heroType){
        
    }
})(Laya.Sprite);