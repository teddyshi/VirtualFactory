var RfidInstaller = function(vf,name,position){
	this.virtualFactory =  vf;
	this.name = name;
	var baseGroup = new THREE.Object3D();
	baseGroup.name=name+'_base';
	if(position){
		baseGroup.position.copy(position);
	}
	this.size = 50;
	createInstallerFrame(baseGroup,this.size);
	this.objects = new HashMap();
	this.queue = new HashMap();
	this.controller = buildController(this);
	this.baseGroup = baseGroup;
	return this;
};


function buildController(machine){
	var controller={
						machine:machine,
						status:'stopped',//Have two status:running/stopped
						loadStatus:'empty', //Have two status:empty/loaded
						loadedObject:null
					};

	controller.loadObject = function(controller,object){
		controller.machine.objects.put(object.name,object);
		var installerPosition = controller.machine.baseGroup.position;
		object.position.copy(new THREE.Vector3(installerPosition.x,installerPosition.y,installerPosition.z+object.zLength/2));
		object.onRfidInstallerStatus='working';
		controller.loadStatus = 'loaded';
		controller.loadedObject = object;
	};

	controller.cooperationStart = function(controller,object){
		console.log('starting operation on:'+controller.machine.name+" with object:"+object.name);
	};

	controller.stop = function(){
		controller.status='stopped';
	};

	controller.resume = function(){
		controller.status='running';
	};

	controller.start = function(object){
		//put sfc to the queue
		this.machine.queue.put(object.name,object);		
	};

	controller.run = function(process){
		this.process = process;
		this.status='running';
		var previousCooperator = process.previousCooperator;
		if(!previousCooperator){
			console.warn('can not find previousCooperator');
		}
		if(!process.hasOwnProperty('start')){
			console.warn('start function undefined');
			return;
		}
		var param = {
			controller:controller,
			previousCooperator:previousCooperator,
			startFunction:process['start']
		};
		var doStart = function(param){
			if('stopped'===param.controller.status||param.controller.loadStatus==='loaded'){
				setTimeout(doStart,100,param);
				return;
			}
			var startResult = param.startFunction.call(this,param.controller);
			var objectToBeStart;
			if(startResult.isReady){
				objectToBeStart = startResult.objectToBeStart;
				param.controller.loadObject(param.controller,objectToBeStart);
				param.controller.machine.queue.remove(objectToBeStart.name);
			}
			setTimeout(doStart,100,param)
		};
		doStart(param);
	};

	controller.complete = function(sfc){
		var controller = this;
		if(controller.loadStatus!=='loaded'){
			console.warn('Not any object loaded yet,please start at first');
			return;
		}	

		if(!controller.process.hasOwnProperty('complete')){
			console.warn('complete function undefined');
			return;
		}
		var completeResult = controller.process['complete'].call(this,controller,sfc);

		if(!completeResult){
			console.warn('Failed to complete the operation,please make sure the SFC number is correct');
			return;
		}
		
		//and then change the status to 'finished'
		controller.loadedObject.onRfidInstallerStatus='finished';
		var nextCooperator = controller.process.nextCooperator;
		if(!nextCooperator){
			console.warn('can not find nextCooperator');
			return;
		}
		//Go to the next operation
		//Do cooperation on next cooperator if the function is defined.
		if(nextCooperator.controller.hasOwnProperty('cooperationStart')){
			nextCooperator.controller['cooperationStart'].call(this,nextCooperator.controller,controller.loadedObject);
			controller.loadedObject = null;
			controller.loadStatus='empty';
		}
	};

	return controller;
}




function createInstallerFrame(baseGroup,size){

	//create base cube
	baseGroup.add(createBaseCube({
		width:size*1.5,
		length:100,
		height:50,
		x:0,
		y:0,
		z:-25
	}));

	//create top wall
	baseGroup.add(createCuboid({
		width:size*1.5,
		length:size/10,
		height:size,
		x:0,
		y:-size+size/20,
		z:size/2,
		name:'top-wall'
	}));
	//create bottom wall
	baseGroup.add(createCuboid({
		width:size*1.5,
		length:size/10,
		height:size,
		x:0,
		y:size-size/20,
		z:size/2,
		name:'bottom-wall'
	}));
	//create cover
	baseGroup.add(createCuboid({
		width:size*1.5,
		length:size*2-size/5,
		height:size/10,
		x:0,
		y:0,
		z:size-size/20,
		name:'cover'
	}));

}


function createBaseCube(param){
	var segments = getSuitableSegments(4,param.width,param.length,param.height);
	var geometry = new THREE.BoxGeometry( param.width, param.length, param.height, segments.segmentsX, segments.segmentsY, segments.segmentsZ);
	var cube = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: param.color?param.color:0x848B96, overdraw: 0.5, shading: THREE.SmoothShading } ));
	cube.position.x = param.x;
	cube.position.y = param.y;
	cube.position.z = param.z;
	cube.name='base-cube_'+uuid();
	return cube;
}

function createCuboid(param){
	var segments = getSuitableSegments(4,param.width,param.length,param.height);
	var geometry = new THREE.BoxGeometry( param.width, param.length, param.height , segments.segmentsX, segments.segmentsY, segments.segmentsZ);
	var cube = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: param.color?param.color:0x22F5D9, overdraw: 0.5, transparent:true,opacity:0.5,shading: THREE.SmoothShading } ));
	cube.position.x = param.x;
	cube.position.y = param.y;
	cube.position.z = param.z;
	cube.name=param.name;
	return cube;
}
