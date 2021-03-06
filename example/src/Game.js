// var Game = (function(){
//     (function Game(){
        //子弹发射偏移位置表

        this.bulletPos = [[0],[-15,15],[-30,0,30],[-45,-15,15,45]];
        //关卡等级
        this.level = 0;
        //积分成绩
        this.score = 0;
        //升级等级所需的成绩数量
        this.levelUpScore = 10;
        //子弹级别
        this.bulletLevel = 0;
        
        //敌机血量
        this.hps = [1,2,2];
        //敌机速度
        this.speeds = [3,2,1];
        //敌机被击半径
        this.radius = [15,30,70];
        //初始化引擎，设置游戏宽高
        Laya.init(400,852,Laya.WebGL);
        Laya.stage.scaleMode = "showall";
        Laya.stage.alignH = "center";
        Laya.stage.screenMode = "vertical";
        //加载图集资源
        Laya.loader.load("res/atlas/war.json",Laya.Handler.create(this,onLoaded),null,Laya.Loader.ATLAS);
    // })();
    function onLoaded(){
        //创建循环滚动的背景
        this.bg = new BackGround();
        //把背景添加到舞台上显示出来
        Laya.stage.addChild(this.bg);

        //实例化角色容器
        this.roleBox = new Laya.Sprite();
        //添加到舞台上
        Laya.stage.addChild(this.roleBox);

        //创建游戏UI界面
        this.gameInfo = new GameInfo();
        //添加到舞台上
        Laya.stage.addChild(this.gameInfo);

        //创建一个主角
        this.hero = new Role();
        //添加到舞台上
        this.roleBox.addChild(this.hero);

        //创建敌人
        // createEnemy(10);

        //开始游戏
        restart();
    }
    function onLoop(){
        //遍历所有飞机，更改飞机状态
        for(var i = this.roleBox.numChildren-1;i>-1;i--){
            var role = this.roleBox.getChildAt(i);
            if(role){
                //根据飞机速度更改飞机位置
                if (role.isBullet==false && role.heroType!=1) 
                    role.y += role.speed;
                //如果敌机移动到显示区域以外则移除
                if(role.y>1000 || !role.visible || (role.isBullet && role.y<-20) || role.x>500 || role.x<-100 ){
                    //从舞台移除
                    role.removeSelf();
                    //回收钱重置属性信息
                    
                    role.isBullet = false;
                    role.visible = true;
                    //回收到对象池
                    Laya.Pool.recover("role",role);
                }
            }//处理发射子弹逻辑
            if(role.shootType > 0){
                //获取到当前时间
                var time = Laya.Browser.now();
                //如果当前时间大于下次射击时间
                if(time>role.shootTime){
                    //更新下次射击时间
                    role.shootTime = time+role.shootInterval;

                    //根据不同子弹类型，设置不同的数量及位置
                    this.pos = this.bulletPos[role.shootType - 1];
                    for(var index = 0;index<pos.length;index++){
                        //从对象池里边创建一个子弹
                        var bullet = Laya.Pool.getItemByClass("role",Role);
                        //初始化子弹信息
                        bullet.init("bullet1",role.camp,1,-4-role.shootType - Math.floor(this.level / 15),1,1);
                        bullet.bulletEnter(0,0,0,{x:0,y:0},{x:0,y:-1},0,0,0,1,1,2,500,100,2,500,1,15,15,500000);
                        // //设置角色类型为子弹类型
                        bullet.isBullet = true;
                        //设置子弹发射初始化位置
                        bullet.pos(role.x+pos[index],role.y-role.hitRadius - 10);
                        //添加舞台上
                        this.roleBox.addChild(bullet);
                    }
                    //发射子弹声音
                    Laya.SoundManager.playSound("res/sound/bullet.mp3");
                }
            }
        }
        
        //检测碰撞
        
        for(var i = this.roleBox.numChildren-1;i>-1;i--){
            //获取角色对象1
            var role1 = this.roleBox.getChildAt(i);
            //如果角色死亡则忽略
            if(role1.hp<1)continue;
            if (role1.isBullet){
                role1.bulletFrame(this.roleBox,1);
                continue;
            }
            
        }
        //如果主角死亡，则停止游戏循环
        if(this.hero.hp<1){
            Laya.timer.clear(this,onLoop);
            //游戏结束声音
            Laya.SoundManager.playSound("res/sound/game_over.mp3");
            //显示提示信息
            this.gameInfo.infoLabel.text = "GameOver,分数："+this.score+"\n点击这里重新开始。";
            //注册点击事件，点击重新开始游戏
            this.gameInfo.infoLabel.once(Laya.Event.CLICK,this,restart);
        }
        // //每隔30帧创建新的敌机
        // if(Laya.timer.currFrame%60 === 0){
        //     createEnemy(2);
        // }

        //关卡越高，创建敌机间隔越短
        var cutTime = this.level < 30 ? this.level * 2 : 60;
        //关卡越高，敌机飞行速度越高
        var speedUp = Math.floor(this.level  / 6);
        //关卡越高，敌机血量越高
        var hpUp = Math.floor(this.level / 8);
        //关卡越高，敌机数量越多
        var numUp = Math.floor(this.level / 10);

        //生成小飞机
        if(Laya.timer.currFrame % (80 - cutTime) === 0){
            createEnemy(0,2+numUp,3+speedUp,6);
        }
        //生成中型飞机
        if(Laya.timer.currFrame % (150 - cutTime * 4) === 0){
            createEnemy(1,1+numUp,2+speedUp,2+hpUp *5)
        }
        //生成boss
        if(Laya.timer.currFrame % (900 -cutTime *4) === 0){
            createEnemy(2,1,1+speedUp,10+hpUp*5);
            //boss添加声音
            Laya.SoundManager.playSound("res/sound/enemy3_out.mp3");
        }
    }
    function lostHp(role,lostHp){
        //减血
        role.hp-=lostHp;
        if(role.heroType === 2){
            //每吃一个子弹升级道具，子弹升级+1
            this.bulletLevel++;
            //子弹每升2级，子弹数量增加1，最大数量限制在4个
            this.hero.shootType = Math.min(Math.floor(this.bulletLevel / 2) + 1,4);
            //子弹级别越高，发射频率越快
            this.hero.shootInterval = 500 -20 * (this.bulletLevel > 20 ? 20 : this.bulletLevel);
            //隐藏道具
            role.visible = false;
            //获得道具声音
            Laya.SoundManager.playSound("res/sound/achievement.mp3");
        }
        else if(role.heroType === 3){
            //每吃一个血瓶，血量增加1
            this.hero.hp++;
            //设置主角血量
            this.gameInfo.hp(this.hero.hp);
            //设置最大血量不超过10
            if(this.hero.hp>10)this.hero.hp = 10;
            //隐藏道具
            role.visible = false;
            //获得道具声音
            Laya.SoundManager.playSound("res/sound/achievement.mp3");
        }
        if(role.hp>0){
            //如果未死亡，则播放爆炸动画
            role.playAction("hit");
        }
        else{
            if(role.isBullet){
            }
            else{
                role.playAction("down");
                //击中boss掉落血瓶或者子弹升级道具
                if(role.type == "enemy3"){
                    //随机是子弹升级道具还是血瓶
                    var type = Math.random() < 0.7 ? 2 : 3;
                    var item = Laya.Pool.getItemByClass("role",Role);
                    //初始化信息
                    item.init("ufo" + (type - 1),role.camp,1,1,5,type);
                    //设置位置
                    item.pos(role.x,role.y);
                    //添加到舞台上
                    this.roleBox.addChild(item);
                }
            }
        }
        //设置主角血量值
        if(role == this.hero){
            this.gameInfo.hp(role.hp);
        }
    }
    function restart(){
        //重置游戏数据
        this.score = 0;
        this.level = 1;
        this.levelUpScore = 10;
        this.bulletLevel = 0;
        this.gameInfo.reset();

        //初始化角色
        this.hero.init("hero",0,5,0,30);
        //设置射击类型
        this.hero.shootType = 1;
        //设置主角位置
        this.hero.pos(200,500);
        //重置射击间隔
        this.hero.shootInterval = 500;
        //显示角色
        this.hero.visible = true;

        for(var i = this.roleBox.numChildren-1;i>-1;i--){
            var role = this.roleBox.getChildAt(i);
            if(role != this.hero){
                role.removeSelf();
                //回收之前重置
                role.visible = true;
                //回收到对象池
                Laya.Pool.recover("role",role);
            }
        }
        //恢复游戏
        resume();
    }
    //暂停
    function pause(){
        //停止游戏主循环
        Laya.timer.clear(this,onLoop);
        //移除舞台的鼠标移动事件
        Laya.stage.off(Laya.Event,onMouseMove,this,onMouseMove);
    }
    //恢复
    function resume(){
        //在循环中创建敌人
        Laya.timer.frameLoop(1,this,onLoop);
        //监听舞台的鼠标移动事件
        Laya.stage.on(Laya.Event.MOUSE_MOVE,this,onMouseMove);
    }
    function onMouseMove(){
        //始终保持主角和鼠标位置一致
        this.hero.pos(Laya.stage.mouseX,Laya.stage.mouseY);
    }
    function createEnemy(type,num,speed,hp){
        for(var i=0;i<num;i++){
            //随机出现敌人
            // var r = Math.random();
            // //根据随机数，随机敌人
            // var type = r<0.7?0:r<0.95?1:2;
            //创建敌人
            var enemy = Laya.Pool.getItemByClass("role",Role);
            //初始化角色
            enemy.init("enemy"+(type+1),1,hp,speed,this.radius[type],5);
            //随机位置
            enemy.pos(Math.random()*400+40,-Math.random()*200 - 100);
            //添加到舞台上
            this.roleBox.addChild(enemy);
        }
    }
// })();