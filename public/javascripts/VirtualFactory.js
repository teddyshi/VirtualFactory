var VF = {version:'1.00'};
VF.robotGroups = new Array();
VF.objectsList = new HashMap();
/**Get the camera inited.
**/
VF.getInitCamera = function(){
	var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 12500 );
	camera.position.x = 0;
	camera.position.y = -650;
	camera.position.z = 560;
	return camera;
};

VF.render = function() {
	VF.renderer.render( VF.scene, VF.camera );
};

VF.animate = function() {
	requestAnimationFrame(VF.animate);
	VF.controls.update();
};

VF.addAssist = function(){
    VF.assPlane = new THREE.Mesh(
			new THREE.PlaneBufferGeometry( 1500, 1500, 8,8),
			new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0.25, transparent: true } )
		);
    VF.assPlane.visible = true;
    VF.scene.add(VF.assPlane);
    var helper = new THREE.GridHelper( 1500, 100 );
    VF.scene.add( helper );
};


VF.loadComponents = function(){
	require(["/javascripts/ShopFloor.js"], function() {
		var sf = new ShopFloor(VF,'ShopFloor01');
		VF.scene.add(sf.shopFloor);
		VF.shopFloor = sf;
		VF.render();
	});

	require(["/javascripts/RfidInstaller.js"], function() {
		var rfidInstaller = new RfidInstaller(VF,'RfidInstaller01',new THREE.Vector3(610,300,50));
		VF.scene.add(rfidInstaller.baseGroup);
		VF.rfidInstaller = rfidInstaller;
		VF.render();
	});

	require(["/javascripts/ChassisInstaller.js"], function() {
		var chassisInstaller = new ChassisInstaller(VF,'ChassisInstaller01',new THREE.Vector3(340,300,50));
		VF.scene.add(chassisInstaller.baseGroup);
		VF.chassisInstaller = chassisInstaller;
		VF.render();
	});

	require(["/javascripts/MainBodyInstaller.js"], function() {
		var mainBodyInstaller = new MainBodyInstaller(VF,'MainBodyInstaller01',new THREE.Vector3(40,300,50));
		VF.scene.add(mainBodyInstaller.baseGroup);
		VF.mainBodyInstaller = mainBodyInstaller;
		VF.render();
	});

	require(["/javascripts/QualityChecker.js"], function() {
		var qualityChecker = new QualityChecker(VF,'QualityChecker01',new THREE.Vector3(300,-200,50));
		VF.scene.add(qualityChecker.baseGroup);
		VF.qualityChecker = qualityChecker;
		VF.render();
	});

	require(["/javascripts/Wrapper.js"], function() {
		var wrapper = new Wrapper(VF,'Wrapper01',new THREE.Vector3(930,85,0));
		VF.scene.add(wrapper.wrapper);
		VF.wrapper = wrapper;
		VF.render();
	});

	require(["/javascripts/RobotArm.js"], function() {
		var robot1 = new RobotArm(VF,'ARM01',new THREE.Vector3(-400,-200,0),
				{
					startFootPrintTarget:{
							rootJointRotateByYaxis: 0.4858347057704, 
							secondJointRotateByYaxis: -0.399733552923253, 
							rootJointRotateByZaxis: -2.9, 
							thirdJointRotateByYaxis: -0.12411500823462245
					},
					startMove:{
							rootJointRotateByYaxis:Math.PI*0.03,
							secondJointRotateByYaxis:-Math.PI*0.03,
							rootJointRotateByZaxis:-Math.PI*0.03,
							thirdJointRotateByYaxis:-Math.PI*0.03
					},
					cycleFootPrintTarget:{
							rootJointRotateByYaxis: -0.15, 
							secondJointRotateByYaxis: -0.10, 
							rootJointRotateByZaxis: 2.9, 
							thirdJointRotateByYaxis: 0.20
					},
					cycleMove:{
							rootJointRotateByYaxis:-Math.PI*0.03,
							secondJointRotateByYaxis:-Math.PI*0.03,
							rootJointRotateByZaxis:Math.PI*0.03,
							thirdJointRotateByYaxis:Math.PI*0.03					
					}				
				}
			);
		VF.robotGroups.push(robot1.robotArm);
		VF.scene.add(robot1.robotArm);
		VF.robot1 = robot1;

		var robot2 = new RobotArm(VF,'ARM02',new THREE.Vector3(-120,-200,0),
				{
					startFootPrintTarget:{
							rootJointRotateByYaxis: 0.33, 
							secondJointRotateByYaxis: -0.43, 
							rootJointRotateByZaxis: -Math.PI, 
							thirdJointRotateByYaxis: 0
					},
					startMove:{
							rootJointRotateByYaxis:Math.PI*0.03,
							secondJointRotateByYaxis:-Math.PI*0.03,
							rootJointRotateByZaxis:-Math.PI*0.03,
							thirdJointRotateByYaxis:Math.PI*0.03
					},
					cycleFootPrintTarget:{
							rootJointRotateByYaxis: 0.27, 
							secondJointRotateByYaxis: -0.11, 
							rootJointRotateByZaxis: Math.PI, 
							thirdJointRotateByYaxis: 0
					},
					cycleMove:{
							rootJointRotateByYaxis:Math.PI*0.03,
							secondJointRotateByYaxis:-Math.PI*0.03,
							rootJointRotateByZaxis:Math.PI*0.03,
							thirdJointRotateByYaxis:Math.PI*0.03					
					}				
				}
			);
		VF.robotGroups.push(robot2.robotArm);
		VF.scene.add(robot2.robotArm);
		VF.robot2 = robot2;

		var robot3 = new RobotArm(VF,'ARM03',new THREE.Vector3(750,85,0),
				{
					startFootPrintTarget:{
							rootJointRotateByYaxis: 0.51, 
							secondJointRotateByYaxis: -0.43, 
							rootJointRotateByZaxis: Math.PI, 
							thirdJointRotateByYaxis:-0.17
					},
					startMove:{
							rootJointRotateByYaxis:Math.PI*0.03,
							secondJointRotateByYaxis:-Math.PI*0.03,
							rootJointRotateByZaxis:Math.PI*0.03,
							thirdJointRotateByYaxis:-Math.PI*0.03
					},
					cycleFootPrintTarget:{
							rootJointRotateByYaxis: 0.27, 
							secondJointRotateByYaxis: -0.28, 
							rootJointRotateByZaxis: -Math.PI, 
							thirdJointRotateByYaxis: 0
					},
					cycleMove:{
							rootJointRotateByYaxis:Math.PI*0.03,
							secondJointRotateByYaxis:-Math.PI*0.03,
							rootJointRotateByZaxis:-Math.PI*0.03,
							thirdJointRotateByYaxis:-Math.PI*0.03					
					}			
				}
			);
		VF.robotGroups.push(robot3.robotArm);
		VF.scene.add(robot3.robotArm);
		VF.robot3 = robot3;
		VF.render();
	});


	var installDetector = function(){
		require(["/javascripts/AppearanceDetector.js"], function() {
			var appearanceDetector = new AppearanceDetector(VF,'AppearanceDetector01',new THREE.Vector3(-300,300,50));
			VF.scene.add(appearanceDetector.baseGroup);
			VF.appearanceDetector = appearanceDetector;
			VF.render();
		});
	};

	require(["/javascripts/Conveyor.js"], function() {
		var conveyorOneParams = {		
			position:new THREE.Vector3(475,300,0),
			width:100,
			height:50,
			color:0x848B96,
			parts:[
				{
					id:'firstPart',
					length:200,
					flow:'HORIZONTAL',
					order:'DECREASE_ON_X',
					isFirstPart:true,
					isLastPart:true,
					startPositionOffset:15,
					endPositionOffset:15
				}
			]
		};
		var conveyorOne = new Conveyor(VF,'CONVEYOR01',conveyorOneParams);
		VF.scene.add(conveyorOne.conveyor);
		VF.conveyor1 = conveyorOne;
	
		//install conveyorTwo
		var conveyorTwoParams = {		
			position:new THREE.Vector3(190,300,0),
			width:100,
			height:50,
			color:0x848B96,
			parts:[
				{
					id:'firstPart',
					length:230,
					flow:'HORIZONTAL',
					order:'DECREASE_ON_X',
					isFirstPart:true,
					isLastPart:true,
					startPositionOffset:15,
					endPositionOffset:15
				}
			]
		};
		var conveyorTwo = new Conveyor(VF,'CONVEYOR02',conveyorTwoParams);
		VF.scene.add(conveyorTwo.conveyor);
		VF.conveyor2 = conveyorTwo;

		var conveyorThreeParams = {		
			position:new THREE.Vector3(-125,300,0),
			width:100,
			height:50,
			color:0x848B96,
			parts:[
				{
					id:'firstPart',
					length:260,
					flow:'HORIZONTAL',
					order:'DECREASE_ON_X',
					isFirstPart:true,
					isLastPart:true,
					startPositionOffset:15,
					endPositionOffset:15
				}
			]
		};
		var conveyorThree = new Conveyor(VF,'CONVEYOR03',conveyorThreeParams);
		VF.scene.add(conveyorThree.conveyor);
		VF.conveyor3 = conveyorThree;

		var conveyoFourParams = {		
			position:new THREE.Vector3(-450,300,0),
			width:100,
			height:50,
			color:0x848B96,
			parts:[
				{
					id:'firstPart',
					length:200,
					flow:'HORIZONTAL',
					order:'DECREASE_ON_X',
					nextPartId:'secondPart',
					isFirstPart:true,
					startPositionOffset:15,
				},
				{
					id:'secondPart',
					length:550,
					joinPartId:'firstPart',
					joinType:'TURN_LEFT',
					flow:'VERTICAL',
					order:'DECREASE_ON_Y',
					isLastPart:true,
					endPositionOffset:15
				}
			]
		};
		var conveyorFour = new Conveyor(VF,'CONVEYOR04',conveyoFourParams);
		VF.scene.add(conveyorFour.conveyor);
		VF.conveyor4 = conveyorFour;

		var conveyorFiveParams = {
			position:new THREE.Vector3(140,-200,0),
			width:100,
			height:50,
			color:0x848B96,
			parts:[
				{
					id:'firstPart',
					length:250,
					flow:'HORIZONTAL',
					order:'INCREASE_ON_X',
					isFirstPart:true,
					startPositionOffset:15,
					isLastPart:true,
					endPositionOffset:15
				}
			]
		};
		var conveyorFive = new Conveyor(VF,'CONVEYOR05',conveyorFiveParams);
		VF.scene.add(conveyorFive.conveyor);
		VF.conveyor5 = conveyorFive;

		var conveyorSixParams = {		
			position:new THREE.Vector3(465,-200,0),
			width:100,
			height:50,
			color:0x848B96,
			parts:[
				{
					id:'firstPart',
					length:260,
					flow:'HORIZONTAL',
					order:'INCREASE_ON_X',
					nextPartId:'secondPart',
					isFirstPart:true,
					startPositionOffset:15,
				},
				{
					id:'secondPart',
					length:300,
					joinPartId:'firstPart',
					joinType:'TURN_LEFT',
					flow:'VERTICAL',
					order:'INCREASE_ON_Y',
					isLastPart:true,
					endPositionOffset:15
				}
			]
		};
		var conveyorSix = new Conveyor(VF,'CONVEYOR06',conveyorSixParams);
		VF.scene.add(conveyorSix.conveyor);
		VF.conveyor6 = conveyorSix;
		installDetector();
		VF.render();
	});


	require(["/javascripts/Polisher.js"], function() {
		var polisher = new Polisher(VF,'polisher01',new THREE.Vector3(-260,-200,0));
		VF.scene.add(polisher.baseGroup);
		VF.polisher = polisher;
		VF.render();
	});
};


