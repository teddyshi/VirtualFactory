var Polisher = function(vf,name,position){
	this.virtualFactory =  vf;
	this.name = name;
	var baseGroup = new THREE.Object3D();
	baseGroup.name=name+'_base';
	if(position){
		baseGroup.position.copy(position);
	}
	baseGroup.add(createRootArcFront());
	baseGroup.add(createRootBase());
	baseGroup.add(createRootArcBehind());
	baseGroup.add(createSecondArcFront());
	baseGroup.add(createSecondBase());
	baseGroup.add(createSecondArcBehind());
	baseGroup.add(createThroneBase());
	baseGroup.add(createThroneBack());
	baseGroup.add(createLeftPillar());
	baseGroup.add(createLeftPillarHat());
	baseGroup.add(createMiddlePillar());
	baseGroup.add(createMiddlePillarHat());
	baseGroup.add(createRightPillar());
	baseGroup.add(createRightPillarHat());

	var hPillarGroup = new THREE.Object3D();
	hPillarGroup.name = 'hPillarGroup';
	this.horizontalPillarGroup = hPillarGroup;
	//build and add things to hPillarGroup
	this.horizontalPillarGroup.add(createHorizontalPillar());

	var machineTerminalGroup = new THREE.Object3D();
	machineTerminalGroup.name = 'machineTerminalGroup';
	machineTerminalGroup.position.z = -5;
	machineTerminalGroup.position.x = -23;
	machineTerminalGroup.position.y = -5;
	machineTerminalGroup.add(createPolisherToolJoint());
	machineTerminalGroup.add(createPolisherTerminal());

	this.horizontalPillarGroup.add(machineTerminalGroup);

	this.horizontalPillarGroup.position.z = 150;
	this.horizontalPillarGroup.position.y = 18;
	baseGroup.add(this.horizontalPillarGroup);
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
						loadedObject:null,
						footPrintTarget:{
							hPillarDown:-30,
							terminalMoveToRight:45,
							terminalMoveToLeft:-45,
							hPillarUp:30
						},
						footPrint:{
							hPillarDown:0,
							terminalMoveToRight:0,
							terminalMoveToLeft:0,
							hPillarUp:0
						}
					};

	controller.hasFinishedObjects = function(controller){
		var rs = false;
		if(controller.loadStatus==='empty'||controller.loadedObject===null){
			return rs;
		}	

		return controller.loadedObject.onPolisherStatus==='finished';
	};	

	controller.cooperationStart = function(controller,object){
		console.log('starting operation on:'+controller.machine.name+" with object:"+object.name);
		// controller.loadObject(controller,object);
		// //start polishing
		// controller.run({
		// 	cooperator:controller.machine.virtualFactory.robot2
		// });
	};

	controller.loadObject = function(controller,object){
		controller.machine.objects.put(object.name,object);	
		object.rotation.x=0;
		object.rotation.y=0;
		object.rotation.z=0;
		object.onRfidInstallerStatus='working';
		controller.loadStatus = 'loaded';
		controller.loadedObject = object;
	};
	controller.hPillarMove = function(controller,distance){
		var group = controller.machine.baseGroup.getObjectByName('hPillarGroup');
		group.translateZ(distance);
	};

	controller.terminalMove = function(controller,distance){
		var group = controller.machine.baseGroup.getObjectByName('machineTerminalGroup');
		group.translateX(distance);
	};

	controller.hPillarDown = function(controller,distance){
		controller.hPillarMove(controller,distance);
	};
	controller.hPillarUp = function(controller,distance){
		controller.hPillarMove(controller,distance);
	};
	controller.terminalMoveToRight = function(controller,distance){
		controller.terminalMove(controller,distance);
	};
	controller.terminalMoveToLeft = function(controller,distance){
		controller.terminalMove(controller,distance);
	};


	controller.moveAndFix = function(controller,keyProp,stepDistance,track){
		var targetValue = controller.footPrintTarget[keyProp];
		var currentValue = controller.footPrint[keyProp];
		var stepDistanceCalculator = {
			hPillarDown:function(stepDistance){
				return -stepDistance;
			},
			hPillarUp:function(stepDistance){
				return stepDistance;
			},
			terminalMoveToRight:function(stepDistance){
				return stepDistance;
			},
			terminalMoveToLeft:function(stepDistance){
				return -stepDistance;
			}
		};
		var realStepDistance = stepDistanceCalculator[keyProp].call(this,stepDistance);
		if(Math.abs(targetValue-currentValue)>=Math.abs(stepDistance)){
			rs = 1;
			controller[keyProp].call(this,controller,realStepDistance);
			controller.footPrint[keyProp] += realStepDistance;
		}else if(targetValue===currentValue){
			rs = 0;
		}else{
			controller[keyProp].call(this,controller,targetValue-currentValue);
			controller.footPrint[keyProp] += targetValue-currentValue;
			rs = 0;
		}
		track[keyProp]=rs;
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

	controller.polishingFinished = function(controller){
		var object = controller.machine.objects.get(controller.loadedObject.name);
		object.onPolisherStatus='finished';
		return object;
	};

	controller.polish = function(){
		this.status = 'running';
		var doActionArray = new Array();
	
		var machineKeyParams ={
			controller:this,
			machine:this.machine,
			virtualFactory:this.machine.virtualFactory,
			stepDistance: 10,
			track:{//1:keep rotating; 0:stop
				hPillarDown:1,
				terminalMoveToRight:1,
				terminalMoveToLeft:1,
				hPillarUp:1
			}
		};
		for(i in machineKeyParams.controller.footPrintTarget){	
			doActionArray.push(i);
		}
		machineKeyParams.doActionArray=doActionArray;
		machineKeyParams.currentKeyProp=doActionArray.shift();
		var move = function(machineKeyParams){
				if('stopped'===controller.status){
					setTimeout(move,50,machineKeyParams);
					return;
				}				
				machineKeyParams.controller.moveAndFix(
						machineKeyParams.controller,
						machineKeyParams.currentKeyProp,
						machineKeyParams.stepDistance,
						machineKeyParams.track
						);
				if(machineKeyParams.track[machineKeyParams.currentKeyProp]===0){
					if(machineKeyParams.doActionArray.length===0){
						//reset,preparing for running next time
						machineKeyParams.track = {
							hPillarDown:1,
							terminalMoveToRight:1,
							terminalMoveToLeft:1,
							hPillarUp:1
						};
						machineKeyParams.controller.footPrint={
							hPillarDown:0,
							terminalMoveToRight:0,
							terminalMoveToLeft:0,
							hPillarUp:0
						};
						machineKeyParams.controller.status='stopped';
						//set object status finished
						var finishedObject = machineKeyParams.controller.polishingFinished(machineKeyParams.controller);
						return;
					}
					machineKeyParams.currentKeyProp=machineKeyParams.doActionArray.shift();
				}
				setTimeout(move,50,machineKeyParams);			
		};
		move(machineKeyParams);
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
				param.controller.polish();
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

		var whenPolishingFinished = function(controller,sfc){
			if(sfc!==controller.loadedObject.name){
				console.warn(sfc+' does not match the object loaded('+controller.loadedObject.name+') on the machine!');
				return;
			}
			if(controller.status==='stopped'&&controller.loadedObject.onPolisherStatus==='finished'){
				var completeResult = controller.process['complete'].call(this,controller,sfc);
				if(!completeResult){
					console.warn('Failed to complete the operation');
					return;
				}
				controller.status='running';
				return;
			}
			setTimeout(whenPolishingFinished,100,controller,sfc);
		};

		whenPolishingFinished(controller,sfc);

	};

	
	controller.removeObject = function(key){
		this.machine.objects.remove(key);
		this.loadStatus='empty';
		this.loadedObject = null;
	};


	return controller;
}

