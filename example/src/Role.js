//角色类
var Role = (function(_super){
    function Role(){
        Role.super(this);
        //初始化
        // this.init();
    }
    //是否缓存了动画
    Role.cached = false;
    //注册类
    Laya.class(Role,"Role",_super);
    var _proto = Role.prototype;
    _proto.init = function(_type,_camp,_hp,_speed,_hitRadius,_heroType){
        if(!_heroType)_heroType = 0;
        //角色类型
        this.type = _type;
        //阵营
        this.camp = _camp;
        //血量
        this.hp = _hp;
        //速度
        this.speed = _speed;
        //被击半径
        this.hitRadius = _hitRadius;
        //0普通，1子弹，2炸药，3补给品
        this.heroType = _heroType;



        //射击类型
        this.shootType = 0;
        //射击间隔
        this.shootInterval = 2600;
        //下次射击时间
        this.shootTime = Laya.Browser.now()+2000;
        //当前动作
        this.action = "";
        //是否是子弹
        this.isBullet = false;
        if(!Role.cached){
            Role.cached = true;
            //缓存飞机的动作
            Laya.Animation.createFrames(["war/hero_fly1.png","war/hero_fly2.png"],"hero_fly");
            //缓存集中爆炸动作
            Laya.Animation.createFrames(["war/hero_down1.png","war/hero_down2.png"
            ,"war/hero_down3.png","war/hero_down4.png"],"hero_down");

            //缓存敌机1飞行动作
            Laya.Animation.createFrames(["war/enemy1_fly1.png"],"enemy1_fly");
            //缓存敌机1爆炸动作
            Laya.Animation.createFrames(["war/enemy1_down1.png","war/enemy1_down2.png","war/enemy1_down3.png"
            ,"war/enemy1_down4.png"],"enemy1_down");

            //缓存敌机2飞行动作
            Laya.Animation.createFrames(["war/enemy2_fly1.png"],"enemy2_fly");
            //缓存敌机2爆炸动作
            Laya.Animation.createFrames(["war/enemy2_down1.png","war/enemy2_down2.png","war/enemy2_down3.png"
            ,"war/enemy2_down4.png"],"enemy2_down");
            //缓存敌机2碰撞动作
            Laya.Animation.createFrames(["war/enemy2_hit.png"],"enemy2_hit");

            //缓存敌机3飞行动作
            Laya.Animation.createFrames(["war/enemy3_fly1.png","war/enemy3_fly2.png"],"enemy3_fly");
            //缓存敌机3爆炸动作
            Laya.Animation.createFrames(["war/enemy3_down1.png","war/enemy3_down2.png","war/enemy3_down3.png"
            ,"war/enemy3_down4.png","war/enemy3_down5.png","war/enemy3_down6.png"],"enemy3_down");
            //缓存敌机3碰撞动作
            Laya.Animation.createFrames(["war/enemy3_hit.png"],"enemy3_hit");

            //缓存子弹动画
            Laya.Animation.createFrames(["war/bullet1.png"],"bullet1_fly");

            //缓存强化包
            Laya.Animation.createFrames(["war/ufo1.png"],"ufo1_fly");
            //缓存医疗包
            Laya.Animation.createFrames(["war/ufo2.png"],"ufo2_fly");
        }
        if(!this.body){
            //创建一个动画作为飞机的身体
            this.body = new Laya.Animation();
            //把机体给添加到容器内
            this.addChild(this.body);

            this.body.on(Laya.Event.COMPLETE,this,this.onPlayComplete);
        }
        //播放飞行动画
        this.playAction("fly");
    }
    _proto.onPlayComplete = function(){
        //如果是击毁动画，则隐藏对象
        if(this.action === "down"){
            //停止动画播放
            this.body.stop();
            //隐藏显示
            this.visible = false;
        }
        else if(this.action === "hit"){
            //如果是被击动画播放完毕，则接着播放飞行动画
            this.playAction("fly")
        }
    }
    _proto.playAction = function(action){
        //记录当前播放动画类型
        this.action = action;
        //根据类型播放动画
        this.body.play(0,true,this.type+"_"+action);
        //获取动画大小区域
        this.bound = this.body.getBounds();
        //设置机身居中
        this.body.pos(-this.bound.width/2,-this.bound.height/2);
    }


    _proto.bulletEnter = function(bulletFlyMode, bulletFlyMode1Aim,bulletFlyMode1Speed,bulletSpeed,bulletForce,bulletType,bulletHealingType,bulletDamageType,bulletDamageNum,bulletCollisionTime,
                                  bulletDeleteType,bulletDeleteType1damage,bulletDeleteType1range,
                                  bulletDeleteType2bulletType,bulletDeleteType2Range,bulletDeleteType2Number,bulletDeleteType2Time,bulletDeleteType2Speed,bulletMaxPosition){
        this.bulletFlyMode = bulletFlyMode;
        if (this.bulletFlyMode == 1){
            this.bulletFlyMode1Aim = bulletFlyMode1Aim;
            this.bulletFlyMode1Speed = bulletFlyMode1Speed;
        }
        this.bulletType = bulletType;
        this.bulletHealingType = bulletHealingType;
        this.bulletDamageType = bulletDamageType;
        this.bulletDamageNum = bulletDamageNum;
        this.bulletSpeed = bulletSpeed;
        this.bulletForce = bulletForce;
        this.bulletCollisionTime = bulletCollisionTime;
        this.collisionTime = bulletCollisionTime;
        this.bulletDeleteType = bulletDeleteType;
        if (bulletDeleteType == 1){
            this.bulletDeleteType1damage = bulletDeleteType1damage;
            this.bulletDeleteType1range = bulletDeleteType1range;
        }
        if (bulletDeleteType == 2){
            this.bulletDeleteType2bulletType=bulletDeleteType2bulletType;
            this.bulletDeleteType2Range=bulletDeleteType2Range;
            this.bulletDeleteType2Number=bulletDeleteType2Number;
            this.bulletDeleteType2Time=bulletDeleteType2Time;
            this.bulletDeleteType2Speed=bulletDeleteType2Speed;
        }
        this.bulletMaxPosition = bulletMaxPosition;

        this.bulletCollisionLastest = "";
        this.bulletPosition = 0;
        
    }

    _proto.bulletFly = function(timeBetween){
        if (this.bulletFlyMode == 0){
            this.bulletSpeed.x = this.bulletSpeed.x + this.bulletForce.x * timeBetween;
            this.bulletSpeed.y = this.bulletSpeed.y + this.bulletForce.y * timeBetween;
            
        }
        if (this.bulletFlyMode == 1){
            if (this.bulletFlyMode1Aim.hp > 0 && this.bulletFlyMode1Aim.visible){
                l = Math.sqrt((this.bulletFlyMode1Aim.x - this.x)*(this.bulletFlyMode1Aim.x - this.x)+(this.bulletFlyMode1Aim.y - this.y)*(this.bulletFlyMode1Aim.y - this.y));
                this.bulletSpeed.x = this.bulletFlyMode1Speed * (this.bulletFlyMode1Aim.x - this.x) / l;
                this.bulletSpeed.y = this.bulletFlyMode1Speed * (this.bulletFlyMode1Aim.y - this.y) / l;
            }
            else{
                this.bulletFlyMode = 0;
                if (this.bulletSpeed.y<5 && this.bulletSpeed.x<5){
                    this.bulletSpeed = {x:Math.random()*50-25,y:Math.random()*50+50};
                }
            }
            
        }
        this.x = this.x + this.bulletSpeed.x * timeBetween;
        this.y = this.y + this.bulletSpeed.y * timeBetween;
        this.bulletPosition = this.bulletPosition + Math.sqrt((this.bulletSpeed.x * timeBetween)*(this.bulletSpeed.x * timeBetween)+(this.bulletSpeed.y * timeBetween)*(this.bulletSpeed.y * timeBetween))
        
    }


    _proto.doCollision = function(roleBox){
        for(var j = roleBox.numChildren-1; j>-1 ; j--){
            var role2 = roleBox.getChildAt(j);
            if(role2.heroType == 5 && role2.hp > 0 && this.camp != role2.camp){
                var hitRadius = this.hitRadius = role2.hitRadius;
                if(Math.abs(this.x-role2.x) < hitRadius && Math.abs(this.y-role2.y) < hitRadius){
                    this.bulletCollisionLastest=role2;
                    this.bulletCollision(role2);

                }
            }
        }
    }
        

    _proto.bulletHealing = function(role){
        if (this.bulletHealingType==1){
            role.hp = role.hp + bullterHealingValue;
        }
    }


    _proto.bulletDamage = function(role){
        if (this.bulletDamageType==0){
            damage = this.bulletDamageNum;
            this.actDamage(role,this.bulletDamageNum);
            this.collisionTime = this.collisionTime - 1;
        }
    }

    _proto.bulletCollision = function(role){
        if (this.camp == role.camp)
            this.bulletHealing(role);
        else
            this.bulletDamage(role);
    }


    


    _proto.bulletDelete = function(roleBox){
        if (this.bulletDeleteType == 1){
            this.actDamageRange(roleBox,this,this.bulletDeleteType1range,this.bulletDeleteType1damage);
        }
        if (this.bulletDeleteType == 2 && this.bulletDeleteType2Time > 0){
            var throwTo = Array()
            for(var i = roleBox.numChildren-1;i>-1;i--){
                var role1 = roleBox.getChildAt(i);
                if (this.camp != role1.camp && Math.sqrt((this.x-role1.x)*(this.x-role1.x)+(this.y-role1.y)*(this.y-role1.y)) <= this.bulletDeleteType2Range && role1 != this.bulletCollisionLastest && role1.hp > 0){
                    throwTo.push(role1);
                }
            }
            while (throwTo.length > this.bulletDeleteType2Number){
                ra = Math.floor(Math.random()*throwTo.length);
                throwTo.splice(ra,1);
            }

            for (var i = throwTo.length-1;i>-1;i--){
                var role1 = throwTo[i];
                var bullet = Laya.Pool.getItemByClass("role",Role);
                bullet.init("bullet1",this.camp,10,0,1,1);
                bullet.bulletEnter(1,role1,this.bulletDeleteType2Speed,{x:0,y:0},{x:0,y:0},0,0,0,1,1,2,0,0,2,this.bulletDeleteType2Range,this.bulletDeleteType2Number,this.bulletDeleteType2Time-1,this.bulletDeleteType2Speed);
                bullet.isBullet = true;
                bullet.pos(this.x,this.y);
                roleBox.addChild(bullet);
            }
        }
        this.visible = false;
    }


    _proto.bulletFrame = function(roleBox,timeBetween){
        if (this.visible){
            this.bulletFly(timeBetween);
            this.doCollision(roleBox);     
            if (this.collisionTime <= 0 && this.visible){
                this.bulletDelete(roleBox);
            }
            if (this.bulletPosition > this.bulletMaxPosition && this.visible){
                this.bulletDelete(roleBox);
            }
        }
        
    }


    _proto.actDamage = function(role,damage){
        role.hp = role.hp - damage;
        if (role.hp <= 0){
            role.playAction("down");
            role.visiable=false;
        }
    }


    _proto.actDamageRange = function(roleBox,position,range,damage){
        for(var i = roleBox.numChildren-1;i>-1;i--){
            var role1 = roleBox.getChildAt(i);
            if(role1.hp<1)continue;
            
            if (this.camp != role1.camp && Math.sqrt((position.x-role1.x)*(position.x-role1.x)+(position.y-role1.y)*(position.y-role1.y)) <= range){
                this.actDamage(role1,damage);
            }
        }
    }


    return Role;
})(Laya.Sprite);