VF.rfidInstallerStart = function(sfc){
	var controller = VF.rfidInstaller.controller;
	if(controller.status!='running'){
		controller.run({
			nextCooperator:VF.conveyor1,
			start:function(controller){
				var rs = {
					isReady:false,
					objectToBeStart:null
				};
				var queue = controller.machine.queue.values();
				if(queue.length>0&&controller.loadStatus==='empty'){
					rs.isReady =true;
					rs.objectToBeStart = queue[0];
					controller.machine.queue.remove(rs.objectToBeStart.name);	
				}
				return rs;
			},
			complete:function(controller,sfc){
				if(controller.loadStatus!=='loaded'||sfc!==controller.loadedObject.name){
					console.warn(sfc+" is not in work,can not be completed");
					return false;
				}
				//do work
				return true;
			}
		});
	}
	//var object = VF.materialGenerator(sfc);
	var object = ModelCarFactory.createCover(sfc);
	VF.scene.add(object);
	controller.start(object);
};

VF.rfidInstallerComplete = function(sfc){
	var controller = VF.rfidInstaller.controller;
	controller.complete(sfc);
};

VF.chassisInstallerStart = function(sfc){
	var controller = VF.chassisInstaller.controller;
	if(controller.status!='running'){
		controller.run({
			previousCooperator:VF.conveyor1,
			nextCooperator:VF.conveyor2,
			start:function(controller){
				var rs = {
					isReady:false,
					objectToBeStart:null
				};
				var queue = controller.machine.queue.values();
				if(queue.length>0&&controller.loadStatus==='empty'){
					var object = queue[0];
					if(object.onConveyorStatus==='stopped'){
						rs.isReady =true;
						rs.objectToBeStart = object;
						controller.machine.queue.remove(rs.objectToBeStart.name);
						controller.process.previousCooperator.controller.removeObject(object.name);
					}	
				}
				return rs;
			},
			complete:function(controller,sfc){
				if(controller.loadStatus!=='loaded'||sfc!==controller.loadedObject.name){
					console.warn(sfc+" is not in work,can not be completed");
					return false;
				}
				ModelCarFactory.installChassis(controller.loadedObject);
				return true;
			}
		});
	}
	var object = VF.scene.getObjectByName(sfc);
	controller.start(object);
};