function createRootBase(){
	var geometry = new THREE.BoxGeometry( 117.5, 121.8, 15 , 8, 8, 2);
	var cube = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: 0x22F5D9, overdraw: 0.1, shading: THREE.SmoothShading } ));
	cube.name = 'rootBase';
	cube.position.z = 8;
	return cube;
}

function createRootArcFront(){
	var geometry = new THREE.CylinderGeometry( 100, 100, 15, 16, 8,false,-Math.PI*0.2,Math.PI*0.4);
	var material = new THREE.MeshPhongMaterial( { color: 0x22F5D9, overdraw: 0.5, shading: THREE.SmoothShading } );
	var cylinder = new THREE.Mesh( geometry, material );
	cylinder.position.y = 20;
	cylinder.position.z = 8;
	cylinder.rotation.x = Math.PI*0.5;
	cylinder.name = 'rootArcFront';
	return cylinder;
}

function createRootArcBehind(){
	var geometry = new THREE.CylinderGeometry( 100, 100, 15, 16, 8,false,Math.PI*0.8,Math.PI*0.4);
	var material = new THREE.MeshPhongMaterial( { color: 0x22F5D9, overdraw: 0.5, shading: THREE.SmoothShading } );
	var cylinder = new THREE.Mesh( geometry, material );
	cylinder.position.y = -20;
	cylinder.position.z = 8;
	cylinder.rotation.x = Math.PI*0.5;
	cylinder.name = 'rootArcBehind';
	return cylinder;
}
function createSecondBase(){
	var geometry = new THREE.BoxGeometry( 112.4, 117.4, 60 , 16, 16, 4);
	var cube = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: 0x22F5D9, overdraw: 0.1, shading: THREE.SmoothShading } ));
	cube.position.z = 30;
	cube.name = 'secondBase';
	return cube;
}

