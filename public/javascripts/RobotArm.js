var RobotArm = function(vf,name,position,machineParam){	
	this.virtualFactory =  vf;
	this.name = name;
	this.base = createBase();
	this.rootJoint = createRootJoint();
	this.firstTrunk = createFirstTrunk();
	this.secondJoint = createSecondJoint();
	this.secondTrunk = createSecondTrunk();
	this.thirdJoint = createThirdJoint();
	this.sucker = createSucker();

	//install machine
	var baseGroup = new THREE.Object3D();
	if(position){
		baseGroup.position.copy(position);
	}	
	baseGroup.name=name+'_base';
	baseGroup.add(this.base);
	var rootJoint_C = new THREE.Object3D();
	rootJoint_C.position.z = 15;
	rootJoint_C.name = 'rootJoint_C';
	rootJoint_C.add(this.rootJoint);
	var rootJoint_N = new THREE.Object3D();
	rootJoint_N.name = 'rootJoint_N';
	rootJoint_N.add(this.firstTrunk);
	rootJoint_N.add(this.secondJoint);
	rootJoint_C.add(rootJoint_N);
	var secondJoint_N = new THREE.Object3D();
	secondJoint_N.name = 'secondJoint_N';
	secondJoint_N.add(this.secondTrunk);
	secondJoint_N.add(this.thirdJoint);
	secondJoint_N.position.z=105;
	var thirdJoint_N = new THREE.Object3D();
	thirdJoint_N.name='thirdJoint_N';
	thirdJoint_N.position.x=100;
	thirdJoint_N.add(this.sucker);
	secondJoint_N.add(thirdJoint_N);
	rootJoint_N.add(secondJoint_N);
	baseGroup.add(rootJoint_C);
	this.robotArm = baseGroup;
	this.machineParam = machineParam;
	this.objects = new HashMap();
	this.queue = new HashMap();
	this.controller = buildController(this);
	return this;
};


