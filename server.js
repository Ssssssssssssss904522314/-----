const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const PORT = process.env.PORT || 10000;
const server = http.createServer((req,res)=>{res.writeHead(200,{'content-type':'text/plain; charset=utf-8','access-control-allow-origin':'*'});res.end('Россия RP realtime server is running');});
const wss = new WebSocket.Server({server});
const players = new Map();
function send(ws,obj){if(ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify(obj));}
function broadcast(obj,except){const data=JSON.stringify(obj);for(const client of wss.clients){if(client!==except&&client.readyState===WebSocket.OPEN)client.send(data);}}
wss.on('connection',ws=>{
 const id=Math.random().toString(36).slice(2,9);
 players.set(id,{id,x:Math.random()*4-2,z:7,yaw:0,name:'Игрок '+id.slice(0,4)});
 send(ws,{type:'welcome',id,players:[...players.values()]});
 broadcast({type:'joined',player:players.get(id)},ws);
 ws.on('message',raw=>{
  let msg;try{msg=JSON.parse(raw.toString())}catch{return}
  if(msg.type==='state'){
   const p=players.get(id);if(!p)return;
   p.x=Number.isFinite(msg.x)?Math.max(-110,Math.min(110,msg.x)):p.x;
   p.z=Number.isFinite(msg.z)?Math.max(-110,Math.min(110,msg.z)):p.z;
   p.yaw=Number.isFinite(msg.yaw)?msg.yaw:p.yaw;
   broadcast({type:'state',player:p},ws);
  }
 });
 ws.on('close',()=>{players.delete(id);broadcast({type:'left',id});});
});
server.listen(PORT,'0.0.0.0',()=>console.log('Россия RP realtime listening on '+PORT));