function createSecondArcFront(){
	var geometry = new THREE.CylinderGeometry( 100, 100, 60, 16, 4,false,-Math.PI*0.2*0.95,Math.PI*0.4*0.95);
	var material = new THREE.MeshPhongMaterial( { color: 0x22F5D9, overdraw: 0.5, shading: THREE.SmoothShading } );
	var cylinder = new THREE.Mesh( geometry, material );
	cylinder.position.y = 24;
	cylinder.position.z = 30;
	cylinder.rotation.x = Math.PI*0.5;
	cylinder.name = 'secondArcFront';
	return cylinder;
}

function createSecondArcBehind(){
	var geometry = new THREE.CylinderGeometry( 100, 100, 60, 16, 4,false,-Math.PI*0.2*0.95+Math.PI,Math.PI*0.4*0.95);
	var material = new THREE.MeshPhongMaterial( { color: 0x22F5D9, overdraw: 0.5, shading: THREE.SmoothShading } );
	var cylinder = new THREE.Mesh( geometry, material );
	cylinder.position.y = -24;
	cylinder.position.z = 30;
	cylinder.rotation.x = Math.PI*0.5;
	cylinder.name = 'secondArcBehind';
	return cylinder;
}

function createThroneBase(){
	var geometry = new THREE.BoxGeometry( 60, 60, 20 , 8, 8, 4);
	var cube = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: 0x91A8A6, overdraw: 0.1, shading: THREE.SmoothShading } ));
	cube.name = 'throneBase';
	cube.position.z = 70;
	return cube;
}

function createThroneBack(){
	var geometry = new THREE.BoxGeometry( 60, 20, 120 , 16, 4, 16);
	var cube = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: 0x2381DE, overdraw: 0.1, shading: THREE.SmoothShading } ));
	cube.name = 'throneBack';
	cube.position.z = 110;
	cube.position.y = 30;
	return cube;
}

