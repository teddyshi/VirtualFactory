var AppearanceDetector = function(vf,name,position){
	this.virtualFactory =  vf;
	this.name = name;
	var baseGroup = new THREE.Object3D();
	baseGroup.name=name+'_base';
	if(position){
		baseGroup.position.copy(position);
	}
	this.detectorSize = 100;
	createDetectorFrame(baseGroup,this.detectorSize);
	//the map holds the results of data collection
	this.dcResults = new HashMap();
	this.queue = new HashMap();
	this.objects = new HashMap();
	this.baseGroup = baseGroup;
	this.controller = buildController(this);
	return this;
};

function buildController(machine){
	var controller = {
		machine:machine,
		status:'stopped',
		loadStatus:'empty', //Have two status:empty/loaded
		loadedObject:null
	};


	controller.loadObject = function(controller,object){
		controller.machine.objects.put(object.name,object);
		var installerPosition = controller.machine.baseGroup.position;
		object.position.copy(new THREE.Vector3(installerPosition.x,installerPosition.y,installerPosition.z+object.zLength/2));
		object.onAppearanceDetectorStatus='working';
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
		controller.loadedObject.onChassisInstallerStatus='finished';
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

function createDetectorFrame(baseGroup,size){
	var gap = size;
	var beamWidth = 0.05*size;
	var beamHeight = 0.05*size;
	var beamLength = gap;
	var pillarWidth = 0.05*size;
	var pillarLength = 0.05*size;
	var pillarHeight = size*1.2;
	var glassThickness = 0.02*size;
	//create base cube
	baseGroup.add(createBaseCube({
		width:size,
		length:100,
		height:50,
		x:0,
		y:0,
		z:-25
	}));

	//add pillar at left bottom corner
	baseGroup.add(createPillarOrBeam({
		width:pillarWidth,
		length:pillarLength,
		height:pillarHeight,
		x:-gap/2+pillarWidth/2,
		y:-gap/2,
		z:pillarHeight/2,
		name:'left-bottom-pillar'
	}));
	//add pillar at right bottom corner
	baseGroup.add(createPillarOrBeam({
		width:pillarWidth,
		length:pillarLength,
		height:pillarHeight,
		x:gap/2-pillarWidth/2,
		y:-gap/2,
		z:pillarHeight/2,
		name:'right-bottom-pillar'
	}));
	//add pillar at left top corner
	baseGroup.add(createPillarOrBeam({
		width:pillarWidth,
		length:pillarLength,
		height:pillarHeight,
		x:-gap/2+pillarWidth/2,
		y:gap/2,
		z:pillarHeight/2,
		name:'left-top-pillar'
	}));
	//add pillar at right top corner
	baseGroup.add(createPillarOrBeam({
		width:pillarWidth,
		length:pillarLength,
		height:pillarHeight,
		x:gap/2-pillarWidth/2,
		y:gap/2,
		z:pillarHeight/2,
		name:'right-top-pillar'
	}));

	//add bottom beam	
	baseGroup.add(createPillarOrBeam({
		width:beamLength,
		length:beamWidth,
		height:beamHeight,
		x:0,
		y:-gap/2+length/2,
		z:pillarHeight+beamHeight/2,
		name:'bottom-Beam'
	}));

	//add top beam	
	baseGroup.add(createPillarOrBeam({
		width:beamLength,
		length:beamWidth,
		height:beamHeight,
		x:0,
		y:gap/2-length/2,
		z:pillarHeight+beamHeight/2,
		name:'top-Beam'
	}));

	//add left beam	
	baseGroup.add(createPillarOrBeam({
		width:beamWidth,
		length:beamLength,
		height:beamHeight,
		x:-gap/2+beamWidth/2,
		y:0,
		z:pillarHeight+beamHeight/2,
		name:'left-Beam'
	}));

	//add left beam under the glass
	baseGroup.add(createPillarOrBeam({
		width:beamWidth,
		length:beamLength,
		height:beamHeight,
		x:-gap/2+beamWidth/2,
		y:0,
		z:pillarHeight*0.4,
		name:'left-Beam-under-glass'
	}));

	//add right beam	
	baseGroup.add(createPillarOrBeam({
		width:beamWidth,
		length:beamLength,
		height:beamHeight,
		x:gap/2-beamWidth/2,
		y:0,
		z:pillarHeight+beamHeight/2,
		name:'right-Beam'
	}));


	//add right beam under the glass
	baseGroup.add(createPillarOrBeam({
		width:beamWidth,
		length:beamLength,
		height:beamHeight,
		x:gap/2-beamWidth/2,
		y:0,
		z:pillarHeight*0.4,
		name:'right-Beam-under-glass'
	}));

	//add bottom glass
	baseGroup.add(createGlass({
		width:beamLength,
		length:glassThickness,
		height:pillarHeight,
		x:0,
		y:-gap/2+glassThickness/2,
		z:pillarHeight/2,
		name:'bottom-glass'	
	}));

	//add top glass
	baseGroup.add(createGlass({
		width:beamLength,
		length:glassThickness,
		height:pillarHeight,
		x:0,
		y:gap/2-glassThickness/2,
		z:pillarHeight/2,
		name:'top-glass'	
	}));

	//add left glass
	baseGroup.add(createGlass({
		width:glassThickness,
		length:beamLength,
		height:pillarHeight*0.6,
		x:-gap/2+beamWidth/2,
		y:0,
		z:pillarHeight*0.3+pillarHeight*0.4,
		name:'left-glass'	
	}));

	//add right glass
	baseGroup.add(createGlass({
		width:glassThickness,
		length:beamLength,
		height:pillarHeight*0.6,
		x:gap/2-beamWidth/2,
		y:0,
		z:pillarHeight*0.3+pillarHeight*0.4,
		name:'right-glass'	
	}));

	//add ceil glass
	baseGroup.add(createGlass({
		width:beamLength,
		length:beamLength,
		height:glassThickness,
		x:0,
		y:0,
		z:pillarHeight-glassThickness/2,
		name:'ceil-glass'	
	}));

	//add ceil holder to hold a camera
	baseGroup.add(createPillarOrBeam({
		width:beamWidth*1.7,
		length:beamLength,
		height:beamHeight*1.3,
		x:0,
		y:0,
		z:pillarHeight-glassThickness/2-beamHeight*1.3/2,
		color:0xe8e8e8,
		name:'camera-holder'
	}));

	baseGroup.add(createCamaraTerminal({
		bottomRadius:8,
		topRadius:4,
		height:12,
		x:0,
		y:-gap/2+10,
		z:pillarHeight-glassThickness/2-beamHeight*1.3/2-6,
		rotationX:-Math.PI*0.3,
		rotationY:0,
		rotationZ:0,
		color:0xF5F50C,
		name:'camera-terminal'
	}));

	baseGroup.add(createProjectionLight({
		bottomRadius:40,
		topRadius:8,
		height:85,
		x:0,
		y:-gap/2+38.5,
		z:pillarHeight-glassThickness/2-beamHeight*1.3/2-45,
		rotationX:-Math.PI*0.3,
		rotationY:0,
		rotationZ:0,
		color:0x28F506,
		name:'projection-light'
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


function createProjectionLight(param){
	var geometry = new THREE.CylinderGeometry( param.bottomRadius, param.topRadius, param.height, 64);
	var material = new THREE.MeshPhongMaterial( { color:param.color?param.color:0x07F5D9, overdraw: 0.5,transparent:true,opacity:0.7, shading: THREE.SmoothShading } );
	var cylinder = new THREE.Mesh( geometry, material );
	cylinder.position.x=param.x;
	cylinder.position.y=param.y;
	cylinder.position.z = param.z;
	cylinder.rotation.x = param.rotationX;
	cylinder.rotation.y = param.rotationY;
	cylinder.rotation.z = param.rotationZ;
	cylinder.name = param.name;
	cylinder.visible=false;
	return cylinder;
}

function createCamaraTerminal(param){
	var geometry = new THREE.CylinderGeometry( param.bottomRadius, param.topRadius, param.height, 8);
	var material = new THREE.MeshPhongMaterial( { color:param.color?param.color:0x07F5D9, overdraw: 0.5, shading: THREE.SmoothShading } );
	var cylinder = new THREE.Mesh( geometry, material );
	cylinder.position.x=param.x;
	cylinder.position.y=param.y;
	cylinder.position.z = param.z;
	cylinder.rotation.x = param.rotationX;
	cylinder.rotation.y = param.rotationY;
	cylinder.rotation.z = param.rotationZ;
	cylinder.name = param.name;
	return cylinder;
}

function createPillarOrBeam(param){
	var segments = getSuitableSegments(4,param.width,param.length,param.height);
	var geometry = new THREE.BoxGeometry( param.width, param.length, param.height , segments.segmentsX, segments.segmentsY, segments.segmentsZ);
	var cube = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: param.color?param.color:0x22F5D9, overdraw: 0.5, shading: THREE.SmoothShading } ));
	cube.position.x = param.x;
	cube.position.y = param.y;
	cube.position.z = param.z;
	cube.name=param.name;
	return cube;
}

function createGlass(param){
	var segments = getSuitableSegments(2,param.width,param.length,param.height);
	var geometry = new THREE.BoxGeometry( param.width, param.length, param.height , segments.segmentsX, segments.segmentsY, segments.segmentsZ);
	var cube = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: 0xe8e8e8, overdraw: 0.5, transparent:true,opacity:0.3,shading: THREE.SmoothShading } ));
	cube.position.x = param.x;
	cube.position.y = param.y;
	cube.position.z = param.z;
	cube.name=param.name;
	return cube;
}

