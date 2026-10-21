// Veloxo home page: nav state, scroll reveal, stacked cards, word highlight, Velo chat playback.
(function(){
  var root=document.documentElement; root.classList.add('js');
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Nav: solid after hero
  var nav=document.getElementById('nav'), hero=document.querySelector('.hero');
  function navState(){ var y=window.scrollY, past=y > hero.offsetHeight - 90; nav.classList.toggle('solid', past); nav.classList.toggle('glass', !past && y > 8); }
  navState(); window.addEventListener('scroll',navState,{passive:true});

  // Reveal on scroll (elements start visible; only those below the fold get pre-hidden)
  var els=[].slice.call(document.querySelectorAll('.rv'));
  if('IntersectionObserver' in window && !reduce){
    var vh=window.innerHeight;
    els.forEach(function(el){ if(el.getBoundingClientRect().top>vh*0.95) el.classList.add('pre'); });
    var io=new IntersectionObserver(function(es){es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.remove('pre'); io.unobserve(e.target);} });},{rootMargin:'0px 0px -8% 0px'});
    els.forEach(function(el){ if(el.classList.contains('pre')) io.observe(el); });
  }

  // Stacked cards: shrink a card slightly as the next one slides over it
  var cards=[].slice.call(document.querySelectorAll('.card'));
  function stack(){
    if(reduce){cards.forEach(function(c){c.style.transform='';c.style.filter='';});return;}
    for(var i=0;i<cards.length-1;i++){
      var a=cards[i].getBoundingClientRect(), b=cards[i+1].getBoundingClientRect();
      var p=Math.min(1,Math.max(0,(a.bottom-b.top)/a.height));
      cards[i].style.transform='scale('+(1-p*0.05)+')';
      cards[i].style.filter='brightness('+(1-p*0.08)+')';
    }
  }
  // Sticky offset per card: a card taller than the screen scrolls fully into view before it sticks
  function setTops(){
    var small=window.innerWidth<=980, vh=window.innerHeight;
    cards.forEach(function(c,i){
      var base=(small?72:100)+i*(small?10:16);
      c.style.top=Math.min(base, vh-c.offsetHeight-12)+'px';
    });
  }
  setTops(); window.addEventListener('resize',setTops); window.addEventListener('load',setTops);
  stack(); window.addEventListener('scroll',stack,{passive:true}); window.addEventListener('resize',stack);

  // How it works: words brighten as you scroll through each step
  var splits=[].slice.call(document.querySelectorAll('[data-split]'));
  var groups=splits.map(function(p){
    var words=[];
    [].slice.call(p.children).forEach(function(span){
      var parts=span.textContent.split(/(\s+)/); span.textContent='';
      parts.forEach(function(t){ if(/^\s+$/.test(t)||!t){span.appendChild(document.createTextNode(t));return;}
        var w=document.createElement('span'); w.className='w'; w.textContent=t; span.appendChild(w); words.push(w); });
    });
    return {el:p,words:words};
  });
  function light(){
    var vh=window.innerHeight;
    groups.forEach(function(g){
      var r=g.el.getBoundingClientRect();
      var p=reduce?1:Math.min(1,Math.max(0,(vh*0.85-r.top)/(vh*0.5)));
      var n=g.words.length;
      g.words.forEach(function(w,i){ var t=Math.min(1,Math.max(0,p*n-i)); w.style.opacity=(0.38+0.62*t).toFixed(2); });
    });
  }
  light(); window.addEventListener('scroll',light,{passive:true}); window.addEventListener('resize',light);

  // Velo chat: messages are all visible at rest; when the chat scrolls into view, it plays back with a typing indicator
  var chat=document.getElementById('chat');
  var items=[].slice.call(chat.children);
  var playing=false;
  function play(){
    if(reduce||playing) return; playing=true;
    items.forEach(function(el){el.classList.add('hide');});
    var i=0;
    function next(){
      if(i>=items.length){playing=false;return;}
      var el=items[i++];
      if(el.classList.contains('velo-m')){
        var t=document.createElement('div'); t.className='typing'; t.innerHTML='<i></i><i></i><i></i>';
        chat.insertBefore(t,el);
        setTimeout(function(){ t.remove(); el.classList.remove('hide'); setTimeout(next,500); }, 1100);
      } else { el.classList.remove('hide'); setTimeout(next, el.classList.contains('day')?300:650); }
    }
    setTimeout(next,250);
  }
  if('IntersectionObserver' in window && !reduce){
    var co=new IntersectionObserver(function(es){ if(es[0].isIntersecting){ co.disconnect(); play(); } },{threshold:.45});
    co.observe(chat);
  }
  document.getElementById('replay').addEventListener('click',play);
})();
