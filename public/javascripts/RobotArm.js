var RobotArm = function(vf,name,position){	
	this.virtualFactory =  vf;
	this.name = name;
	this.base = createBase();
	this.rootJoint = createRootJoint();
	this.firstTrunk = createFirstTrunk();
	this.secondJoint = createSecondJoint();
	this.secondTrunk = createSecondTrunk();
	this.thirdJoint = createThirdJoint();
	this.sucker = createSucker();

	//install arm
	var baseGroup = new THREE.Object3D();
	if(position){
		baseGroup.position.copy(position);
	}
	
	baseGroup.name='base_C';
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
	secondJoint_N.position.z=155;
	var thirdJoint_N = new THREE.Object3D();
	thirdJoint_N.name='thirdJoint_N';
	thirdJoint_N.position.x=150;
	thirdJoint_N.add(this.sucker);
	secondJoint_N.add(thirdJoint_N);
	rootJoint_N.add(secondJoint_N);
	baseGroup.add(rootJoint_C);
	this.robotArm = baseGroup;
	this.controller = buildController(this);
	return this;
};


//how to call runModeOne:
		// VF.robot1.controller.runModeOne({
		// 	startInTime:800,
		// 	cooperator:{
		// 	 	conveyor:VF.conveyor
		// 	},
		// 	doReleaseSignal:function(controller,cooperator){
		// 		controller.catchOnConveyor(controller,cooperator);
		// 		return 'catched'===controller.suckerStatus;
		// 	},
		// 	doReCatchSignal:function(controller,cooperator){
		//		controller.releaseToPackage(controller,cooperator);
		// 		return 'empty'===controller.suckerStatus;
		// 	},
		// 	stopCallBack:function(controller,cooperator){
		// 		console.log('stop..');
		// 	}
		// 	resumeCallBack:function(controller,cooperator){
		// 		console.log('resume..');
		// 	}
		// });

