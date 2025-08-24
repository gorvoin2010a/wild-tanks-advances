const canvas=document.getElementById('gameCanvas');
const ctx=canvas.getContext('2d');
const ws=new WebSocket('ws://localhost:3000');

let players={}, bullets=[], map=[], player={x:400,y:300,tankType:'light',level:1,score:0,color:'blue'};

const tankImages = {};
const bulletImage = new Image();
const explosionImage = new Image();

tankImages['light']=new Image(); tankImages['light'].src='assets/tank_light.png';
tankImages['medium']=new Image(); tankImages['medium'].src='assets/tank_medium.png';
tankImages['heavy']=new Image(); tankImages['heavy'].src='assets/tank_heavy.png';
bulletImage.src='assets/bullet.png';
explosionImage.src='assets/explosion.png';

document.addEventListener('keydown', e=>{
    switch(e.key){
        case 'ArrowUp': player.y-=5; break;
        case 'ArrowDown': player.y+=5; break;
        case 'ArrowLeft': player.x-=5; break;
        case 'ArrowRight': player.x+=5; break;
        case ' ': ws.send(JSON.stringify({type:'shoot',player})); break;
    }
    ws.send(JSON.stringify({type:'move',player}));
});

ws.onmessage=msg=>{
    const data=JSON.parse(msg.data);
    if(data.type==='update'){ players=data.players; bullets=data.bullets; map=data.map; updateLeaderboard(); }
};

function drawMap(){
    ctx.fillStyle='#444';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#666';
    map.forEach(b=>ctx.fillRect(b.x,b.y,b.w,b.h));
}

function updateLeaderboard(){
    const lb = document.getElementById('leaderboard');
    const sorted = Object.values(players).sort((a,b)=>b.score-a.score);
    lb.innerHTML = '<b>Leaderboard</b><br>'+sorted.map(p=>`Lv${p.level} Score:${p.score}`).join('<br>');
}

function draw(){
    drawMap();

    // Игроки
    for(const id in players){
        const p=players[id];
        const img = tankImages[p.tankType];
        ctx.drawImage(img,p.x-16,p.y-16,32,32);
    }

    // Пули
    bullets.forEach(b=>{
        ctx.drawImage(bulletImage,b.x-5,b.y-5,10,10);
        b.x+=b.dx; b.y+=b.dy;
    });

    requestAnimationFrame(draw);
}

draw();