function buildController(machine){
	var controller={
					machine:machine,
					status:'stopped',
					loadStatus:'empty',
					stopSignal:false,
					resumeSignal:false,
					startFootPrint:{
							rootJointRotateByYaxis:0,
							secondJointRotateByYaxis:0,
							rootJointRotateByZaxis:0,
							thirdJointRotateByYaxis:0						
					},
					startFootPrintTarget:machine.machineParam.startFootPrintTarget,					
					cycleFootPrint:{
							rootJointRotateByYaxis:0,
							secondJointRotateByYaxis:0,
							rootJointRotateByZaxis:0,
							thirdJointRotateByYaxis:0
						},
					cycleFootPrintTarget:machine.machineParam.cycleFootPrintTarget,
					lastRotateResult:''
					};

	controller.loadObject = function(controller,object){
		controller.machine.objects.put(object.name,object);
		object.onRobotArmStatus='working';
		controller.loadStatus = 'loaded';
		controller.loadedObject = object;
	};

	controller.release = function(){
		this.loadStatus = 'empty';
		this.loadedObject.onRobotArmStatus='stopped';	
		this.machine.objects.remove(this.loadedObject.name);
		this.loadedObject = null;
	};

	controller.stop = function(){
		this.status = 'stopped';
		this.stopSignal = true;
	};

	controller.resume = function(){
		this.status = 'run';
		this.resumeSignal = true;
	};

	controller.start = function(object){
		//put sfc to the queue
		this.machine.queue.put(object.name,object);		
	};

	controller.rootJointRotateByZaxis = function(controller,angle){
		var rootJoint_C = controller.machine.robotArm.getObjectByName('rootJoint_C');
		rootJoint_C.rotateOnAxis(new THREE.Vector3(0,0,1).normalize(),angle);
	};
	controller.rootJointRotateByXaxis = function(controller,angle){
		var rootJoint_C = controller.machine.robotArm.getObjectByName('rootJoint_N');
		rootJoint_C.rotateOnAxis(new THREE.Vector3(1,0,0).normalize(),angle);
	};
	controller.rootJointRotateByYaxis = function(controller,angle){
		var rootJoint_C = controller.machine.robotArm.getObjectByName('rootJoint_N');
		rootJoint_C.rotateOnAxis(new THREE.Vector3(0,1,0).normalize(),angle);
	};
	controller.secondJointRotateByYaxis = function(controller,angle){
		var rootJoint_C = controller.machine.robotArm.getObjectByName('secondJoint_N');
		rootJoint_C.rotateOnAxis(new THREE.Vector3(0,1,0).normalize(),angle);
	};
	controller.secondJointRotateByXaxis = function(controller,angle){
		var rootJoint_C = controller.machine.robotArm.getObjectByName('secondJoint_N');
		rootJoint_C.rotateOnAxis(new THREE.Vector3(1,0,0).normalize(),angle);
	};
	controller.thirdJointRotateByYaxis = function(controller,angle){
		var rootJoint_C = controller.machine.robotArm.getObjectByName('thirdJoint_N');
		rootJoint_C.rotateOnAxis(new THREE.Vector3(0,1,0).normalize(),angle);
	};
	controller.thirdJointRotateByXaxis = function(controller,angle){
		var rootJoint_C = controller.machine.robotArm.getObjectByName('thirdJoint_N');
		rootJoint_C.rotateOnAxis(new THREE.Vector3(1,0,0).normalize(),angle);
	};

	controller.cooperationStart = function(controller,object){
		console.log('starting operation on:'+controller.machine.name+" with object:"+object.name);

	};



	controller.rotateAndFix = function(controller,keyProp,angle,action,result){
		var rs;
		var targetValue = 0;
		var calculationDefinition = {
			targetValue:0,
			currentValue:0,
			footPrintReference:null
		};
		var calculationGenerator = {
			doCatch:function(controller,keyProp,calculationDefinition){
				var ref = 'startFootPrint';
				calculationDefinition.targetValue = controller[ref+'Target'][keyProp];
				calculationDefinition.currentValue = controller[ref][keyProp];
				calculationDefinition.footPrintReference = ref;
				return calculationDefinition;
			},
			doRelease:function(controller,keyProp,calculationDefinition){
				var ref = 'cycleFootPrint';
				calculationDefinition.targetValue = controller[ref+'Target'][keyProp];
				calculationDefinition.currentValue = controller[ref][keyProp];
				calculationDefinition.footPrintReference = ref;
				return calculationDefinition;
			},
			doReCatch:function(controller,keyProp,calculationDefinition){
				var ref = 'cycleFootPrint';
				calculationDefinition.targetValue = 0;
				calculationDefinition.currentValue = controller[ref][keyProp];
				calculationDefinition.footPrintReference = ref;
				return calculationDefinition;
			}
		};

		var calculation = calculationGenerator[action].call(this,controller,keyProp,calculationDefinition);
		var targetValue = calculation.targetValue;
		var currentValue = calculation.currentValue;
		if(Math.abs(targetValue-currentValue)>=Math.abs(angle)){
			rs = 1;
			controller[keyProp].call(this,controller,angle);
			controller[calculation.footPrintReference][keyProp] += angle;
		}else if(targetValue===currentValue){
			rs = 0;
		}else{
			controller[keyProp].call(this,controller,targetValue-currentValue);
			controller[calculation.footPrintReference][keyProp] += targetValue-currentValue;
			rs = 0;
		}
		//1:keep rotating; 0:stop
		result[keyProp] = rs;
	};

	controller.doAction= function(controller,moveParams,action){
		var result = {
			rootJointRotateByYaxis:'',
			secondJointRotateByYaxis:'',
			rootJointRotateByZaxis:'',
			thirdJointRotateByYaxis:''
		};
		for( i in moveParams){
			controller.rotateAndFix.call(this,controller,i,moveParams[i],action,result);
		}
		var keepRotating = 0;
		for(prop in result){
			keepRotating |= result[prop];
		}
		controller.lastRotateResult=(1===keepRotating?'KEEP_ROTATE':'STOP');
	};

	controller.catchOnCooperator = function(controller){
		var sucker = controller.machine.robotArm.getObjectByName('sucker');
		var thirdJoint_N = controller.machine.robotArm.getObjectByName('thirdJoint_N');
		var catchParams = {
			sucker:sucker,
			suckerHolder:thirdJoint_N,
			controller:controller,
			previousCooperator:controller.process.previousCooperator,
			scene:controller.machine.virtualFactory.scene
		};

		var doCatch = function(catchParams){
			var previousCooperator = controller.process.previousCooperator;
			var suckerHolder = catchParams.suckerHolder;
			var sucker = catchParams.sucker;
			var scene = catchParams.scene;
			suckerHolder.updateMatrixWorld();
			THREE.SceneUtils.detach(sucker,suckerHolder,scene);
			var rayCaster = new THREE.Raycaster( sucker.position, new THREE.Vector3(0,0,-1).normalize(), 0, 100 );
			var intersection = rayCaster.intersectObjects(previousCooperator.objects.values(),true);
			if(intersection.length==0){
				suckerHolder.updateMatrixWorld();
				THREE.SceneUtils.attach(sucker, scene, suckerHolder);
				return false;
			}
			//loadedObject's parent is an instance of THEE.Object3D,so just pick up the parent.
			var loadedObject = intersection[0].object.parent;
			suckerHolder.updateMatrixWorld();
			THREE.SceneUtils.attach(sucker, scene, suckerHolder);
			THREE.SceneUtils.attach(loadedObject, scene, suckerHolder);
			catchParams.controller.machine.queue.remove(loadedObject.name);
			catchParams.controller.loadObject(catchParams.controller,loadedObject);
			//remove loaedObject from previous cooperator
			previousCooperator.controller.removeObject(loadedObject.name);
			return true;
		};
		return doCatch(catchParams);
	};

	controller.releaseToSpace = function(controller){
		if('loaded'!==controller.loadStatus||null===controller.loadedObject){
			return false;
		}
		var virtualFactory = controller.machine.virtualFactory;
		var sucker = controller.machine.robotArm.getObjectByName('sucker');
		var suckerHolder = controller.machine.robotArm.getObjectByName('thirdJoint_N');
		var loadedObject = controller.loadedObject;
		suckerHolder.updateMatrixWorld();
		THREE.SceneUtils.detach(loadedObject,suckerHolder,virtualFactory.scene);
		controller.complete(controller.loadedObject.name);
		controller.release();
		return true;
	};

	//mode one is the default mode for this robot machine
	//Normally it can finish the process 'catch - release - recatch' along a fixed footprint
	controller.armWorkingStart = function(){
		if(controller.armStartCounts===1){
			return;
		}
		var process = this.process;
		var doCatch = {
			doAction:function(controller){
				controller.doAction.call(
						this,
						controller,
						controller.machine.machineParam.startMove,
						doCatch.name
				);
			},
			name:'doCatch'
		}

		var cycleMove = controller.machine.machineParam.cycleMove;
		var doRelease = {
			doAction:function(controller){
				controller.doAction.call(
						this,
						controller,
						cycleMove,
						doRelease.name
				);
			},
			name :'doRelease'
		}

		var doReCatch = {
			doAction:function(controller){
				controller.doAction.call(
						this,
						controller,
						{
							rootJointRotateByYaxis:-cycleMove.rootJointRotateByYaxis,
							secondJointRotateByYaxis:-cycleMove.secondJointRotateByYaxis,
							rootJointRotateByZaxis:-cycleMove.rootJointRotateByZaxis,
							thirdJointRotateByYaxis:-cycleMove.thirdJointRotateByYaxis
						},
						doReCatch.name
				);
			},
			name : 'doReCatch'
		}

		var move = function(params){
			var controller = params.controller;
			var nextFunction = '';
			//signal method is a judgement which decides whether go to the next action.
			var signalMethod = '';
			if('doCatch'==params.doFunction.name){
				signalMethod = params.process.doReleaseSignal;
				nextFunction = params.doRelease;
				params.doFunction.doAction.call(this,controller);
				if('KEEP_ROTATE'=== controller.lastRotateResult){
					params.doFunction.doAction.call(this,controller);
					setTimeout(move,30,params);
				}else{
					controller.lastRotateResult='STOP';
					if(signalMethod.call(this,controller)){
						params.doFunction = nextFunction;
						controller.lastRotateResult='KEEP_ROTATE';
					}				
					setTimeout(move,30,params);					
				}				
			}else{
				if('stopped'===controller.status){
					if(params.process.stopCallBack&&true===controller.stopSignal){
						params.process.stopCallBack.call(this,controller);
						controller.stopSignal = false;
					}
					setTimeout(move,100,params);
					return;
				}
				if(params.process.resumeCallBack&&true===controller.resumeSignal){
					params.process.resumeCallBack.call(this,controller);
					controller.resumeSignal = false;
				}
				if('KEEP_ROTATE'=== controller.lastRotateResult){
					params.doFunction.doAction.call(this,controller);
					setTimeout(move,30,params);
				}else{
					var cooperator = null;
					if('doRelease'== params.doFunction.name){
						signalMethod = params.process.doReCatchSignal;
						nextFunction = params.doReCatch;
					}else if('doReCatch'==params.doFunction.name){
						signalMethod = params.process.doReleaseSignal;
						nextFunction = params.doRelease;
					}
					if(signalMethod.call(this,controller)){
						params.doFunction = nextFunction;
						controller.lastRotateResult='KEEP_ROTATE';
					}
					setTimeout(move,30,params);
				}
			}
		};

		move({
				controller:this,
				startTime:new Date().getTime(),
				process:process,
				doCatch:doCatch,
				doReCatch:doReCatch,
				doRelease:doRelease,
				doFunction:doCatch
			});
		controller.armStartCounts = 1;
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
			console.warn('Failed to complete the operation');
			return;
		}
	};

	return controller;
};