function createLeftPillar(){
	var geometry = new THREE.CylinderGeometry( 1, 1, 119, 8 );
	var material = new THREE.MeshPhongMaterial( { color: 0xE1E6E5, overdraw: 0.5, shading: THREE.SmoothShading } );
	var cylinder = new THREE.Mesh( geometry, material );
	cylinder.rotation.x = Math.PI*0.5;
	cylinder.position.z = 110;
	cylinder.position.y = 18;
	cylinder.position.x = -28;
	cylinder.name = 'leftPillar';
	return cylinder;
}

function createLeftPillarHat(){
	var geometry = new THREE.BoxGeometry( 5, 5, 2 , 4, 2, 4);
	var material = new THREE.MeshPhongMaterial( { color: 0x2381DE, overdraw: 0.5, shading: THREE.SmoothShading } );
	var cube = new THREE.Mesh( geometry, material );
	cube.position.z = 169;
	cube.position.y = 18;
	cube.position.x = -27.5;
	return cube;
}

function createMiddlePillar(){
	var geometry = new THREE.CylinderGeometry( 1, 1, 120, 8 );
	var material = new THREE.MeshPhongMaterial( { color: 0xE1E6E5, overdraw: 0.5, shading: THREE.SmoothShading } );
	var cylinder = new THREE.Mesh( geometry, material );
	cylinder.rotation.x = Math.PI*0.5;
	cylinder.position.z = 110;
	cylinder.position.y = 18;
	cylinder.position.x = 0;
	cylinder.name = 'middlePillar';
	return cylinder;
}

function createMiddlePillarHat(){
	var geometry = new THREE.BoxGeometry( 5, 25, 3 , 4, 8, 4);
	var material = new THREE.MeshPhongMaterial( { color: 0x2381DE, overdraw: 0.5, shading: THREE.SmoothShading } );
	var cube = new THREE.Mesh( geometry, material );
	cube.position.z = 171;
	cube.position.y = 25;
	cube.position.x = 0;
	return cube;
}


function createRightPillar(){
	var geometry = new THREE.CylinderGeometry( 1, 1, 119, 8 );
	var material = new THREE.MeshPhongMaterial( { color: 0xE1E6E5, overdraw: 0.5, shading: THREE.SmoothShading } );
	var cylinder = new THREE.Mesh( geometry, material );
	cylinder.rotation.x = Math.PI*0.5;
	cylinder.position.z = 110;
	cylinder.position.y = 18;
	cylinder.position.x = 28;
	cylinder.name = 'rightPillar';
	return cylinder;
}

function createRightPillarHat(){
	var geometry = new THREE.BoxGeometry( 5, 5, 2 , 4, 2, 4);
	var material = new THREE.MeshPhongMaterial( { color: 0x2381DE, overdraw: 0.5, shading: THREE.SmoothShading } );
	var cube = new THREE.Mesh( geometry, material );
	cube.position.z = 169;
	cube.position.y = 18;
	cube.position.x = 27.5;
	return cube;
}


function createHorizontalPillar(){
	var geometry = new THREE.BoxGeometry( 58, 5, 20 , 16, 4, 16);
	var material = new THREE.MeshPhongMaterial( { color: 0xBAC2C1, overdraw: 0.5, shading: THREE.SmoothShading } );
	var cube = new THREE.Mesh( geometry, material );
	return cube;
}

function createPolisherToolJoint(){
	var geometry = new THREE.BoxGeometry( 12, 5, 15 , 16, 4, 16);
	var material = new THREE.MeshPhongMaterial( { color: 0x2E857B, overdraw: 0.5, shading: THREE.SmoothShading } );
	var cube = new THREE.Mesh( geometry, material );
	return cube;
}

function createPolisherTerminal(){
	var geometry = new THREE.CylinderGeometry( 7, 7, 15, 16 );
	var material = new THREE.MeshPhongMaterial( { color: 0x5C706E, overdraw: 0.5, shading: THREE.SmoothShading } );
	var cylinder = new THREE.Mesh( geometry, material );
	cylinder.rotation.x = Math.PI*0.5;
	cylinder.position.y = -10;
	return cylinder;
}