VF.chassisInstallerComplete = function(sfc){
	var controller = VF.chassisInstaller.controller;
	controller.complete(sfc);
};


VF.mainBodyInstallerStart = function(sfc){
	var controller = VF.mainBodyInstaller.controller;
	if(controller.status!='running'){
		controller.run({
			previousCooperator:VF.conveyor2,
			nextCooperator:VF.conveyor3,
			start:function(controller){
				var rs = {
					isReady:false,
					objectToBeStart:null
				};
				var queue = controller.machine.queue.values();
				if(queue.length>0&&controller.loadStatus==='empty'){
					var object = queue[0];
					if(object.onConveyorStatus==='stopped'){
						rs.isReady =true;
						rs.objectToBeStart = object;
						controller.machine.queue.remove(rs.objectToBeStart.name);
						controller.process.previousCooperator.controller.removeObject(object.name);
					}	
				}
				return rs;
			},
			complete:function(controller,sfc){
				if(controller.loadStatus!=='loaded'||sfc!==controller.loadedObject.name){
					console.warn(sfc+" is not in work,can not be completed");
					return false;
				}
				ModelCarFactory.installMainBody(controller.loadedObject);
				return true;
			}
		});
	}
	var object = VF.scene.getObjectByName(sfc);
	controller.start(object);
};

