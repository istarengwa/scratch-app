(function () {
  "use strict";

  var I = new WebKitCSSMatrix();

  function Point(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  Point.prototype.transformBy = function (matrix) {
    var tmp = matrix.multiply(I.translate(this.x, this.y, this.z));
    return new Point(tmp.m41, tmp.m42, tmp.m43);
  };

  // new WebKitCSSMatrix(), new WebKitCSSMatrix(string)
  // WebKitCSSMatrix#m41, WebKitCSSMatrix#m42, WebKitCSSMatrix#m43
  // WebKitCSSMatrix#multiply, WebKitCSSMatrix#translate, WebKitCSSMatrix#inverse

  function getTransformationMatrix(element) {
    var transformationMatrix = I;
    var x = element;

    while (x != undefined && x !== x.ownerDocument.documentElement) {
      var computedStyle = window.getComputedStyle(x, undefined);
      var transform = computedStyle.transform || "none";
      var c = transform === "none" ? I : new WebKitCSSMatrix(transform);
      transformationMatrix = c.multiply(transformationMatrix);
      x = x.parentNode;
    }

    var w = element.offsetWidth;
    var h = element.offsetHeight;
    var i = 4;
    var left = +Infinity;
    var top = +Infinity;
    while (--i >= 0) {
      var p = new Point(i === 0 || i === 1 ? 0 : w, i === 0 || i === 3 ? 0 : h, 0).transformBy(transformationMatrix);
      if (p.x < left) {
        left = p.x;
      }
      if (p.y < top) {
        top = p.y;
      }
    }
    var rect = element.getBoundingClientRect();
    transformationMatrix = I.translate(window.pageXOffset + rect.left - left, window.pageYOffset + rect.top - top, 0).multiply(transformationMatrix);

    return transformationMatrix;
  }

  window.convertPointFromPageToNode = function (element, pageX, pageY) {
    return new Point(pageX, pageY, 0).transformBy(getTransformationMatrix(element).inverse());
  };
  
  window.convertPointFromNodeToPage = function (element, offsetX, offsetY) {
    return new Point(offsetX, offsetY, 0).transformBy(getTransformationMatrix(element));
  };

}());

var Scratch = (function (){
  var BRUSH_B64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAAxCAYAAABNuS5SAAAKFklEQVR42u2aCXCcdRnG997NJtlkk83VJE3apEma9CQlNAR60UqrGSqW4PQSO9iiTkE8BxWtlGMqYCtYrLRQtfVGMoJaGRFliijaViwiWgQpyCEdraI1QLXG52V+n/5nzd3ENnX/M8/sJvvt933/533e81ufL7MyK7NOzuXPUDD0FQCZlVn/+xUUQhkXHny8M2TxGsq48MBjXdAhL9/7YN26dd5nI5aVRrvEc0GFEBNKhbDjwsHh3qP/FJK1EdYIedOFlFAOgREhPlICifZDYoBjTna3LYe4xcI4oSpNcf6RvHjuAJRoVszD0qFBGmgMChipZGFxbqzQkJWVZUSOF7JRX3S4LtLTeyMtkkqljMBkPzHRs2aYY5PcZH/qLY1EIo18byQ6hBytIr3WCAXcV4tQHYvFxg3w3N6+Bh3OQolEoqCoqCinlw16JzTFJSE6PYuZKqvztbC2ex7bzGxhKu+rerjJrEEq+r9ieElJSXFDQ0Mh9zYzOzu7FBUWcO4Q9xbD6HYvhXhGLccVD5ZAPyfMqaioyOrBUgEv8FZXV8caGxtz8vLykhCWTnZIKmsKhUJnEYeKcKk2YYERH41G7UYnck1/WvAPOxsdLJm2+bEY0Ay0RNeqkytXQkoBZM4U5oOaoYSUkBGRtvnesrBZK4e4F6ypqSkuLy+v4KI99ZQxkfc6vZ4jNAl1wkbhG8LrhfNBCdkxmhYacvj/GOce+3K9MHHbDHUmicOufREELRIWch/DljzMsglutr+VIJO5KjGrVfZAnpF8mnCd8G5hrnC60Cl8T/iw8C1hKd9P9eDCMcgo5HwBx8BB/g7xeRPkrBbeJ3xTeAxjvRGVV3NcshfPG1JX4tVDQae47GuVOknCi23xHr5nyrxe2C1sFlYJ7xe+Jlwm7BRulItP0ms957RzTMK1ws41jMS8eDxehopaOCYfxc3AIHcIX+K6nxW+ImyVF1i8PQ8DTuwtdC1atCja3NwcHkq5EuXmo85G+jq+yMm28V4q/zcIPxV+K9zPxnbgTi0ocybu6wX66fx/vfAB4T1gHt8xI1wlXMF5zEXnQKC56ruEjwhvEa4WrrXvK/Yt5Pt5I1UveeVKyKmT+lpG2gQ2npMmez8ZzFT3e+HXwj7hKXNf6rFZbDpJUjESLdFsFX4mfFv4Fd/7qPBm4UPCJ4RNwncwym4UfYVUtiAcDk/T+3NRmylwWzAY7BCBCwYYogZPnrJoRNm2IDc3tw4FVKXFm95UmGLzkTTFpog524WnhQPCQeGvwiPCCuFCYmk5GbEJt3tOeF54HPVeLLyXxHOv8BPhYaFLeFU4gsI7OWeZk3g+hpJNvVMGIIqhdRvy+biVISouq2TBqWxoIL1wgBhU5AR1SzJvFR4UnhX+Bl4RfsFGP0npUkTymIQ7fh8Cf4l6F0LgXkj6o3O+buGfwj+ElzGQETaNeJqPhxiahckYq8KJ9V6mP+4pTIATjsGCA8lCQVy9VbhB2CM8itu9IBxlkx6O4nbmmpcSi0KUExa3Psfn23DZC4lhlhRuIWs/R1Y9BrpR4WHcfiOq34bLl5DJm1B7BANPGO4+2OJfDcVwX+RZkL5d+DRqeRJ360IJx1CFp4w/8/lhVGXxay1xKp8asQ31rSbgz2az1aBBWCZsgKTfEFe7uM4xYus9KHWXcBv3eolwJe67hJLIN6yubMVpW1tbbllZWVxtzjRquvQe9981IG3RZHUQttH7hB8IP0cdLwp/YnNHcdsjEP1xsEruO56i2Fy3UWXMskAgYAH/EjOiCD6NDc/XZ4v12RqSy3WQ9rJD3jPClwkZz2Aoy8JnUEjPcwYWfgfHvcIW84h308mABQP4Xp02OY44M4tSZSfx7UXIewU3NpXuxw0vJzauYDP1XM8y8Ttx67fhylYrdlAMW1x7h/BF3NWI+4PwFwjbSha26/xQuBmib6HDqeI+m4m5wzrj9A/xO+O5qbm4yizcbDOKfAjVWeC/WzAFLSeI+4hN9WzQ65EvED7D8Tt4vwE33O64rIfD1JW3k6xeQoX3UN6chyG8In4tcbHuRAyKw2ktVIIM2U5XcA7t2FKy5vWQeBexbbrTpvmZiJwN6e3EwKspW/ajqBuAKfKQk8m7KIce5bgnMNQDkLWPUmkj511DSVV5HJOd417FzrDAK7RjZLMZiURigmLVFCYs5tI2PFhpcUj/n6z6sp72LwJKiU2rUdp62rA7IX4XytpJ3Weh4XfE1/0kk/uoFX8kbCHudZLld5E8vJIs2+mbT8iznaR60DHMBt0EE1DySVlSsOBvyrL6zkZG5qI2T/QSBYTHMYAlq2tw1+0MFO4kVj5GSbSbgvkA8fQQr1uIdfdD5mZ1GhZbP0XfuwlPmOp0SNkYbkQV2JdlEsq69VJS+rTER+NtZVC+TX+NRFq1XGeiHXbGUHMg6lk2/DiZ+mHU8wTueoTXLtS3F5e9l2PNZW9lyrOB5LGSmJokzMQ6OjqCA3wsMXLLhqrWoZgKe3lyZ5YtLiwsLLfMLhJL0ibW3rKa7oMQ+Ajq6gKHcMeHeP8qZcpRMvyt1J97SRabcNP1ZGsbKhSb6lF+5GR6shUnlqTSyPM7LZxV/PUqjOfTH6cvqx+XyN3aCfBPUWh3UZIcxC2/jgu/BJ7Eve/G1R/EXS9gaLCc0dgySqIm7jV4MhEYdAaN4R4eRHkBusJp3GNp56iSOscyYN0DaUch8Ai13X6yrg0PvotCO8nme0geKymBaulc1qO+NbxOOpHZtrcHR+nT6+wePvcnk8k8qv6iNBdyH4/OoGR5gXbv75D4NIX3NoruLSjtKmLlbTwCKER1NmV+QIqfS13aai0izUHsRKksAQE5g0w4fuehj9f+xb25Ym1tbcIhuw2COmkBn2cAcQAFbsclV1BTns49JZio3EQWPkgCySJpFIu8aor0UfeLigDTlUTa/8eimhRGuUiKOZPYtYNabh9EGik3Mkk+A9I8JTWoAiik/LEpzY8tY4uwWc4AJMjxQd8oXRHU8JqbW32orNyAiubZo0WR5wX9KyHrLpLD52nrxhFHa1CVV5w3081cRu/7BYichpEqfafA7/sCzhT7tVkhLZvhTeB8Gv1r6U+ty/gqtWHQCSNTcPOl9NmXM1S4hgRjBjjL1MdUJ8cx3uhe3d3dfh5Meb8qyKWsuJRidwtN/h20XEtxvTwya7tKncU8ACqmXVwLict5fy6TnFhra2uW7xT8dWk2BHptVBOx8GLKjo3g7bhrBQq1sdVsCvEkhLZIac1y/zmUSO0oO8fX/0P2Ub3cwaWpZSITnLnOpDlBWTIfMleJqFb10jXCBJUlMyORSIP14LhqNef6v/05bpZTdHulUyXKsufDNdRxZ4vIhSKwhQFG5vfLfcwZsx2X92Jhje8/P8OI+TK/oO+zeA84WTzkvI/6RuB3y6f68qf11xnyMiuzMms4178AwArmZmkkdGcAAAAASUVORK5CYII=';
  var distanceBetween = function(point1, point2) {
    var a = point2.x - point1.x;
    var b = point2.y - point1.y;
    return Math.sqrt((a*a) + (b*b));
  }
  var angleBetween = function(point1, point2) {
    return Math.atan2(point2.x - point1.x, point2.y - point1.y);
  }

  var AUTO_DRAW_POSITION = [{"x":253,"y":103.5},{"x":249,"y":111.5},{"x":248,"y":117.5},{"x":247,"y":122.5},{"x":251,"y":125.5},{"x":258,"y":128.5},{"x":263,"y":131.5},{"x":264,"y":133.5},{"x":264,"y":136.5},{"x":263,"y":140.5},{"x":260,"y":145.5},{"x":257,"y":150.5},{"x":254,"y":153.5},{"x":251,"y":156.5},{"x":251,"y":157.5},{"x":250,"y":157.5},{"x":250,"y":158.5},{"x":249,"y":158.5}];

  function Scratch(canvas/*HTMLCanvasElement*/, coverImgURL/*string*/, completeCallback/*Function*/){
    var self = this;
    this.canvas = canvas;
    this.autoDrawing = false;
    this.completeCallback = completeCallback;
    this.supportTouch = ('ontouchstart' in window);
    this.isDrawing = false;
    this.lastPoint = {x:0,y:0};
    this.context = canvas.getContext('2d');
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.brushImg = new Image();
    this.brushImg.src = BRUSH_B64;
    // width 80, height 50
    /* this.brushImg.onload = ()=>{
      console.log(this.brushImg.width);
      console.log(this.brushImg.height);
    } */

    var element = document.querySelector('.scratch');
    var img = new Image();
    this.img = img;
    img.src = coverImgURL;
    img.onload = function (){
      element.classList.add('animate');
      document.querySelector('.scratch__result').style.visibility = 'visible';
      var ctx = self.context;
      var w = img.width;
      var h = img.height;
      
      self.canvas.width = w;
      self.canvas.height = h;
      ctx.drawImage(img, 0, 0);

      element.addEventListener('touchstart', self.handleMouseDown);
      window.addEventListener('touchmove', self.handleMouseMove);
      window.addEventListener('touchend', self.handleMouseUp);	
      element.addEventListener('mousedown', self.handleMouseDown);
      window.addEventListener('mousemove', self.handleMouseMove);
      window.addEventListener('mouseup', self.handleMouseUp);


      self.autoDraw(AUTO_DRAW_POSITION);
    };
  }

  Scratch.prototype.getMousePosition = function (event) {
    const pageScrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const pageScrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
    const evt = this.supportTouch ? event.touches[0] : event;
    const rect = this.canvas.getBoundingClientRect();
    if(window.convertPointFromPageToNode){
      return window.convertPointFromPageToNode(document.querySelector('.scratch'), evt.pageX, evt.pageY);
    }
    return {
      x: evt.pageX - rect.left - pageScrollLeft,
      y: evt.pageY - rect.top - pageScrollTop,
    };
  };

  Scratch.prototype.handleMouseDown = function (event){
    event.preventDefault();
    this.lastPoint = this.getMousePosition(event);
    this.isDrawing = true;
  };

  Scratch.prototype.handleMouseMove = function (event){
    if(!this.isDrawing || this.autoDrawing){
      return;
    }
    var position = this.getMousePosition(event);
    this.draw(position);
    var progress = this.getFilledInPixels(32);
    if(progress > 0.5 && this.completeCallback){
      this.completeCallback.call(this);
    } 
  };

  Scratch.prototype.autoDraw = function (positoins){
    this.autoDrawing = true;
    this.lastPoint = positoins[0];
    var self = this;
    var index = 0;
    var fps = 40;
    var now;
    var then = Date.now();
    var interval = 1000/fps;
    var delta;
    var animationFrameID = -1;
    var d = function (){
      animationFrameID = requestAnimationFrame(d);
      now = Date.now();
      delta = now - then;
      if (delta > interval) {
        then = now - (delta % interval);
        self.draw(positoins[index]);
        index++;
        if(index >= positoins.length-1){
          self.autoDrawing = false;
          cancelAnimationFrame(animationFrameID);
        }
      }
    }
    setTimeout(d, 500);
  };

  Scratch.prototype.draw = function (position){
    var dist = distanceBetween(this.lastPoint, position);
    var angle = angleBetween(this.lastPoint, position);
    var ctx = this.context;
    var x,y;
    for (var i = 0; i < dist; i += 1) {
      x = this.lastPoint.x + (Math.sin(angle) * i);
      y = this.lastPoint.y + (Math.cos(angle) * i);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.drawImage(this.brushImg, x - 40, y - 25)
    }
    this.lastPoint = position;
  };

  Scratch.prototype.handleMouseUp = function (event){
    this.isDrawing = false;
  };

  Scratch.prototype.getFilledInPixels = function(stride/*number*/) {
    if (!stride || stride < 1) { 
      stride = 1; 
    }
    var pixels = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    var data = pixels.data;
    var length = data.length;
    var total = (length / stride);
    var count = 0;
    for(var i = count = 0; i < length; i += stride) {
      if (parseInt(data[i]) === 0) {
        count++;
      }
    }
    
    return count / total;
  };

  Scratch.prototype.destory = function (){
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('touchstart', this.handleMouseDown);
    this.canvas.removeEventListener('touchmove', this.handleMouseMove);
    this.canvas.removeEventListener('touchend', this.handleMouseUp);
    this.canvas.parentNode.removeChild(this.canvas);
  };
  return Scratch;
})();


var app = new Scratch(document.querySelector('.scratch__canvas'), 'https://fakeimg.pl/500x300/000000/?text=obtien ton code', function (){
  console.log('scratch complete');
})

document.addEventListener('DOMContentLoaded', function() {
  var texts = [
      "S9P1Q-IT6Y3-SFQYV-M905M",
      "X2E4F-P86VZ-HP96R-VS4TG",
      "075HU-GS0SM-S07SW-YVQBQ",
      "01KVO-VC7TP-V3FCX-B6QP3",
      "05RM6-SD4L0-RJ001-Y6BNP",
      "5TC4T-QRA8S-DF3RD-TVUVY",
      "81RNZ-EUE6P-BYTKM-Z91MB",
      "8W71E-YYLL1-D07F3-PKH4O",
      "9LO7D-IZTAS-1Y4W3-3YM6W",
      "B1TTY-9UU41-KIVFB-UJZOI",
      "FR0CG-FVPYY-PO430-BIKJ9",
      "S9P1Q-IT6Y3-SFQYV-M905M",
      "X2E4F-P86VZ-HP96R-VS4TG",
      "075HU-GS0SM-S07SW-YVQBQ",
      "0ERJJ-0F2T1-QTZG6-6IGSV",
      "0KGJA-TDDUU-P2CRD-8ESR8",
      "0M3S6-DFQQK-1YQZF-2DHR7",
      "0UK8S-812H6-XWSUR-2OF47",
      "10HYV-JI43J-H4PK0-9S9IY",
      "180SA-L6UJW-IUMGX-7FTTX",
      "2ZUA1-H052H-KV55B-4GBZH",
      "303OQ-4ZLOT-WPDV0-HE7ZC",
      "3GZ1C-FCPTD-SZ0N0-5W6JP",
      "5HBH3-O0DW4-C1F6T-KH0SQ",
      "5Z6JE-8HY6U-7RHEE-U1X3M",
      "6EUF2-TM8NB-YYI8B-05UYL",
      "6IVCY-3N6AJ-UK8PW-J2AJI",
      "7TB3R-T6RJ6-O0OMB-HXIW1",
      "84JBM-EW9S8-Q4XIE-VVJLQ",
      "8JN2J-CW2LQ-TCV59-ZDQIV",
      "97D3E-YEEBY-I8O4J-3FPT4",
      "9BDVC-IZPK0-3NVO1-1PF3G",
      "A0ZFY-1V0D1-MKVFB-B7XUW",
      "AB503-7SXOY-U6L02-9RM7W",
      "AB5DA-JA6F0-LXGID-EX1L9",
      "ACIO7-8Y93J-8ZXOB-LTIIS",
      "ANKPQ-IXY9K-6LCJF-93H2A",
      "B0GUH-L3Z8V-RFFQO-ZYBR8",
      "B3C1O-P9QOR-KDJCD-69JXO",
      "BBMI5-7N4FB-A6DQ7-4YSZ3",
      "BLN4T-2Q0TI-4UAJW-5YTSW",
      "BV791-F7DSV-UY0H3-1U7DE",
      "BWF2Y-OALVC-EEFCP-WSLFA",
      "CD3VV-T7W69-JKFJ3-H2V2V",
      "CVIEP-2KS4O-1GUKK-OVOUB",
      "D7V0A-73ODY-V2906-WRT27",
      "DA8L8-8UE8P-UKUV1-ICPXM",
      "DBPPA-759ND-WGE2W-0KCNF",
      "DTR13-DKNW2-PV5XH-FUPU0",
      "EWRHA-L8D0W-C9DZV-BCRN7",
      "F42AY-JDLQ5-QU0YR-2GXD2",
      "FOBMO-EO518-JVFJY-VLVC3",
      "GDRWQ-O1FDA-ET41H-XUQGT",
      "GJ116-RDT6C-REJVL-LKQT8",
      "GLD4L-JQ54U-6W0AQ-37PAP",
      "H1J2F-NZ5PV-CJKX4-GMVOT",
      "H1NX2-GZE3J-M5S07-6GPL1",
      "HBVPP-A66LY-VMZTO-FPR5T",
      "HJGF4-PSUBT-N351B-C9VSZ",
      "IMPXR-FYGFT-FNMGR-JT0WN",
      "K22PX-23V2T-KVK21-YO2KK",
      "K71M9-WZC9A-U61T5-D54QF",
      "KDX1W-VBM2R-DC3WR-M5KRE",
      "KJ1UY-ZHZZX-7TBYS-HVB2X",
      "KNS8I-N26U0-YKZYV-06GI2",
      "L8HX4-3F0ZO-LBPGF-DM1GD",
      "LZSIW-TILO0-8SMFX-7CS9H",
      "M5NGB-JAA4F-UY5RW-0I7DZ",
      "NCNF0-2KXSP-NDD0U-GGCLI",
      "NPXDM-NFHQO-XEHV1-7V4YK",
      "OQFFF-COQ31-U2E4K-Y4JZX",
      "P0SZO-3IW5K-189ZA-TQ046",
      "PIJ11-I0KS8-SPHUW-DCLR8",
      "PXWUJ-D2HZT-TW2GC-WKGI6",
      "Q252G-4OGB4-6VIAX-AGFXY",
      "Q2SO6-Q9RKN-H4NCP-H0RG2",
      "QA9US-343VM-9XDBM-HO5DC",
      "R2G1W-CQEVS-LWB35-NOQID",
      "RBI2V-0AUFU-1HC4M-84Q4G",
      "RIEBM-K4C71-8SIN6-I0IPL",
      "RVITA-L1DP6-NWUG0-UZLEB",
      "S20YV-0LZ5O-AGMYA-2EVWG",
      "S714D-XVOCQ-G7IFR-J2Y11",
      "SEG33-HF2KH-KD8OS-O0E7E",
      "SJJYU-4E77F-T8BAA-QWSA9",
      "SL5C4-3RJ57-UR3O2-MAXF6",
      "SRPBM-LZLA9-99GU7-7F6YX",
      "TF11G-JK018-AUDGK-EPRU8",
      "TFV8A-4CZSE-NKJ52-53XFL",
      "THXP3-75D0S-UJ822-BCCP4",
      "TLXGN-AY8KC-ZJ38B-3D8LR",
      "TMQ5S-Q6XCA-21AUS-MNZIS",
      "UBMBR-V2GXD-R3LPD-45RSJ",
      "UPMEB-BX0IY-F13OA-F59LZ",
      "USH9X-087WU-JX0OP-51E7A",
      "VAWXD-6JY2K-C1EY4-B0KOX",
      "VHL9H-APTOM-9DAA1-PCQGB"
      // Ajoutez d'autres codes ou textes ici
  ];

  var baseUrl = "https://fakeimg.pl/500x222/ffffff/6ab04c/?text=";
  var imageElement = document.getElementById('scratchImage');
  var randomIndex = Math.floor(Math.random() * texts.length);
  var fullUrl = baseUrl + texts[randomIndex];
  imageElement.src = fullUrl;
});

