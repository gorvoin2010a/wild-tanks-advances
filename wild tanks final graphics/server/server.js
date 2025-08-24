const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 3000 });

let rooms = {};
rooms['room1'] = { players:{}, bullets:[], map:[
    {x:200,y:150,w:100,h:300},
    {x:500,y:100,w:50,h:200},
    {x:350,y:400,w:150,h:50}
]};

const TANK_TYPES = ['light','medium','heavy'];
const MAP_WIDTH = 800;
const MAP_HEIGHT = 600;

function broadcast(roomId){
    const room = rooms[roomId];
    const data = JSON.stringify({ type:'update', players:room.players, bullets:room.bullets, map:room.map });
    server.clients.forEach(client=>{
        if(client.readyState===WebSocket.OPEN && client.room===roomId) client.send(data);
    });
}

server.on('connection', ws=>{
    ws.room='room1';
    const id = Date.now();
    const tankType = TANK_TYPES[Math.floor(Math.random()*TANK_TYPES.length)];
    rooms[ws.room].players[id] = { x:400, y:300, tankType, level:1, score:0, color:'blue' };
    ws.id = id;

    ws.on('message', msg=>{
        const data = JSON.parse(msg);
        const room = rooms[ws.room];
        if(data.type==='move'){
            const p = room.players[ws.id];
            p.x = Math.max(0, Math.min(MAP_WIDTH, data.player.x));
            p.y = Math.max(0, Math.min(MAP_HEIGHT, data.player.y));
        }
        if(data.type==='shoot'){
            room.bullets.push({ x:data.player.x, y:data.player.y, dx:0, dy:-5, owner:ws.id });
        }
    });

    ws.on('close', ()=>{ delete rooms[ws.room].players[ws.id]; });

    setInterval(()=>broadcast(ws.room),50);
});

console.log('Wild Tanks Graphics Server running on ws://localhost:3000');
