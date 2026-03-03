/* ════════════════════════════════════════════════════════
   1. CLOCK
════════════════════════════════════════════════════════ */
function updateClock() {
    var n    = new Date();
    var day  = n.toLocaleDateString('pt-PT', { weekday: 'short' })
                .replace(/^\w/, function(c) { return c.toUpperCase(); });
    var time = n.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('clk').textContent = day + '  ' + time;
  }
  updateClock();
  setInterval(updateClock, 1000);
  
  
/* ════════════════════════════════════════════════════════
   2. WALLPAPER — icons/wallpaper.png
════════════════════════════════════════════════════════ */
function drawWallpaper() {
    var cv  = document.getElementById('wallpaper');
    var W   = window.innerWidth;
    var H   = window.innerHeight;
    cv.width  = W;
    cv.height = H;
    var ctx = cv.getContext('2d');
  
    var img = new Image();
    img.src = 'icons/wallpaper.png';
  
    img.onload = function() {
      /* cobre o ecrã todo mantendo proporções (cover) */
      var imgRatio    = img.width  / img.height;
      var screenRatio = W / H;
      var drawW, drawH, offsetX, offsetY;
  
      if (screenRatio > imgRatio) {
        drawW   = W;
        drawH   = W / imgRatio;
        offsetX = 0;
        offsetY = (H - drawH) / 2;
      } else {
        drawH   = H;
        drawW   = H * imgRatio;
        offsetX = (W - drawW) / 2;
        offsetY = 0;
      }
  
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    };
  
    img.onerror = function() {
      /* fallback — gradiente cinzento se a imagem não carregar */
      var bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0,   '#d8d6d2');
      bg.addColorStop(0.5, '#cac8c4');
      bg.addColorStop(1,   '#bdbbb7');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
    };
  }
  
  drawWallpaper();
  window.addEventListener('resize', drawWallpaper);
  
  
  /* ════════════════════════════════════════════════════════
   3. FOLDER DEFINITIONS
    ════════════════════════════════════════════════════════ */
    var FOLDERS = [
    /* [ id,  label,  x(%),  y(%) ] */
    ['interfaces',     'interfaces',       0.25, 0.35],
    ['peoples-brain',  "people's\nbrain",  0.42, 0.22],
    ['doom-scrolling', 'doom-scrolling',   0.58, 0.38],
    ['designing',      'designing',        0.72, 0.25],
    ];
  
  
  /* ════════════════════════════════════════════════════════
     4. RENDER FOLDERS  — usa icons/folder.png
  ════════════════════════════════════════════════════════ */
  var desktop = document.getElementById('desktop');
  
  function placeIcons() {
    var W = desktop.clientWidth  || window.innerWidth;
    var H = desktop.clientHeight || (window.innerHeight - 100);
  
    for (var i = 0; i < FOLDERS.length; i++) {
      var id    = FOLDERS[i][0];
      var label = FOLDERS[i][1];
      var px    = FOLDERS[i][2];
      var py    = FOLDERS[i][3];
  
      var el = document.getElementById('fi-' + id);
  
      if (!el) {
        /* cria o elemento apenas uma vez */
        el = document.createElement('div');
        el.className = 'icon';
        el.id        = 'fi-' + id;
  
        var img       = document.createElement('img');
        img.className = 'ic-folder';
        img.src       = 'icons/folder.png';
        img.alt       = label;
        img.draggable = false;
  
        var lbl           = document.createElement('div');
        lbl.className     = 'lbl';
        lbl.textContent   = label;
  
        el.appendChild(img);
        el.appendChild(lbl);
        desktop.appendChild(el);
        makeDraggable(el);
      }
  
      /* posição — recalculada em cada resize */
      el.style.left = Math.max(0, Math.min(px * W - 36, W - 88)) + 'px';
      el.style.top  = Math.max(0, Math.min(py * H - 30, H - 90)) + 'px';
    }
  }
  
  placeIcons();
  window.addEventListener('resize', placeIcons);
  
  
  /* ════════════════════════════════════════════════════════
     5. DRAG & DROP
  ════════════════════════════════════════════════════════ */
  function makeDraggable(el) {
    var active = false;
    var ox = 0, oy = 0;
  
    function getW() { return desktop.clientWidth  || window.innerWidth; }
    function getH() { return desktop.clientHeight || (window.innerHeight - 100); }
    function clamp(v, lo, hi) { return Math.max(lo, Math.min(v, hi)); }
  
    /* — mouse — */
    el.addEventListener('mousedown', function(e) {
      if (e.button !== 0) return;
      active = true;
      el.classList.add('drag');
      var r  = el.getBoundingClientRect();
      var dt = desktop.getBoundingClientRect();
      ox = e.clientX - r.left;
      oy = e.clientY - (r.top - dt.top);
      e.preventDefault();
    });
  
    document.addEventListener('mousemove', function(e) {
      if (!active) return;
      el.style.left = clamp(e.clientX - ox,      0, getW() - el.offsetWidth)  + 'px';
      el.style.top  = clamp(e.clientY - 22 - oy, 0, getH() - el.offsetHeight) + 'px';
    });
  
    document.addEventListener('mouseup', function() {
      if (!active) return;
      active = false;
      el.classList.remove('drag');
      el.style.zIndex = '20';
    });
  
    /* — touch — */
    el.addEventListener('touchstart', function(e) {
      var t  = e.touches[0];
      var r  = el.getBoundingClientRect();
      var dt = desktop.getBoundingClientRect();
      active = true;
      el.classList.add('drag');
      ox = t.clientX - r.left;
      oy = t.clientY - (r.top - dt.top);
      e.preventDefault();
    }, { passive: false });
  
    el.addEventListener('touchmove', function(e) {
      if (!active) return;
      var t = e.touches[0];
      el.style.left = clamp(t.clientX - ox,      0, getW() - el.offsetWidth)  + 'px';
      el.style.top  = clamp(t.clientY - 22 - oy, 0, getH() - el.offsetHeight) + 'px';
      e.preventDefault();
    }, { passive: false });
  
    el.addEventListener('touchend', function() {
      active = false;
      el.classList.remove('drag');
      el.style.zIndex = '20';
    });
  }
  
  
  /* ════════════════════════════════════════════════════════
     6. DOCK
     Todas as imagens em icons/
     Ordem: Finder · Illustrator · InDesign · Figma
            · Spotify · Notion · Safari  |  Trash
  ════════════════════════════════════════════════════════ */
  var DOCK_APPS = [
    { name: 'Finder',      src: 'icons/finder.png'      },
    { name: 'Illustrator', src: 'icons/illustrator.png' },
    { name: 'InDesign',    src: 'icons/indesign.png'    },
    { name: 'Figma',       src: 'icons/figma.png'       },
    { name: 'Spotify',     src: 'icons/spotify.png'     },
    { name: 'Notion',      src: 'icons/notion.png'      },
    { name: 'Safari',      src: 'icons/safari.png'      },
    null,                                    /* separador */
    { name: 'Trash',       src: 'icons/trash.png'       },
  ];
  
  var dockEl = document.getElementById('dock');
  
  for (var i = 0; i < DOCK_APPS.length; i++) {
    var app = DOCK_APPS[i];
  
    /* separador */
    if (app === null) {
      var sep       = document.createElement('div');
      sep.className = 'dsep';
      dockEl.appendChild(sep);
      continue;
    }
  
    /* item */
    var ditem       = document.createElement('div');
    ditem.className = 'di';
  
    var dimg        = document.createElement('img');
    dimg.src        = app.src;
    dimg.alt        = app.name;
    dimg.draggable  = false;
  
    var ddot        = document.createElement('div');
    ddot.className  = 'ddot';
  
    var dtip            = document.createElement('div');
    dtip.className      = 'dtip';
    dtip.textContent    = app.name;
  
    ditem.appendChild(dimg);
    ditem.appendChild(ddot);
    ditem.appendChild(dtip);
    dockEl.appendChild(ditem);
  }