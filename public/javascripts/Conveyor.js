var Conveyor = function(vf,name,position){
	this.virtualFactory =  vf;
	this.name = name;
	var baseGroup = new THREE.Object3D();
	baseGroup.name='base';
	if(position){
		baseGroup.position.copy(position);
	}
	var conveyorParam = {
		partOne:{
			length:350,
			width:100,
			height:50
		},
		partTwo:{
			length:1000,
			width:100,
			height:50			
		}
	}
	this.conveyorPartTwo = createConveyorPartTwo(baseGroup.position,conveyorParam);
	this.conveyorPartOne = createConveyorPartOne(baseGroup.position,conveyorParam);	
	baseGroup.add(this.conveyorPartTwo);
	baseGroup.add(this.conveyorPartOne);
	this.conveyor = baseGroup;
	this.objects = new HashMap();
	this.controller = buildController(this);
	return this;
};

function buildController(conveyor){
	var controller={
						conveyor:conveyor,
						status:'stopped',//Have two status:running/stopped
						beltStatus:'empty', //Have two status:empty/loaded
						footPrints:[
							conveyor.conveyorPartOne.footPrint,
							conveyor.conveyorPartTwo.footPrint
						]
					};
	controller.putObject = function(key,thing){
		this.conveyor.objects.put(key,thing);
	};

	controller.removeObject = function(key){
		this.conveyor.objects.remove(key);
	};

	//get the sum length on X axis of those who has stopped running.
	controller.getStoppedObjectXLengthSum = function(controller,cubeSelf){
		if(controller.conveyor.objects.isEmpty()){
			return 0;
		}
		var xLengthSum = 0;
		var allObjects = controller.conveyor.objects.values();
		for(var i in allObjects){
			var obj = allObjects[i];
			if(cubeSelf.uuid===obj.uuid){
				continue;
			}
			xLengthSum+= obj.onConveyorStatus==='stopped'?obj.xLength:0;
		}
		return xLengthSum;
	};

	controller.run = function(){
		if('running'===this.status){
			return;
		}
		this.status = 'running';
		//To improve the performace of 'move' method which would be invoked many times.
		//Wrap the key properties which mostly have deep chains of calling
		var conveyorKeyParams ={
			controller:this,
			conveyor:this.conveyor,
			virtualFactory:this.conveyor.virtualFactory,
			getStoppedObjectXLengthSum:this.getStoppedObjectXLengthSum,
			conveyorHeight:controller.conveyor.conveyorPartOne.footPrint.conveyorHeight,
			//footPrintOneStartX: controller.conveyor.conveyorPartOne.footPrint.startPosition.x,
			//footPrintOneStartY: controller.conveyor.conveyorPartOne.footPrint.startPosition.y,
			//footPrintOneEndX:controller.conveyor.conveyorPartOne.footPrint.endPosition.x,
			//footPrintOneEndY: controller.conveyor.conveyorPartOne.footPrint.endPosition.y,
			//footPrintTwoStartX: controller.conveyor.conveyorPartTwo.footPrint.startPosition.x,
			footPrintTwoStartY:controller.conveyor.conveyorPartTwo.footPrint.startPosition.y,
			footPrintTwoEndX: controller.conveyor.conveyorPartTwo.footPrint.endPosition.x,
			//footPrintTwoEndY: controller.conveyor.conveyorPartTwo.footPrint.endPosition.y,
			stepDistance: 5
		};

		var move = function(conveyorKeyParams){
			if('stopped'===conveyorKeyParams.controller.status){
				return;
			}			
			var objects = conveyorKeyParams.conveyor.objects.values();
			for(var i in objects){
				var cube = objects[i];
				var z = cube.position.z;
				var x = cube.position.x;
				var y = cube.position.y;
				var sumXlengthOfStoppedObjets = conveyorKeyParams.getStoppedObjectXLengthSum.call(this,conveyorKeyParams.controller,cube);
				if(y!=conveyorKeyParams.footPrintTwoStartY){
					//the object is on footPrintOne
					//move a short distance along the footPrintOne
					var distanceToEnd = conveyorKeyParams.footPrintTwoStartY-y;
					var shouldStop = distanceToEnd<=0||distanceToEnd<conveyorKeyParams.stepDistance;
					cube.translateY(shouldStop?(distanceToEnd>0?distanceToEnd:0):conveyorKeyParams.stepDistance);
				}else{
					var endPoint = conveyorKeyParams.footPrintTwoEndX+sumXlengthOfStoppedObjets+cube.xLength/2;
					var distanceToEnd = x-endPoint;
					//the object is on footPrintTwo
					//move a short distance along the footPrintTwo
					var shouldStop = distanceToEnd<=0||distanceToEnd<conveyorKeyParams.stepDistance;
					cube.translateX(shouldStop?(distanceToEnd>0?-distanceToEnd:0):-conveyorKeyParams.stepDistance);
					if(shouldStop){
						cube.onConveyorStatus = 'stopped';
					}else{
						cube.onConveyorStatus = 'running';
					}
				}
			}
			conveyorKeyParams.virtualFactory.render();
			setTimeout(move,30,conveyorKeyParams);
		};
		move(conveyorKeyParams);
	};


	controller.stop = function(){
		this.status='stopped';
	};

	return controller;
}

function createConveyorPartTwo(rootPosition,conveyorParam){
	var xLength = conveyorParam.partTwo.length;
	var yLength = conveyorParam.partTwo.width;
	var zLength = conveyorParam.partTwo.height;
	var geometry = new THREE.BoxGeometry( xLength, yLength, zLength , 64, 16, 16);
	var cube = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: 0x947874, overdraw: 0.1, shading: THREE.SmoothShading } ));
	cube.position.z = zLength/2;
	cube.name='conveyorPartTwo';
	cube.footPrint = {
		conveyorHeight:zLength,
		startPosition:{
			x:rootPosition.x+xLength/2,
			y:rootPosition.y
		},
		endPosition:{
			x:rootPosition.x-xLength/2,
			y:rootPosition.y
		}
	};
	return cube;
}

function createConveyorPartOne(rootPosition,conveyorParam){
	var xLength = conveyorParam.partOne.width;
	var yLength = conveyorParam.partOne.length;
	var zLength = conveyorParam.partOne.height;
	var partTwoLength = conveyorParam.partTwo.length;
	var partTwoWidth = conveyorParam.partTwo.width;
	var geometry = new THREE.BoxGeometry( xLength, yLength, zLength , 16, 64, 16);
	var material = new THREE.MeshNormalMaterial();
	var cube = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: 0x947874, overdraw: 0.1, shading: THREE.SmoothShading } ));
	cube.position.z = zLength/2;
	cube.position.x = partTwoLength/2-xLength/2;
	cube.position.y = -partTwoWidth/2-yLength/2;
	cube.name='conveyorPartOne';
	cube.footPrint = {
		conveyorHeight:zLength,
		startPosition:{
			x:rootPosition.x+partTwoLength,
			y:rootPosition.y-yLength
		},
		endPosition:{
			x:rootPosition.x+partTwoLength,
			y:rootPosition.y
		}
	};
	return cube;
}

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
    return arrValues.length == 0 ? null : arrValues;
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