function createBase(){
	var geometry = new THREE.CylinderGeometry( 50, 50, 15, 64 );
	var material = new THREE.MeshPhongMaterial( { color: 0x4285F4, overdraw: 0.5, shading: THREE.SmoothShading } );
	var cylinder = new THREE.Mesh( geometry, material );
	cylinder.rotation.x = Math.PI*0.5;
	cylinder.name = 'base';
	return cylinder;
};

function createRootJoint(){
	var xLength = 15;
	var yLength = 15;
	var zLength = 30;
	var geometry = new THREE.CylinderGeometry( xLength, yLength, zLength, 32 );
	var material = new THREE.MeshPhongMaterial( { color: 0x4285F4, overdraw: 0.5, shading: THREE.SmoothShading } );
	var cylinder = new THREE.Mesh( geometry, material );
	cylinder.scale.x = 1.3;
	cylinder.name = 'firstJoint';
	return cylinder;
};

function createFirstTrunk(){
	var xLength = 20;
	var yLength = 20;
	var zLength = 100;
	var geometry = new THREE.BoxGeometry( xLength, yLength, zLength , 16, 16, 64);
	var material = new THREE.MeshPhongMaterial( { color: 0xFE6502, overdraw: 0.5, shading: THREE.SmoothShading } );
	var cube = new THREE.Mesh( geometry, material );
	cube.position.z = zLength/2;
	cube.name='firstTrunk';
	return cube;
};