VF.mainBodyInstallerComplete = function(sfc){
	var controller = VF.mainBodyInstaller.controller;
	controller.complete(sfc);
};

VF.appearanceDetectorStart = function(sfc){
	var controller = VF.appearanceDetector.controller;
	if(controller.status!='running'){
		controller.run({
			previousCooperator:VF.conveyor3,
			nextCooperator:VF.conveyor4,
			start:function(controller){
				var rs = {
					isReady:false,
					objectToBeStart:null
				};
				var queue = controller.machine.queue.values();
				if(queue.length>0&&controller.loadStatus==='empty'){
					var object = queue[0];
					if(object.onConveyorStatus==='stopped'){
						rs.isReady =true;
						rs.objectToBeStart = object;
						controller.machine.queue.remove(rs.objectToBeStart.name);
						controller.process.previousCooperator.controller.removeObject(object.name);
						//turn on light
						controller.machine.baseGroup.getObjectByName('projection-light').visible=true;
					}	
				}
				return rs;
			},
			dataCollection:function(machine,enteredObject,dcResultsMap){
				//make a smiple strategy ,generate random sizes for every object entered in the detector.
				if(!dcResultsMap.containsKey(enteredObject.name)){
					dcResultsMap.put(enteredObject.name,{
						objectName:enteredObject.name,
						width:sizeMockDc(175,5),
						length:sizeMockDc(470,10),
						height:sizeMockDc(147,8),
						createdTime:SimpleDateFormat(new Date()),
						createdOnResource:machine.name
					});
					console.log(dcResultsMap.get(enteredObject.name));
				}				
				function sizeMockDc(base,tolerance){
					var rs = base;
					if(Math.random()>0.5){
						rs = base + Math.random()*tolerance;
					}else{
						rs = base - Math.random()*tolerance;
					}
					return Math.round(rs);
				}
			},
			complete:function(controller,sfc){
				if(controller.loadStatus!=='loaded'||sfc!==controller.loadedObject.name){
					console.warn(sfc+" is not in work,can not be completed");
					return false;
				}
				//do data collection
				controller.process.dataCollection.call(this,controller.machine,controller.loadedObject,controller.machine.dcResults);
				//turn off light
				controller.machine.baseGroup.getObjectByName('projection-light').visible=false;
				return true;
			}
		});
	}
	var object = VF.scene.getObjectByName(sfc);
	controller.start(object);
};

