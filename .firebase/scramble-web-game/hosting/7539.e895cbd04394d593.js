"use strict";(self.webpackChunkapp=self.webpackChunkapp||[]).push([[7539],{7539:(J,T,d)=>{d.r(T),d.d(T,{LeaderboardPageModule:()=>F});var _=d(6895),v=d(4719),u=d(9928),b=d(4145),m=d(5861),s=d(6027),f=d(5525),e=d(6353),w=d(7323);const Z=function(o){return{isYou:o}};function A(o,c){if(1&o&&(e.TgZ(0,"ion-row",21)(1,"ion-col",16),e._uU(2),e.qZA(),e.TgZ(3,"ion-col",17),e._uU(4),e.qZA(),e.TgZ(5,"ion-col",19),e._uU(6),e.qZA(),e.TgZ(7,"ion-col",19),e._uU(8),e.ALo(9,"number"),e.qZA()()),2&o){const t=c.$implicit,n=c.index,i=e.oxw(2);e.Q6J("ngClass",e.VKq(8,Z,t.uid===i.auth.currentUser.uid)),e.xp6(2),e.hij(" ",n+1," "),e.xp6(2),e.hij(" ",t.name," "),e.xp6(2),e.hij(" ",t.stats.perfects||0," "),e.xp6(2),e.hij(" ",e.xi3(9,5,t.stats.perfects/t.timesPlayed*100||0,"1.1-1"),"% ")}}function O(o,c){if(1&o&&(e.TgZ(0,"ion-card",14)(1,"ion-row",15)(2,"ion-col",16),e._uU(3," RANK "),e.qZA(),e.TgZ(4,"ion-col",17),e._uU(5," PLAYER "),e.qZA(),e.TgZ(6,"ion-col",19),e._uU(7," PERFECTS "),e.qZA(),e.TgZ(8,"ion-col",19),e._uU(9," PERF% "),e.qZA()(),e.YNc(10,A,10,10,"ion-row",20),e.qZA()),2&o){const t=e.oxw();e.xp6(10),e.Q6J("ngForOf",t.friends)}}function M(o,c){if(1&o&&(e.TgZ(0,"ion-row",21)(1,"ion-col",16),e._uU(2),e.qZA(),e.TgZ(3,"ion-col",22),e._uU(4),e.qZA(),e.TgZ(5,"ion-col",16),e._uU(6),e.qZA(),e.TgZ(7,"ion-col",16),e._uU(8),e.ALo(9,"number"),e.qZA(),e.TgZ(10,"ion-col",16),e._uU(11),e.ALo(12,"number"),e.qZA()()),2&o){const t=c.$implicit,n=c.index,i=e.oxw(2);e.Q6J("ngClass",e.VKq(12,Z,t.uid===i.auth.currentUser.uid)),e.xp6(2),e.hij(" ",n+1," "),e.xp6(2),e.hij(" ",t.name||0," "),e.xp6(2),e.hij(" ",t.stats.tens||0," "),e.xp6(2),e.hij(" ",e.xi3(9,6,t.stats.completionRate||0,"1.1-1"),"% "),e.xp6(3),e.hij(" ",e.xi3(12,9,t.stats.timeToComplete||0,"1.1-1"),"s ")}}function y(o,c){if(1&o&&(e.TgZ(0,"ion-card",14)(1,"ion-row",15)(2,"ion-col",16),e._uU(3," RANK "),e.qZA(),e.TgZ(4,"ion-col",17),e._uU(5," PLAYER "),e.qZA(),e.TgZ(6,"ion-col",16),e._uU(7," TENS "),e.qZA(),e.TgZ(8,"ion-col",16),e._uU(9," COMP% "),e.qZA(),e.TgZ(10,"ion-col",16),e._uU(11," TTC "),e.qZA()(),e.YNc(12,M,13,14,"ion-row",20),e.qZA()),2&o){const t=e.oxw();e.xp6(12),e.Q6J("ngForOf",t.friends)}}function U(o,c){if(1&o&&(e.TgZ(0,"ion-row",23)(1,"ion-col",16),e._uU(2),e.qZA(),e.TgZ(3,"ion-col",17),e._uU(4),e.qZA(),e.TgZ(5,"ion-col",16),e._uU(6),e.qZA(),e.TgZ(7,"ion-col",16),e._uU(8),e.qZA(),e.TgZ(9,"ion-col",16),e._uU(10),e.qZA()()),2&o){const t=c.$implicit,n=c.index,i=e.oxw();e.Q6J("ngClass",e.VKq(6,Z,t.uid===i.auth.currentUser.uid)),e.xp6(2),e.hij(" ",n+1," "),e.xp6(2),e.hij(" ",t.name," "),e.xp6(2),e.hij(" ",t.score," "),e.xp6(2),e.hij(" ",t.compRate," "),e.xp6(2),e.hij(" ",t.ttc," ")}}const C=function(o,c){return{active:o,inactive:c}},L=[{path:"",component:(()=>{class o{constructor(t,n,i,r,a,g){this.auth=t,this.firestore=n,this.menu=i,this.alertCtrl=r,this.router=a,this.toastCtrl=g,this.friends=[],this.activeBoard="perfects",this.boardType="friends",this.top100=[]}ngOnInit(){var t=this;this.auth.onAuthStateChanged(function(){var n=(0,m.Z)(function*(i){t.getFriends()});return function(i){return n.apply(this,arguments)}}()),this.getTop100()}segmentChanged(t){this.boardType=t.detail.value,this.friends=[],"friends"===this.boardType?this.getFriends():this.getWorldwide()}getWorldwide(){(0,s.PL)((0,f.IO)((0,s.hJ)(this.firestore,"users"),(0,f.ar)("name","!=",null))).then(t=>{let n=[];t.forEach(i=>{n.push(i.data())}),this.sortFriends(n)})}getFriends(){this.friends=[],(0,s.PL)((0,s.hJ)(this.firestore,"users",this.auth.currentUser.uid,"friends")).then(t=>{let n=[];t.forEach(i=>{n.push(i.data())}),(0,s.QT)((0,s.JU)(this.firestore,"users",this.auth.currentUser.uid)).then(i=>{n.push(i.data()),this.sortFriends(n)})})}goHome(){this.router.navigate(["home"])}sortFriends(t){var n=this;return(0,m.Z)(function*(){for(let r=0;r<t.length;r++){let a=yield(0,s.QT)((0,s.JU)(n.firestore,"users",t[r].uid));n.friends.push(a.data())}const i=(r,a,g,x,P)=>{let p=P?1:-1,l=g.split("."),h=x.split(".");return r[l[0]][l[1]]>a[l[0]][l[1]]?1*p:a[l[0]][l[1]]>r[l[0]][l[1]]?-1*p:r[h[0]][h[1]]>a[h[0]][h[1]]?1*-p:a[h[0]][h[1]]>r[h[0]][h[1]]?-1*-p:0};for(let r=0;r<n.friends.length;r++)n.friends[r].stats.perfectRate=n.friends[r].stats.perfects/n.friends[r].timesPlayed*100||0;n.friends.sort("perfects"===n.activeBoard?(r,a)=>i(r,a,"stats.perfectRate","stats.completionRate",!1):(r,a)=>i(r,a,"stats.completionRate","stats.timeToComplete",!1))})()}switchBoard(t){this.activeBoard=t;let n=this.friends;this.friends=[],this.sortFriends(n)}openMenu(){this.menu.enable(!0,"menu"),this.menu.open("menu")}openDonate(){window.open("https://ko-fi.com/sqram","_blank")}addFriend(){var t=this;return(0,m.Z)(function*(){var i;yield(yield t.alertCtrl.create({header:"Enter a Friend's Name",buttons:[{text:"OK",handler:(i=(0,m.Z)(function*(r){let a=r[0];if(a===t.auth.currentUser.displayName)return void t.showToast("Don't enter you're own name!");if(a=a.toLowerCase(),!(yield(0,s.PL)((0,f.IO)((0,s.hJ)(t.firestore,"users",t.auth.currentUser.uid,"friends"),(0,f.ar)("name","==",a)))).empty)return void t.showToast("Friend Already Added!");const x=(0,s.hJ)(t.firestore,"users"),P=(0,f.IO)(x,(0,f.ar)("name","==",a));return(0,s.PL)(P).then(p=>{p.empty?t.showToast("Friend Does Not Exist"):p.forEach(l=>{(0,s.ET)((0,s.hJ)(t.firestore,"users",t.auth.currentUser.uid,"friends"),{uid:l.id,name:l.data().name}).then(()=>{t.showToast("Friend Added"),t.getFriends()})})}),!0}),function(a){return i.apply(this,arguments)})}],inputs:[{type:"text",attributes:{maxlength:10}}]})).present()})()}showToast(t){var n=this;return(0,m.Z)(function*(){(yield n.toastCtrl.create({message:t,position:"bottom",duration:2500})).present()})()}getTop100(){var t=this;return(0,m.Z)(function*(){let n=[],i=(0,s.hJ)(t.firestore,"users"),r=(0,f.IO)(i,(0,s.Xo)("stats.tens","desc"),(0,s.b9)(100));(yield(0,s.PL)(r)).forEach(g=>{n.push({uid:g.data().uid,name:g.data().name||"Anonymous",score:g.data().stats.tens,compRate:g.data().stats.completionRate,ttc:g.data().stats.timeToComplete})}),t.top100=n,console.log("Unsorted Top 100"),console.log(n)})()}}return o.\u0275fac=function(t){return new(t||o)(e.Y36(w.gx),e.Y36(s.gg),e.Y36(u._q),e.Y36(u.Br),e.Y36(b.F0),e.Y36(u.yF))},o.\u0275cmp=e.Xpm({type:o,selectors:[["app-leaderboard"]],decls:31,vars:11,consts:[["id","game-board"],["id","menu-bar"],["size","1"],["name","menu","id","menu-icon",2,"color","#7b16b5",3,"click"],["size","6"],["src","../../assets/images/Sqram_Logo.svg","id","title",3,"click"],["id","heart-icon","size","5",2,"justify-content","flex-end"],["name","heart","id","donate-icon",2,"color","#7b16b5",3,"click"],["fill","clear",2,"background","url('../../assets/images/Perfects.svg')","background-size","cover",3,"ngClass","click"],["fill","clear",2,"background","url('../../assets/images/Tens.svg')","background-size","cover",3,"ngClass","click"],["class","leaderboard-container","style","width: 95%",4,"ngIf"],["src","../../assets/images/Friend_Icon.svg","width","140px",1,"hover-effect",3,"click"],[1,"horiz-line"],[1,"top-100-title"],[1,"leaderboard-container",2,"width","95%"],[2,"margin-bottom","8px"],["size","2"],["size","4"],["class","top-100",3,"ngClass",4,"ngFor","ngForOf"],["size","3"],[3,"ngClass",4,"ngFor","ngForOf"],[3,"ngClass"],["size","4",2,"white-space","nowrap","overflow","hidden","text-overflow","ellipsis"],[1,"top-100",3,"ngClass"]],template:function(t,n){1&t&&(e.TgZ(0,"ion-content")(1,"div",0)(2,"ion-row",1)(3,"ion-col",2)(4,"ion-icon",3),e.NdJ("click",function(){return n.openMenu()}),e.qZA()(),e.TgZ(5,"ion-col",4)(6,"img",5),e.NdJ("click",function(){return n.goHome()}),e.qZA()(),e.TgZ(7,"ion-col",6)(8,"ion-icon",7),e.NdJ("click",function(){return n.openDonate()}),e.qZA()()(),e.TgZ(9,"div")(10,"ion-button",8),e.NdJ("click",function(){return n.switchBoard("perfects")}),e.qZA(),e.TgZ(11,"ion-button",9),e.NdJ("click",function(){return n.switchBoard("tens")}),e.qZA()(),e.YNc(12,O,11,1,"ion-card",10),e.YNc(13,y,13,1,"ion-card",10),e.TgZ(14,"img",11),e.NdJ("click",function(){return n.addFriend()}),e.qZA(),e._UZ(15,"div",12),e.TgZ(16,"span",13),e._uU(17,"Top 100 Players"),e.qZA(),e.TgZ(18,"ion-card",14)(19,"ion-row",15)(20,"ion-col",16),e._uU(21," RANK "),e.qZA(),e.TgZ(22,"ion-col",17),e._uU(23," PLAYER "),e.qZA(),e.TgZ(24,"ion-col",16),e._uU(25," TENS "),e.qZA(),e.TgZ(26,"ion-col",16),e._uU(27," COMP% "),e.qZA(),e.TgZ(28,"ion-col",16),e._uU(29," TTC "),e.qZA()(),e.YNc(30,U,11,8,"ion-row",18),e.qZA()()()),2&t&&(e.xp6(10),e.Q6J("ngClass",e.WLB(5,C,"perfects"===n.activeBoard,"perfects"!==n.activeBoard)),e.xp6(1),e.Q6J("ngClass",e.WLB(8,C,"tens"===n.activeBoard,"tens"!==n.activeBoard)),e.xp6(1),e.Q6J("ngIf","perfects"===n.activeBoard),e.xp6(1),e.Q6J("ngIf","tens"===n.activeBoard),e.xp6(17),e.Q6J("ngForOf",n.top100))},dependencies:[_.mk,_.sg,_.O5,u.YG,u.PM,u.wI,u.W2,u.gu,u.Nd,_.JJ],styles:['@media (max-width: 500px){#game-board[_ngcontent-%COMP%]{display:flex;align-items:center;flex-direction:column;background:white;height:100vh;border:1px solid #bcbcbc;box-shadow:0 7px 20px #bdbdbd}}@media (min-width: 501px){#game-board[_ngcontent-%COMP%]{display:flex;align-items:center;flex-direction:column;width:-webkit-fill-abvailable;background:white;height:100vh;border:1px solid #bcbcbc;box-shadow:0 7px 20px #bdbdbd}}.hover-effect[_ngcontent-%COMP%]:hover{transform:scale(1.1)}#title[_ngcontent-%COMP%]{padding-bottom:15px;width:120px;padding-top:15px;margin-left:25px}#title[_ngcontent-%COMP%]:hover{transform:scale(1.1)}#menu-bar[_ngcontent-%COMP%]{display:flex;flex-direction:row;align-items:center;width:100%}#menu-bar[_ngcontent-%COMP%]   #heart-icon[_ngcontent-%COMP%]{display:flex;flex-direction:row;font-size:35px;justify-content:flex-end}#menu-bar[_ngcontent-%COMP%]   #donate-icon[_ngcontent-%COMP%]:hover, #menu-bar[_ngcontent-%COMP%]   #flag-icon[_ngcontent-%COMP%]:hover, #menu-bar[_ngcontent-%COMP%]   #career-icon[_ngcontent-%COMP%]:hover, #menu-bar[_ngcontent-%COMP%]   #menu-icon[_ngcontent-%COMP%]:hover{transform:scale(1.1)}#menu-bar[_ngcontent-%COMP%]   #menu-icon[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:flex-start;font-size:35px}.leaderboard-container[_ngcontent-%COMP%]{text-align:center;overflow:visible;font-weight:bolder}ion-card[_ngcontent-%COMP%]{width:100%}.horiz-line[_ngcontent-%COMP%]{width:100%;height:1px;background-color:#000;margin-bottom:15px;margin-top:1em}.top-100[_ngcontent-%COMP%]{height:35px;cursor:pointer}.top-100-card[_ngcontent-%COMP%]{width:95%;text-align:center;display:flex;flex-direction:column;overflow-y:scroll}.top-100-card[_ngcontent-%COMP%]::-webkit-scrollbar{display:none}.top-100-title[_ngcontent-%COMP%]{font-size:18px;font-weight:700}.inactive[_ngcontent-%COMP%]{border-radius:10px;width:50px;height:50px;color:#000}.active[_ngcontent-%COMP%]{border:1px solid black;border-radius:10px;width:50px;height:50px;color:#fff}.isYou[_ngcontent-%COMP%]{color:#7b16b5}.btn[_ngcontent-%COMP%]:hover{transform:scale(1.1)}#donate-icon[_ngcontent-%COMP%]:before, #flag-icon[_ngcontent-%COMP%]:before, #career-icon[_ngcontent-%COMP%]:before, #menu-icon[_ngcontent-%COMP%]:before{content:"";position:absolute;width:100%;height:100%}']}),o})()}];let q=(()=>{class o{}return o.\u0275fac=function(t){return new(t||o)},o.\u0275mod=e.oAB({type:o}),o.\u0275inj=e.cJS({imports:[b.Bz.forChild(L),b.Bz]}),o})(),F=(()=>{class o{}return o.\u0275fac=function(t){return new(t||o)},o.\u0275mod=e.oAB({type:o}),o.\u0275inj=e.cJS({imports:[_.ez,v.u5,u.Pc,q]}),o})()}}]);