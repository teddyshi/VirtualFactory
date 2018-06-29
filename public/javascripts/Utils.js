var uuid = function (len, radix) {
     var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
     var chars = CHARS, uuid = [], i;
     radix = radix || chars.length;
   
     if (len) {
       // Compact form
       for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
     } else {
       // rfc4122, version 4 form
       var r;
   
       // rfc4122 requires these characters
       uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
       uuid[14] = '4';
   
       // Fill in random data.  At i==19 set the high bits of clock sequence as
       // per rfc4122, sec. 4.1.5
       for (i = 0; i < 36; i++) {
         if (!uuid[i]) {
           r = 0 | Math.random()*16;
           uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
         }
       }
     }
   
     return uuid.join('');
};
   
//Define HashMap
function HashMap()
{
    this.length = 0;
    this.prefix = "hashmap_prefix_20151125_";
};

HashMap.prototype.put = function (key, value)
{
    this[this.prefix + key] = value;
    this.length ++;
};

HashMap.prototype.get = function(key)
{
    return typeof this[this.prefix + key] == "undefined" 
            ? null : this[this.prefix + key];
};

HashMap.prototype.keySet = function()
{
    var arrKeySet = new Array();
    var index = 0;
    for(var strKey in this)
    {
        if(strKey.substring(0,this.prefix.length) == this.prefix)
            arrKeySet[index ++] = strKey.substring(this.prefix.length);
    }
    return arrKeySet.length == 0 ? null : arrKeySet;
};

HashMap.prototype.values = function()
{
    var arrValues = new Array();
    var index = 0;
    for(var strKey in this)
    {
        if(strKey.substring(0,this.prefix.length) == this.prefix)
            arrValues[index ++] = this[strKey];
    }
    return arrValues;
};

HashMap.prototype.size = function()
{
    return this.length;
};

HashMap.prototype.remove = function(key)
{
    delete this[this.prefix + key];
    this.length --;
};

HashMap.prototype.clear = function()
{
    for(var strKey in this)
    {
        if(strKey.substring(0,this.prefix.length) == this.prefix)
            delete this[strKey];   
    }
    this.length = 0;
};

HashMap.prototype.isEmpty = function()
{
    return this.length == 0;
};

HashMap.prototype.containsKey = function(key)
{
    for(var strKey in this)
    {
       if(strKey == this.prefix + key)
          return true;  
    }
    return false;
};

HashMap.prototype.containsValue = function(value)
{
    for(var strKey in this)
    {
       if(this[strKey] == value)
          return true;  
    }
    return false;
};

HashMap.prototype.putAll = function(map)
{
    if(map == null)
        return;
    if(map.constructor != HashMap)
        return;
    var arrKey = map.keySet();
    var arrValue = map.values();
    for(var i in arrKey)
       this.put(arrKey[i],arrValue[i]);
};

HashMap.prototype.toString = function()
{
    var str = "";
    for(var strKey in this)
    {
        if(strKey.substring(0,this.prefix.length) == this.prefix){
          //string operation: str=str+'abc' is faster than str+='abc'
          //the equation str+='abc' will create two string instance in memory
          //but the equation str=str+'abc' will append 'abc' to the existing str,so normally it only creates one string instance.
      str = str + strKey.substring(this.prefix.length) 
                  + " : " + this[strKey] + "\r\n";
        }
    }
    return str;
};
//HashMap definition end

function SimpleDateFormat(date){
  var options = {
      weekday: "long", year: "numeric", month: "short",
      day: "numeric", hour: "2-digit", minute: "2-digit"
  };
  return date.toLocaleTimeString("en-us", options);
}


function getSuitableSegments(baseSegments,x,y,z){
  var segmentsX,segmentsY,segmentsZ = baseSegments;
  var rs = {
    segmentsX:baseSegments,
    segmentsY:baseSegments,
    segmentsZ:baseSegments
  };
  var maxOfXYZ = Math.max(x,y,z);
  var minOfXYZ = Math.min(x,y,z);
  var orgin = {
    x:x,
    y:y,
    z:z
  };
  var whichOneIsMax = '';
  for(index in orgin){
    if(orgin[index]===maxOfXYZ){
      whichOneIsMax = index;
    }
  }
  var times = Math.round(maxOfXYZ/minOfXYZ);
  var segments = times>=2?(times>=4?(times>=8?baseSegments*8:baseSegments*4):baseSegments*2):baseSegments*2;
  var setter = {
    x:function(rs,segments){
      rs.segmentsX = segments;
    },
    y:function(rs,segments){
      rs.segmentsY = segments;
    },
    z:function(rs,segments){
      rs.segmentsZ = segments;
    }
  };
  setter[whichOneIsMax].call(this,rs,segments);
  return rs;
}

//get the distance of a point between a line v->w
function distToSegment(p, v, w) { 
  function sqr(x) { return x * x }
  function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) }
  function distToSegmentSquared(p, v, w) {
    var l2 = dist2(v, w);
    if (l2 == 0) return dist2(p, v);
    var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    if (t < 0) return dist2(p, v);
    if (t > 1) return dist2(p, w);
    return dist2(p, { x: v.x + t * (w.x - v.x),
                      y: v.y + t * (w.y - v.y) });
  }
  return Math.sqrt(distToSegmentSquared(p, v, w)); 
}