VF.appearanceDetectorComplete = function(sfc){
	var controller = VF.appearanceDetector.controller;
	controller.complete(sfc);
};


VF.putMaterialOnConveyor = function(objectName,conveyor){
	//for test,many hard codes here.
	if(conveyor.controller.status==='stopped'){
		conveyor.controller.run();
	}
	var conveyorStart = conveyor.conveyorParam.parts[0].cfg.startPosition_r;
	var cubeWidth = 30;
	var cubeLength = 30;
	var cubeHeight = 20;

	//add a test object ,put it into conveyor
	var object = new THREE.Object3D();
	object.name = objectName;
	object.position.z = conveyor.conveyorParam.height+cubeHeight/2;
	object.position.x = conveyorStart.x;
	object.position.y = conveyorStart.y;
	object.xLength = cubeWidth;
	object.yLength = cubeLength;

	var geometry = new THREE.BoxGeometry( cubeWidth, cubeLength, cubeHeight , 16, 16, 16);
	var material = new THREE.MeshPhongMaterial( { color: 0xF4F707, overdraw: 0.5, shading: THREE.FlatShading } );
	var cube = new THREE.Mesh( geometry, material );
	object.add(cube);

	VF.scene.add(object);
	VF.render();
	conveyor.objects.put(objectName,object);
};


VF.install = function(){
	VF.loadComponents();
	VF.container = $("#container");
	VF.scene = new THREE.Scene();
	VF.camera = VF.getInitCamera();
	VF.raycaster = new THREE.Raycaster();
	VF.mouse = new THREE.Vector2();
	VF.renderer = new THREE.WebGLRenderer();
	VF.renderer.setPixelRatio( window.devicePixelRatio );
	VF.renderer.setSize( window.innerWidth, window.innerHeight );	
	VF.controls = new THREE.OrbitControls( VF.camera ,document,VF.renderer.domElement);
	VF.controls.damping = 2;
	VF.controls.addEventListener('change', VF.render);
	VF.container.append( VF.renderer.domElement);

	VF.addLights();

	//add assist plane and grid helper
	//VF.addAssist();
	setTimeout(VF.createMenuBar,3000);

	//events
	VF.renderer.domElement.addEventListener( 'dblclick', VF.onDocumentDblClick, false );
	VF.renderer.domElement.addEventListener( 'mousemove', VF.onDocumentMouseMove, false );
	VF.renderer.domElement.addEventListener( 'mousedown', VF.onDocumentMouseDown, false );
	VF.renderer.domElement.addEventListener( 'mouseup', VF.onDocumentMouseUp, false );

	VF.animate();
	VF.render();
	VF.getCommandsFromME();
	VF.refreshSpaceObjects();
};

VF.refreshSpaceObjects = function(){
	setInterval(function() {
		VF.render();
	}, 30);
};

VF.getCommandsFromME = function(){
	setInterval(function() {
		$.get("http://p526.coil.sap.com:50004/MFGInno2/api/v1/sfc/inProcess", function(latestSfcsData) {
			var changes = $.compareSfcs(latestSfcsData);
			var commands  = VF.convertMeCommandsToNativeMethods(changes);
			for(i in commands){
				var methodName = commands[i].action;
				var sfc = commands[i].sfc;
				VF[methodName].call(this,sfc);
				console.log(methodName+' '+sfc);
			}
		})
	}, 5000);
};

VF.convertMeCommandsToNativeMethods = function(commands){
	if(!commands||commands.data.length===0||commands.init===true){
		return;
	}
	var converter = {
		10:'rfidInstaller',
		20:'chassisInstaller',
		30:'mainBodyInstaller',
		50:'appearanceDetector',
		60:'polishing',
		80:'qualityChecker',
		90:'packaging'
	};
	var results = new Array();
	for(i in commands.data){

		var singleCommand = commands.data[i];
		var action = singleCommand.action==='start'?'Start':'Complete';
		action = converter[singleCommand.step]+action;
		var rs = {
			action:action,
			sfc:singleCommand.sfc
		};	
		results.push(rs);
	}

	return results;
};


