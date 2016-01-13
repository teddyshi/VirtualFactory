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
	rootJoint_C.position.z = 20;
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
		// 	catchDuration:800,
		// 	reCatchDuration:1000,
		// 	releaseDuration:1000,
		// 	doReleaseSignal:function(controller){
		// 		return 'catched'===controller.suckerStatus;
		// 	},
		// 	doReCatchSignal:function(controller){
		// 		return 'empty'===controller.suckerStatus;
		// 	},
		// 	stopCallBack:function(controller){
		// 		console.log('stopped...');
		// 	}
		// });
//after doing that you will see the arm stopps after a short time moving.
//then try to do this:
//VF.robot1.controller.catch();
//Then the arm will keep moving for a short time and will stop again,
//Then try to do this:
//VF.robot1.controller.release();
//See the arm will try to catch a object again.
//You will see,this mode is designed based on a event-driving mechanism
//It provides the chance of process controlling to you as input parameters.

function buildController(arm){
	var controller={
					arm:arm,
					stop:false,
					status:'run',
					suckerStatus:'empty'
					};
	controller.catch = function(){
		this.suckerStatus = 'catched';
	};
	controller.release = function(){
		this.suckerStatus = 'empty';
	};
	controller.stop = function(){
		this.stop = true;
	};
	controller.rootJointRotateByZaxis = function(angle){
		var rootJoint_C = this.arm.robotArm.getObjectByName('rootJoint_C');
		rootJoint_C.rotateOnAxis(new THREE.Vector3(0,0,1).normalize(),angle);
	};
	controller.rootJointRotateByXaxis = function(angle){
		var rootJoint_C = this.arm.robotArm.getObjectByName('rootJoint_N');
		rootJoint_C.rotateOnAxis(new THREE.Vector3(1,0,0).normalize(),angle);
	};
	controller.rootJointRotateByYaxis = function(angle){
		var rootJoint_C = this.arm.robotArm.getObjectByName('rootJoint_N');
		rootJoint_C.rotateOnAxis(new THREE.Vector3(0,1,0).normalize(),angle);
	};
	controller.secondJointRotateByYaxis = function(angle){
		var rootJoint_C = this.arm.robotArm.getObjectByName('secondJoint_N');
		rootJoint_C.rotateOnAxis(new THREE.Vector3(0,1,0).normalize(),angle);
	};
	controller.secondJointRotateByXaxis = function(angle){
		var rootJoint_C = this.arm.robotArm.getObjectByName('secondJoint_N');
		rootJoint_C.rotateOnAxis(new THREE.Vector3(1,0,0).normalize(),angle);
	};
	controller.thirdJointRotateByYaxis = function(angle){
		var rootJoint_C = this.arm.robotArm.getObjectByName('thirdJoint_N');
		rootJoint_C.rotateOnAxis(new THREE.Vector3(0,1,0).normalize(),angle);
	};
	controller.thirdJointRotateByXaxis = function(angle){
		var rootJoint_C = this.arm.robotArm.getObjectByName('thirdJoint_N');
		rootJoint_C.rotateOnAxis(new THREE.Vector3(1,0,0).normalize(),angle);
	};

	//mode one is the default mode for this robot arm
	//Normally it can finish the process 'catch - release - recatch' along a fixed footprint
	//You can also change the footprint a little by changing the parameters:catchDuration,reCatchDuration,releaseDuration
	controller.runModeOne = function(process){
		var doCatch = {
			doAction:function(controller){
				controller.rootJointRotateByYaxis(Math.PI*0.008);
				controller.secondJointRotateByYaxis(-Math.PI*0.008);
			},
			name:'doCatch'
		}

		var doRelease = {
			doAction:function(controller){
				controller.rootJointRotateByYaxis(-Math.PI*0.005);
				controller.secondJointRotateByYaxis(Math.PI*0.008);
				controller.rootJointRotateByZaxis(-Math.PI*0.01);
				controller.thirdJointRotateByYaxis(-Math.PI*0.004);
			},
			name :'doRelease'
		}

		var doReCatch = {
			doAction:function(controller){
				controller.rootJointRotateByYaxis(Math.PI*0.005);
				controller.secondJointRotateByYaxis(-Math.PI*0.008);
				controller.rootJointRotateByZaxis(Math.PI*0.01);
				controller.thirdJointRotateByYaxis(Math.PI*0.004);
			},
			name : 'doReCatch'
		}

		var move = function(params){
			var controller = params.controller;
			if(true===controller.stop){
				if(params.process.stopCallBack){
					params.process.stopCallBack.call(this,controller);
				}
				return;
			}
			var nextFunction = '';
			var currentDuration = 0;
			//signal method is a judgement which decides whether go to the next action.
			var signalMethod = '';
			if('doCatch'==params.doFunction.name){
				signalMethod = params.process.doReleaseSignal;
				nextFunction = params.doRelease;
				currentDuration = params.process.catchDuration;
			}else if('doRelease'==params.doFunction.name){
				signalMethod = params.process.doReCatchSignal;
				nextFunction = params.doReCatch;
				currentDuration = params.process.reCatchDuration;
			}else if('doReCatch'==params.doFunction.name){
				signalMethod = params.process.doReleaseSignal;
				nextFunction = params.doRelease;
				currentDuration = params.process.releaseDuration;
			}
			if((new Date().getTime() - params.startTime)<currentDuration){
				params.doFunction.doAction.call(this,controller);
				controller.arm.virtualFactory.render();
				setTimeout(move,20,params);
			}else{
				if(signalMethod.call(this,controller)){
					params.doFunction = nextFunction;
					params.startTime = new Date().getTime();
				}
				setTimeout(move,50,params);
			}
		};

		setTimeout(move,30,{
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
	var material = new THREE.MeshLambertMaterial( {color: 0x2194ce, shading: THREE.FlatShading, overdraw: 0.5 } );
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
	var material = new THREE.MeshLambertMaterial( {color: 0xffff00, shading: THREE.FlatShading, overdraw: 0.5 } );
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
	var material = new THREE.MeshLambertMaterial( {color: 0x00ff00, shading: THREE.FlatShading, overdraw: 0.5 } );
	var cube = new THREE.Mesh( geometry, material );
	cube.position.z = zLength/2;
	cube.name='firstTrunk';
	return cube;
};

function createSecondJoint(){
	var geometry = new THREE.CylinderGeometry( 20, 20, 40, 32 );
	var material = new THREE.MeshLambertMaterial( {color: 0xffff00, shading: THREE.FlatShading, overdraw: 0.5 } );
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
	//geometry.applyMatrix( new THREE.Matrix4().makeTranslation(xLength/2, 0, 0 ) );
	var material = new THREE.MeshLambertMaterial( {color: 0x00ff00, shading: THREE.FlatShading, overdraw: 0.5 } );
	var cube = new THREE.Mesh( geometry, material );
	cube.position.x=75;
	cube.name='secondTrunk';
	return cube;
};

function createThirdJoint(){
	var geometry = new THREE.SphereGeometry(20, 32, 32, 0, Math.PI*2, 0, Math.PI)
	var material = new THREE.MeshLambertMaterial( {color: 0xffff00, shading: THREE.FlatShading, overdraw: 0.5 } );
	var cylinder = new THREE.Mesh( geometry, material );
	cylinder.name='thirdJoint';
	cylinder.position.x = 150;
	return cylinder;
};

function createSucker(){
	var geometry = new THREE.CylinderGeometry( 5, 5, 40, 64 );
	var material = new THREE.MeshLambertMaterial( {color: 0x00ff00, shading: THREE.FlatShading, overdraw: 0.5 } );
	var cylinder = new THREE.Mesh( geometry, material );
	cylinder.name='sucker';
	cylinder.rotation.x = Math.PI*0.5;
	cylinder.position.z = -20;
	return cylinder;
};