function buildController(arm){
	var controller={
					arm:arm,
					status:'run',
					suckerStatus:'empty',
					stopSignal:false,
					resumeSignal:false,
					cycleFootPrint:{
							rootJointRotateByYaxis:0,
							secondJointRotateByYaxis:0,
							rootJointRotateByZaxis:0,
							thirdJointRotateByYaxis:0
						},
					cycleFootPrintTarget:{
							rootJointRotateByYaxis: -0.706858347057704, 
							secondJointRotateByYaxis: 1.1309733552923253, 
							rootJointRotateByZaxis: -1.413716694115408, 
							thirdJointRotateByYaxis: -0.42411500823462245
						},
					lastRotateResult:''
					};
	controller.catch = function(){
		this.suckerStatus = 'catched';
	};
	controller.release = function(){
		this.suckerStatus = 'empty';
	};
	controller.stop = function(){
		this.status = 'stopped';
		this.stopSignal = true;
	};
	controller.resume = function(){
		this.status = 'run';
		this.resumeSignal = true;
	};
	controller.rootJointRotateByZaxis = function(controller,angle){
		var rootJoint_C = controller.arm.robotArm.getObjectByName('rootJoint_C');
		rootJoint_C.rotateOnAxis(new THREE.Vector3(0,0,1).normalize(),angle);
	};
	controller.rootJointRotateByXaxis = function(controller,angle){
		var rootJoint_C = controller.arm.robotArm.getObjectByName('rootJoint_N');
		rootJoint_C.rotateOnAxis(new THREE.Vector3(1,0,0).normalize(),angle);
	};
	controller.rootJointRotateByYaxis = function(controller,angle){
		var rootJoint_C = controller.arm.robotArm.getObjectByName('rootJoint_N');
		rootJoint_C.rotateOnAxis(new THREE.Vector3(0,1,0).normalize(),angle);
	};
	controller.secondJointRotateByYaxis = function(controller,angle){
		var rootJoint_C = controller.arm.robotArm.getObjectByName('secondJoint_N');
		rootJoint_C.rotateOnAxis(new THREE.Vector3(0,1,0).normalize(),angle);
	};
	controller.secondJointRotateByXaxis = function(controller,angle){
		var rootJoint_C = controller.arm.robotArm.getObjectByName('secondJoint_N');
		rootJoint_C.rotateOnAxis(new THREE.Vector3(1,0,0).normalize(),angle);
	};
	controller.thirdJointRotateByYaxis = function(controller,angle){
		var rootJoint_C = controller.arm.robotArm.getObjectByName('thirdJoint_N');
		rootJoint_C.rotateOnAxis(new THREE.Vector3(0,1,0).normalize(),angle);
	};
	controller.thirdJointRotateByXaxis = function(controller,angle){
		var rootJoint_C = controller.arm.robotArm.getObjectByName('thirdJoint_N');
		rootJoint_C.rotateOnAxis(new THREE.Vector3(1,0,0).normalize(),angle);
	};
	controller.rotateAndFix = function(controller,keyProp,angle,action,result){
		//1:keep rotating; 0:stop
		var rs;
		var targetValue = ('doRelease'===action?controller.cycleFootPrintTarget[keyProp]:0);
		var currentValue = controller.cycleFootPrint[keyProp];
		if(Math.abs(targetValue-currentValue)>=Math.abs(angle)){
			rs = 1;
			controller[keyProp].call(this,controller,angle);
			controller.cycleFootPrint[keyProp] += angle;
		}else if(targetValue===currentValue){
			rs = 0;
		}else{
			controller[keyProp].call(this,controller,targetValue-currentValue);
			controller.cycleFootPrint[keyProp] += targetValue-currentValue;
			rs = 0;
		}
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
			controller.rotateAndFix.call(this,controller,i,moveParams[i],action,result)
		}
		var keepRotating = 0;
		for(prop in result){
			keepRotating |= result[prop];
		}
		controller.lastRotateResult=(1===keepRotating?'KEEP_ROTATE':'STOP');
	};

	controller.catchOnConveyor = function(controller,cooperator){
		var sucker = controller.arm.robotArm.getObjectByName('sucker');
		var thirdJoint_N = controller.arm.robotArm.getObjectByName('thirdJoint_N');
		var catchParams = {
			sucker:sucker,
			suckerHolder:thirdJoint_N,
			controller:controller,
			conveyor:cooperator.conveyor,
			scene:controller.arm.virtualFactory.scene
		};

		var doCatch = function(catchParams){
			var conveyor = catchParams.conveyor;
			var stoppedObjectXLengthSum = conveyor.controller.getStoppedObjectXLengthSum(conveyor.controller);	
			if(conveyor.objects.isEmpty()||stoppedObjectXLengthSum<=0){
				return;
			}
			var suckerHolder = catchParams.suckerHolder;
			var sucker = catchParams.sucker;
			var scene = catchParams.scene;
			suckerHolder.updateMatrixWorld();
			THREE.SceneUtils.detach(sucker,suckerHolder,scene);
			var rayCaster = new THREE.Raycaster( sucker.position, new THREE.Vector3(0,0,-1).normalize(), 0, 100 );
			var intersection = rayCaster.intersectObjects(conveyor.objects.values(),false);
			if(intersection.length==0){
				suckerHolder.updateMatrixWorld();
				THREE.SceneUtils.attach(sucker, scene, suckerHolder);
				return;
			}
			var catchedObject = intersection[0].object;
			suckerHolder.updateMatrixWorld();
			THREE.SceneUtils.attach(sucker, scene, suckerHolder);
			THREE.SceneUtils.attach(catchedObject, scene, suckerHolder);
			catchParams.controller.catchedObjectName = catchedObject.name;
			conveyor.objects.remove(catchedObject.name);			
			catchParams.controller.catch();
		};
		doCatch(catchParams);
	};

	controller.releaseToPackage = function(controller,cooperator){
		if('catched'!==controller.suckerStatus||''===controller.catchedObjectName){
			return;
		}
		var virtualFactory = controller.arm.virtualFactory;
		var sucker = controller.arm.robotArm.getObjectByName('sucker');
		var suckerHolder = controller.arm.robotArm.getObjectByName('thirdJoint_N');
		var catchedObject = suckerHolder.getObjectByName(controller.catchedObjectName);
		suckerHolder.updateMatrixWorld();
		THREE.SceneUtils.detach(catchedObject,suckerHolder,virtualFactory.scene);
		var sinkParam = {
			object:catchedObject,
			virtualFactory:virtualFactory,
			disappearZ:0
		}
		var sink = function(sinkParam){
			sinkParam.object.position.z -= 5;
			sinkParam.virtualFactory.render();
			if(sinkParam.object.position.z>=sinkParam.disappearZ){
				setTimeout(sink,30,sinkParam);
			}else{
				sinkParam.virtualFactory.scene.remove(sinkParam.object);
				sinkParam.virtualFactory.render();
			}
		};
		sink(sinkParam);
		controller.catchedObjectName = '';
		controller.release();
	};

	//mode one is the default mode for this robot arm
	//Normally it can finish the process 'catch - release - recatch' along a fixed footprint
	controller.runModeOne = function(process){
		var doCatch = {
			doAction:function(controller){
				controller.rootJointRotateByYaxis(controller,Math.PI*0.006);
				controller.secondJointRotateByYaxis(controller,-Math.PI*0.004);
				controller.thirdJointRotateByYaxis(controller,-Math.PI*0.0025);
			},
			name:'doCatch'
		}

		var doRelease = {
			doAction:function(controller){
				controller.doAction.call(
						this,
						controller,
						{
							rootJointRotateByYaxis:-Math.PI*0.005,
							secondJointRotateByYaxis:Math.PI*0.008,
							rootJointRotateByZaxis:-Math.PI*0.01,
							thirdJointRotateByYaxis:-Math.PI*0.003
						},
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
							rootJointRotateByYaxis:Math.PI*0.005,
							secondJointRotateByYaxis:-Math.PI*0.008,
							rootJointRotateByZaxis:Math.PI*0.01,
							thirdJointRotateByYaxis:Math.PI*0.003
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
				if((new Date().getTime() - params.startTime)<params.process.startInTime){
					params.doFunction.doAction.call(this,controller);
					controller.arm.virtualFactory.render();
					setTimeout(move,20,params);
				}else{
					controller.lastRotateResult='STOP';
					if(signalMethod.call(this,controller,params.process.cooperator)){
						params.doFunction = nextFunction;
						controller.lastRotateResult='KEEP_ROTATE';
					}				
					setTimeout(move,20,params);
				}
			}else{
				if('stopped'===controller.status){
					if(params.process.stopCallBack&&true===controller.stopSignal){
						params.process.stopCallBack.call(this,controller,params.process.cooperator);
						controller.stopSignal = false;
					}
					setTimeout(move,20,params);
					return;
				}
				if(params.process.resumeCallBack&&true===controller.resumeSignal){
					params.process.resumeCallBack.call(this,controller,params.process.cooperator);
					controller.resumeSignal = false;
				}
				if('KEEP_ROTATE'=== controller.lastRotateResult){
					params.doFunction.doAction.call(this,controller);
					controller.arm.virtualFactory.render();
					setTimeout(move,20,params);
				}else{
						if('doRelease'== params.doFunction.name){
							signalMethod = params.process.doReCatchSignal;
							nextFunction = params.doReCatch;
						}else if('doReCatch'==params.doFunction.name){
							signalMethod = params.process.doReleaseSignal;
							nextFunction = params.doRelease;
						}
					if(signalMethod.call(this,controller,params.process.cooperator)){
						params.doFunction = nextFunction;
						controller.lastRotateResult='KEEP_ROTATE';
					}
					setTimeout(move,20,params);
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
	}

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
	var xLength = 20;
	var yLength = 20;
	var zLength = 40;
	var geometry = new THREE.CylinderGeometry( xLength, yLength, zLength, 32 );
	var material = new THREE.MeshPhongMaterial( { color: 0x4285F4, overdraw: 0.5, shading: THREE.SmoothShading } );
	var cylinder = new THREE.Mesh( geometry, material );
	cylinder.scale.x = 1.3;
	cylinder.name = 'firstJoint';
	return cylinder;
};

function createFirstTrunk(){
	var xLength = 25;
	var yLength = 25;
	var zLength = 150;
	var geometry = new THREE.BoxGeometry( xLength, yLength, zLength , 16, 16, 64);
	var material = new THREE.MeshPhongMaterial( { color: 0xFE6502, overdraw: 0.5, shading: THREE.SmoothShading } );
	var cube = new THREE.Mesh( geometry, material );
	cube.position.z = zLength/2;
	cube.name='firstTrunk';
	return cube;
};

function createSecondJoint(){
	var geometry = new THREE.CylinderGeometry( 20, 20, 40, 32 );
	var material = new THREE.MeshPhongMaterial( { color: 0x4285F4, overdraw: 0.5, shading: THREE.SmoothShading } );
	var cylinder = new THREE.Mesh( geometry, material );
	cylinder.position.z=155;
	cylinder.name='secondJoint';
	return cylinder;
};

function createSecondTrunk(){
	var xLength = 150;
	var yLength = 25;
	var zLength = 25;
	var geometry = new THREE.BoxGeometry( xLength, yLength, zLength , 64, 16, 16);
	var material = new THREE.MeshPhongMaterial( { color: 0xFE6502, overdraw: 0.5, shading: THREE.SmoothShading } );
	var cube = new THREE.Mesh( geometry, material );
	cube.position.x=75;
	cube.name='secondTrunk';
	return cube;
};

function createThirdJoint(){
	var geometry = new THREE.SphereGeometry(20, 32, 32, 0, Math.PI*2, 0, Math.PI)
	var material = new THREE.MeshPhongMaterial( { color: 0x4285F4, overdraw: 0.5, shading: THREE.SmoothShading } );
	var cylinder = new THREE.Mesh( geometry, material );
	cylinder.name='thirdJoint';
	cylinder.position.x = 150;
	return cylinder;
};

function createSucker(){
	var geometry = new THREE.CylinderGeometry( 5, 5, 40, 64 );
	var material = new THREE.MeshPhongMaterial( { color: 0xFE6502, overdraw: 0.5, shading: THREE.SmoothShading } );
	var cylinder = new THREE.Mesh( geometry, material );
	cylinder.name='sucker';
	cylinder.rotation.x = Math.PI*0.5;
	cylinder.position.z = -20;
	return cylinder;
};