VF.testOperations = function(sfc){
	setTimeout(VF.rfidInstallerStart,1000,sfc);
	setTimeout(VF.rfidInstallerComplete,1500,sfc);
	setTimeout(VF.chassisInstallerStart,4000,sfc);
	setTimeout(VF.chassisInstallerComplete,4500,sfc);
	setTimeout(VF.mainBodyInstallerStart,7000,sfc);
	setTimeout(VF.mainBodyInstallerComplete,7500,sfc);
	setTimeout(VF.appearanceDetectorStart,10000,sfc);
	setTimeout(VF.appearanceDetectorComplete,10500,sfc);
	setTimeout(VF.polishingStart,20000,sfc);
	setTimeout(VF.polishingComplete,24000,sfc);
	setTimeout(VF.qualityCheckerStart,30000,sfc);
	setTimeout(VF.qualityCheckerComplete,30500,sfc);
	setTimeout(VF.packagingStart,38000,sfc);
	setTimeout(VF.packagingComplete,41000,sfc);
};

//polishing operation has three devices : robot1 ,polisher,robot2
//so one polishing operation starts from robot1.
VF.polishingStart = function(sfc){
	var controller = VF.robot1.controller;
	if(controller.status!='running'){
		controller.run({
			previousCooperator:VF.conveyor4,
			nextCooperator:VF.polisher,
			start:function(controller){
				controller.armWorkingStart();
				var rs = {
					isReady:false,
					objectToBeStart:null
				};
				var queue = controller.machine.queue.values();
				var previousCooperator = controller.process.previousCooperator;
				var nextCooperator = controller.process.nextCooperator;
				if(queue.length>0&&controller.loadStatus==='empty'
					&&nextCooperator.controller.loadStatus==='empty'){
					var object = queue[0];
					if(object.onConveyorStatus==='stopped'){
						rs.isReady =true;
						rs.objectToBeStart = object;		
					}	
				}
				return rs;
			},
			complete:function(controller,sfc){
				if(controller.loadStatus!=='loaded'||sfc!==controller.loadedObject.name){
					console.warn(sfc+" is not in work,can not be completed");
					return false;
				}
				VF.polisherStart(sfc);
				return true;
			},
			doReleaseSignal:function(controller){
				var nextCooperator = controller.process.nextCooperator;
				var catchResult = false;
				var startResult = {
					isReady:false,
					objectToBeStart:null
				};
				if(nextCooperator.controller.loadStatus==='empty'&&controller.loadStatus==='empty'){
					var previousCooperator = controller.process.previousCooperator;
					var hasFinishedObjects = previousCooperator.controller.hasFinishedObjects(previousCooperator.controller);
					if(!hasFinishedObjects){
						return catchResult;
					}
					startResult = controller.process.start.call(this,controller);
					if(startResult.isReady){		
						catchResult  = controller.catchOnCooperator(controller);
					}
				}	
				return catchResult&&startResult.isReady;
			},
			doReCatchSignal:function(controller){
				var releaseResult = controller.releaseToSpace(controller);
				return releaseResult;
			},
			stopCallBack:function(controller){
				console.log('stop..');
			},
			resumeCallBack:function(controller){
				console.log('resume..');
			}
		});
	}
	var object = VF.scene.getObjectByName(sfc);
	controller.start(object);
};

VF.polishingComplete = function(sfc){
	var controller = VF.polisher.controller;
	controller.complete(sfc);
};

VF.polisherStart = function(sfc){
	var controller = VF.polisher.controller;
	if(controller.status!='running'){
		controller.run({
			previousCooperator:VF.robot1,
			nextCooperator:VF.robot2,
			start:function(controller){
				var rs = {
					isReady:false,
					objectToBeStart:null
				};
				var queue = controller.machine.queue.values();
				if(queue.length>0&&controller.loadStatus==='empty'){
					var object = queue[0];
					if(object.onRobotArmStatus==='stopped'){
						rs.isReady =true;
						rs.objectToBeStart = object;
						controller.machine.queue.remove(rs.objectToBeStart.name);
						controller.releaseSignalFromCompletion = false;
					}	
				}
				return rs;
			},
			complete:function(controller,sfc){
				if(controller.loadStatus!=='loaded'||sfc!==controller.loadedObject.name){
					console.warn(sfc+" is not in work,can not be completed");
					return false;
				}
				VF.afterPolishingArmStart(sfc);
				controller.releaseSignalFromCompletion = true;
				return true;
			}
		});
	}
	var object = VF.scene.getObjectByName(sfc);
	controller.start(object);
};

