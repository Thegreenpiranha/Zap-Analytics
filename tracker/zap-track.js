(function(){
  'use strict';
  var s=document.currentScript,api=s.getAttribute('data-api'),site=s.getAttribute('data-site');
  if(!api||!site)return;

  function send(name,props){
    var p=JSON.stringify({
      site_id:site,name:name,
      url:location.href,
      referrer:document.referrer||null,
      screen_width:window.innerWidth,
      props:props||{}
    });
    if(navigator.sendBeacon)navigator.sendBeacon(api,new Blob([p],{type:'application/json'}));
    else{var x=new XMLHttpRequest();x.open('POST',api,true);x.setRequestHeader('Content-Type','application/json');x.send(p)}
  }

  function pv(){send('pageview')}

  var op=history.pushState;
  if(op){history.pushState=function(){op.apply(this,arguments);pv()};window.addEventListener('popstate',pv)}

  window.zap=function(name,props){send(name,props||{})};
  pv();
})();