function createSecondJoint(){
	var geometry = new THREE.CylinderGeometry( 15, 15, 30, 32 );
	var material = new THREE.MeshPhongMaterial( { color: 0x4285F4, overdraw: 0.5, shading: THREE.SmoothShading } );
	var cylinder = new THREE.Mesh( geometry, material );
	cylinder.position.z=105;
	cylinder.name='secondJoint';
	return cylinder;
};

function createSecondTrunk(){
	var xLength = 100;
	var yLength = 20;
	var zLength = 20;
	var geometry = new THREE.BoxGeometry( xLength, yLength, zLength , 64, 16, 16);
	var material = new THREE.MeshPhongMaterial( { color: 0xFE6502, overdraw: 0.5, shading: THREE.SmoothShading } );
	var cube = new THREE.Mesh( geometry, material );
	cube.position.x=50;
	cube.name='secondTrunk';
	return cube;
};

function createThirdJoint(){
	var geometry = new THREE.SphereGeometry(15, 32, 32, 0, Math.PI*2, 0, Math.PI)
	var material = new THREE.MeshPhongMaterial( { color: 0x4285F4, overdraw: 0.5, shading: THREE.SmoothShading } );
	var cylinder = new THREE.Mesh( geometry, material );
	cylinder.name='thirdJoint';
	cylinder.position.x = 100;
	return cylinder;
};

function createSucker(){
	var geometry = new THREE.CylinderGeometry( 5, 5, 25, 64 );
	var material = new THREE.MeshPhongMaterial( { color: 0xFE6502, overdraw: 0.5, shading: THREE.SmoothShading } );
	var cylinder = new THREE.Mesh( geometry, material );
	cylinder.name='sucker';
	cylinder.rotation.x = Math.PI*0.5;
	cylinder.position.z = -15;
	return cylinder;
};