VF.afterPolishingArmStart = function(sfc){
	var controller = VF.robot2.controller;
	if(controller.status!='running'){
		controller.run({
			previousCooperator:VF.polisher,
			nextCooperator:VF.conveyor5,
			start:function(controller){
				controller.armWorkingStart();
				var rs = {
					isReady:false,
					objectToBeStart:null
				};
				var queue = controller.machine.queue.values();
				var previousCooperator = controller.process.previousCooperator;
				var nextCooperator = controller.process.nextCooperator;
				if(queue.length>0&&controller.loadStatus==='empty'&&previousCooperator.controller.loadStatus==='loaded'){
					var object = queue[0];
					if(object.onPolisherStatus==='finished'){
						rs.isReady =true;
						rs.objectToBeStart = object;
					}	
				}
				return rs;
			},
			complete:function(controller,sfc){
				if(controller.loadStatus!=='loaded'||sfc!==controller.loadedObject.name){
					console.warn(sfc+" is not in work,can not be completed");
					return false;
				}
				var nextCooperatorController = controller.process.nextCooperator.controller;
				nextCooperatorController.cooperationStart(nextCooperatorController,controller.loadedObject);
				//VF.polisherStart(sfc);
				return true;
			},
			doReleaseSignal:function(controller){
				var previousCooperator = controller.process.previousCooperator;
				var hasFinishedObjects = previousCooperator.controller.hasFinishedObjects(previousCooperator.controller);			
				var catchResult = false;
				if(!hasFinishedObjects){
					return catchResult;
				}
				catchResult  = controller.catchOnCooperator(controller);
				return catchResult;
			},
			doReCatchSignal:function(controller){
				var releaseResult = controller.releaseToSpace(controller);
				//return false;
				var previousCooperator = controller.process.previousCooperator;
				var polishingFinished = previousCooperator.controller.hasFinishedObjects(previousCooperator.controller);
				var releaseSignalFromCompletion = controller.process.previousCooperator.controller.releaseSignalFromCompletion;
				return polishingFinished&&releaseSignalFromCompletion;
			},
			stopCallBack:function(controller){
				console.log('stop..');
			},
			resumeCallBack:function(controller){
				console.log('resume..');
			}
		});
	}
	var object = VF.scene.getObjectByName(sfc);
	controller.start(object);
};

VF.qualityCheckerStart = function(sfc){
	var controller = VF.qualityChecker.controller;
	if(controller.status!='running'){
		controller.run({
			previousCooperator:VF.conveyor5,
			nextCooperator:VF.conveyor6,
			start:function(controller){
				var rs = {
					isReady:false,
					objectToBeStart:null
				};
				var queue = controller.machine.queue.values();
				if(queue.length>0&&controller.loadStatus==='empty'){
					var object = queue[0];
					if(object.onConveyorStatus==='stopped'){
						rs.isReady =true;
						rs.objectToBeStart = object;
						controller.machine.queue.remove(rs.objectToBeStart.name);
						controller.process.previousCooperator.controller.removeObject(object.name);
					}	
				}
				return rs;
			},
			complete:function(controller,sfc){
				if(controller.loadStatus!=='loaded'||sfc!==controller.loadedObject.name){
					console.warn(sfc+" is not in work,can not be completed");
					return false;
				}
				//do work
				return true;
			}
		});
	}
	var object = VF.scene.getObjectByName(sfc);
	controller.start(object);
};

VF.qualityCheckerComplete = function(sfc){
	var controller = VF.qualityChecker.controller;
	controller.complete(sfc);
};

VF.packagingStart = function(sfc){
	var controller = VF.robot3.controller;
	if(controller.status!='running'){
		controller.run({
			previousCooperator:VF.conveyor6,
			nextCooperator:VF.wrapper,
			start:function(controller){
				var rs = {
					isReady:false,
					objectToBeStart:null
				};
				var queue = controller.machine.queue.values();
				var previousCooperator = controller.process.previousCooperator;
				var nextCooperator = controller.process.nextCooperator;
				if(queue.length>0&&controller.loadStatus==='empty'){
					var object = queue[0];
					if(object.onConveyorStatus==='stopped'){
						rs.isReady =true;
						rs.objectToBeStart = object;
						controller.machine.queue.remove(rs.objectToBeStart.name);
						controller.armWorkingStart();
					}	
				}
				return rs;
			},
			complete:function(controller,sfc){
				if(controller.loadStatus!=='loaded'||sfc!==controller.loadedObject.name){
					console.warn(sfc+" is not in work,can not be completed");
					return false;
				}
				controller.releaseSignalFromCompletion = true;
				var sinkParam = {
					object:controller.loadedObject,
					virtualFactory:controller.machine.virtualFactory,
					disappearZ:10
				};
				var sink = function(sinkParam){
					sinkParam.object.position.z -= 5;
					if(sinkParam.object.position.z>=sinkParam.disappearZ){
						setTimeout(sink,30,sinkParam);
					}else{
						sinkParam.virtualFactory.scene.remove(sinkParam.object);
					}
				};
				sink(sinkParam);
				return true;
			},
			doReleaseSignal:function(controller){
				controller.releaseSignalFromCompletion = false;
				var nextCooperator = controller.process.nextCooperator;
				var catchResult = false;
				var previousCooperator = controller.process.previousCooperator;
				var hasFinishedObjects = previousCooperator.controller.hasFinishedObjects(previousCooperator.controller);
				if(!hasFinishedObjects){
					return catchResult;
				}
				catchResult  = controller.catchOnCooperator(controller,previousCooperator);			
				return catchResult;
			},
			doReCatchSignal:function(controller){
				var releaseResult = false;
				if(controller.releaseSignalFromCompletion){
					releaseResult = controller.releaseToSpace(controller);
				}
				return releaseResult;
			},
			stopCallBack:function(controller){
				console.log('stop..');
			},
			resumeCallBack:function(controller){
				console.log('resume..');
			}
		});
	}
	var object = VF.scene.getObjectByName(sfc);
	controller.start(object);
};

VF.packagingComplete = function(sfc){
	var controller = VF.robot3.controller;
	controller.complete(sfc);
};


VF.createMenuBar = function(){
	VF.menuBar = $("<div>", { id:"MENU_BAR"});
	VF.menuBar.id = "MENU_BAR";
	VF.menuBar.addClass('menuBar');
	VF.menuBar.childrenItem = new Array();
	VF.container.append(VF.menuBar);
	VF.createMenuItem(0,'arm_stop','Stop Arm',function(){VF.robot1.controller.stop();});	
	VF.createMenuItem(1,'arm_resume','Resume Arm',function(){VF.robot1.controller.resume();});
	VF.createMenuItem(2,'conveyor_start','Start Conveyor',function(){VF.conveyor.controller.run();});	
	VF.createMenuItem(3,'conveyor_stop','Stop Conveyor',function(){VF.conveyor.controller.stop();});
	VF.createMenuItem(4,'put_material','Put Material',function(){VF.putMaterialOnConveyor('1',VF.conveyor6)});
};

VF.createMenuItem = function(index,name,label,fn){
	var item = $('<div>',{id:VF.menuBar.id+"_"+name});
	item.addClass('menuItem');
	item.css('top',index*50+'px');
	item.html(label);
	VF.menuBar.childrenItem.push(item);
	item.click(fn);
	VF.menuBar.append(item);
};

VF.addLights = function(){
	VF.directionalLight1 = new THREE.DirectionalLight( 0xffffff, 0.5 );
	VF.directionalLight1.position.set( -400, -900, 300 );
	VF.scene.add( VF.directionalLight1 );

	VF.directionalLight2 = new THREE.DirectionalLight( 0xffffff, 0.5 );
	VF.directionalLight2.position.set( 400, -900, 300 );
	VF.scene.add( VF.directionalLight2 );

	VF.directionalLight3 = new THREE.DirectionalLight( 0xffffff, 0.5 );
	VF.directionalLight3.position.set( -400, 900, 300 );
	VF.scene.add( VF.directionalLight3 );

	VF.directionalLight4 = new THREE.DirectionalLight( 0xffffff, 0.5 );
	VF.directionalLight4.position.set( 400, 900, 300 );
	VF.scene.add( VF.directionalLight4 );
}

VF.onDocumentDblClick = function( event ){

};

VF.onDocumentMouseMove = function( event ){
	VF.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	VF.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	var vector = new THREE.Vector3( VF.mouse.x, VF.mouse.y, 0.5 ).unproject( VF.camera );
	VF.raycaster.setFromCamera( VF.mouse, VF.camera );
	var intersects = VF.raycaster.intersectObjects( VF.scene.children,true );
	if(intersects.length>0){
		var reachedObject = intersects[0].object;
		if(reachedObject.parent){
			console.log(VF.getRootObjectFromScene(reachedObject).name);
		}	
	}
};

VF.onDocumentMouseDown = function( event ){

};

VF.onDocumentMouseUp = function( event ){

};

VF.getRootObjectFromScene = function(object){
		if(object.parent){
			if(object.parent.type==='Scene'){
				return object;
			}
			object = object.parent;
			return VF.getRootObjectFromScene(object);
		}else{
			return undefined;
		}
};




