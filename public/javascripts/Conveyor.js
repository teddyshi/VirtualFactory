var Conveyor = function(vf,name,conveyorParam){
	this.virtualFactory =  vf;
	this.name = name;
	var baseGroup = new THREE.Object3D();
	baseGroup.name=name+'_base';
	if(conveyorParam.position){
		baseGroup.position.copy(conveyorParam.position);
	}
	this.conveyorParam = conveyorParam;
	this.conveyor = baseGroup;
	createConveyorPart(baseGroup,this.conveyorParam);	
	this.objects = new HashMap();
	this.controller = buildController(this);
	return this;
};

function getPositionInScene(basePosition,position){
	return new THREE.Vector3(
			basePosition.x+position.x,
			basePosition.y+position.y,
			basePosition.z+position.z
		);
};


function buildController(conveyor){
	var controller={
						conveyor:conveyor,
						status:'stopped',//Have two status:running/stopped
						beltStatus:'empty', //Have two status:empty/loaded
						conveyorParam:conveyor.conveyorParam
					};
	controller.putObject = function(key,thing){
		this.conveyor.objects.put(key,thing);
	};

	controller.removeObject = function(key){
		var object = this.conveyor.objects.get(key);
		this.conveyor.objects.remove(key);
		//make others keep running.
		var allObjects = this.conveyor.objects.values();
		for(var i in allObjects){
			allObjects[i].onConveyorStatus='running';
		} 
	};

	//get the queue length in the space,in which the stopped objects are holded.
	//TODO
	controller.getStoppedObjectsRealLength = function(controller,cubeSelf,lengthField){
		if(controller.conveyor.objects.isEmpty()){
			return 0;
		}
		var sum = 0;
		var allObjects = controller.conveyor.objects.values();
		for(var i in allObjects){
			var obj = allObjects[i];
			if(undefined!=cubeSelf&&cubeSelf.uuid===obj.uuid){
				continue;
			}
			sum+= obj.onConveyorStatus==='stopped'?obj[lengthField]:0;
		}
		return sum;
	};

	controller.hasFinishedObjects = function(controller){
		var rs = false;
		if(controller.conveyor.objects.isEmpty()){
			return rs;
		}
		var allObjects = controller.conveyor.objects.values();
		for(var i in allObjects){
			var obj = allObjects[i];
			if(obj.onConveyorStatus==='stopped'){
				rs = true;
				return rs;
			}
		}
		return rs;
	};

	controller.loadObject = function(controller,object){	
		var conveyorStart = controller.conveyor.conveyorParam.parts[0].cfg.startPosition_r;
		object.rotation.x=0;
		object.rotation.y=0;
		object.rotation.z=0;
		object.position.copy(new THREE.Vector3(conveyorStart.x,conveyorStart.y,conveyor.conveyorParam.height+object.zLength/2));
		//clear the runningOn info which might be created in the previous conveyor it passed by.
		object.runningOn = undefined;
		object.onConveyorStatus='running';
		conveyor.objects.put(object.name,object);
	};

	controller.getPartObjectRunningOn = function(cube,conveyorKeyParams){
		var allParts = conveyorKeyParams.conveyorBuildParam.parts;
		var distanceToLine = 99999999999;
		var rs;
		for(var i in allParts){
			var part  = allParts[i];
			var distance = distToSegment(cube.position,part.cfg.startPosition_r,part.cfg.endPosition_r);
			if(distance<distanceToLine){
				distanceToLine = distance;
				rs = part;
			}
		}
		return rs;
	};

	controller.cooperationStart = function(controller,object){
		if(controller.status!=='running'){
			controller.run();
		}
		controller.loadObject(controller,object);
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
			conveyorBuildParam:this.conveyorParam,
			virtualFactory:this.conveyor.virtualFactory,
			getStoppedObjectsRealLength:this.getStoppedObjectsRealLength,
			stepDistance: 5
		};

		var move = function(conveyorKeyParams){
			if('stopped'===conveyorKeyParams.controller.status){
				return;
			}			
			var numberOfParts = conveyorKeyParams.conveyorBuildParam.parts.length;
			var lastPartFlow = conveyorKeyParams.conveyorBuildParam.parts[numberOfParts-1].flow;
			var stoppedObjectRefField = 'VERTICAL'===lastPartFlow?'yLength':'xLength';
			var objects = conveyorKeyParams.conveyor.objects.values();
			var checker = {
				HORIZONTAL:function(cube,startPosition,endPosition,order,step,stoppedObjectsRealLength,isLastPart){
						if(cube.onConveyorStatus==='stopped'){
							return 'DO_NOTHING';
						}
						var xEnd = endPosition.x;
						if(true===isLastPart){
							xEnd += order==='DECREASE_ON_X'?stoppedObjectsRealLength:-stoppedObjectsRealLength;
						}
						var distanceToEnd = Math.abs(cube.position.x-xEnd);
						if(distanceToEnd<=step||
								(cube.position.x<xEnd&&order==='DECREASE_ON_X'||
									cube.position.x>xEnd&&order==='INCREASE_ON_X'
								)
							){
							//should go to next part

							cube.position.x = xEnd;
							return 'GO_TO_NEXT';						
						}else{
							//keep moving
							cube.translateX(order==='DECREASE_ON_X'?-step:step);
							return 'KEEP_MOVING';
						}
				},
				VERTICAL:function(cube,startPosition,endPosition,order,step,stoppedObjectsRealLength,isLastPart){
						if(cube.onConveyorStatus==='stopped'){
							return 'DO_NOTHING';
						}
						var yEnd = endPosition.y;
						if(true===isLastPart){
							yEnd += order==='DECREASE_ON_Y'?stoppedObjectsRealLength:-stoppedObjectsRealLength;
						}
						var distanceToEnd = Math.abs(cube.position.y-yEnd);
						if(distanceToEnd<=step||
								(cube.position.y<yEnd&&order==='DECREASE_ON_Y'||
									cube.position.y>yEnd&&order==='INCREASE_ON_Y'
								)
							){
							//should go to next part
							cube.position.y = yEnd;
							return 'GO_TO_NEXT';						
						}else{
							//keep moving
							cube.translateY(order==='DECREASE_ON_Y'?-step:step);

							return 'KEEP_MOVING';
						}
				}
			};

			var nextStepExecutor ={
				KEEP_MOVING:function(cube,conveyorBuildParam){
					cube.onConveyorStatus = 'running';
				},
				GO_TO_NEXT:function(cube,conveyorBuildParam){
					if(cube.runningOn.isLastPart){
						cube.onConveyorStatus = 'stopped';
					}else{
						var nextPart = findConveyorPartParamById(conveyorKeyParams.conveyorBuildParam,cube.runningOn.nextPartId);
						cube.runningOn = nextPart;
						cube.onConveyorStatus = 'running';
					}
				},
				DO_NOTHING:function(cube,conveyorBuildParam){
					//do nothing here
				}
			};

			for(var i in objects){
				var cube = objects[i];
				var z = cube.position.z;
				var x = cube.position.x;
				var y = cube.position.y;

				var stoppedObjectsRealLength = conveyorKeyParams.getStoppedObjectsRealLength.call(this,
					conveyorKeyParams.controller,cube,stoppedObjectRefField);
				if(!cube.runningOn){
					cube.runningOn = conveyorKeyParams.controller.getPartObjectRunningOn(cube,conveyorKeyParams);
				}
				//check running progress on current part
				var whatShouldDo = checker[cube.runningOn.flow].call(
						this,
						cube,
						cube.runningOn.cfg.startPosition_r,
						cube.runningOn.cfg.endPosition_r,
						cube.runningOn.order,
						conveyorKeyParams.stepDistance,
						stoppedObjectsRealLength,
						cube.runningOn.isLastPart
					);
				nextStepExecutor[whatShouldDo].call(this,cube,conveyorKeyParams.conveyorBuildParam);
			}
			setTimeout(move,30,conveyorKeyParams);
		};
		move(conveyorKeyParams);
	};


	controller.stop = function(){
		this.status='stopped';
	};

 	return controller;
 }

function createConveyorPart(baseGroup,conveyorParam){

	for(var i in conveyorParam.parts){
		var partParam = conveyorParam.parts[i];
		var partCfg = {
			xLength:partParam.flow==='HORIZONTAL'?partParam.length:conveyorParam.width,
			yLength:partParam.flow==='HORIZONTAL'?conveyorParam.width:partParam.length,
			zLength:conveyorParam.height
		};
		var baseSegments = 4;
		var segments = getSuitableSegments(baseSegments,partCfg.xLength,partCfg.yLength,partCfg.zLength);
		var geometry = new THREE.BoxGeometry( partCfg.xLength, partCfg.yLength, partCfg.zLength, segments.segmentsX, segments.segmentsY, segments.segmentsZ);
		var cube = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: conveyorParam.color, overdraw: 0.5, shading: THREE.SmoothShading } ));
		cube.name = partParam.id;	
		if(partParam.isFirstPart){
			var positionZ = partCfg.zLength/2;
			if(partParam.flow==='HORIZONTAL'){
				var startPositionOffset = partParam.startPositionOffset;
				var offset = startPositionOffset?(partParam.order==='DECREASE_ON_X'?-startPositionOffset:startPositionOffset):0;
				var startPositionX = partParam.order==='DECREASE_ON_X'?partCfg.xLength/2:-partCfg.xLength/2;
				startPositionX += offset;

				var endPositionX = partParam.order==='DECREASE_ON_X'?-partCfg.xLength/2:partCfg.xLength/2;
				if(partParam.isLastPart){
					var endPositionOffset = partParam.endPositionOffset;
					offset = endPositionOffset?(partParam.order==='DECREASE_ON_X'?+endPositionOffset:-endPositionOffset):0;
					endPositionX += offset;
				} 
				var positionY = 0;			
				var startPosition = new THREE.Vector3(startPositionX,positionY,positionZ);
				var endPosition = new THREE.Vector3(endPositionX,positionY,positionZ);
				partCfg.startPosition = startPosition;
				partCfg.endPosition = endPosition;
			}else{
				var startPositionOffset = partParam.startPositionOffset;
				var offset = startPositionOffset?(partParam.order==='DECREASE_ON_Y'?-startPositionOffset:startPositionOffset):0;
				var startPositionY = partParam.order==='DECREASE_ON_Y'?partCfg.yLength/2:-partCfg.yLength/2;
				startPositionY += offset;
				var endPositionY = partParam.order==='DECREASE_ON_Y'?-partCfg.yLength/2:partCfg.yLength/2;
				if(partParam.isLastPart){
					var endPositionOffset = partParam.endPositionOffset;
					offset = endPositionOffset?(partParam.order==='DECREASE_ON_Y'?+endPositionOffset:-endPositionOffset):0;
					endPositionY += offset;
				}
				var positionX = 0;
				var startPosition = new THREE.Vector3(positionX,startPositionY,positionZ);
				var endPosition = new THREE.Vector3(positionX,endPositionY,positionZ);
				partCfg.startPosition = startPosition;
				partCfg.endPosition = endPosition;				
			}
			cube.position.z = positionZ;
		}else{
			var previousPartParam = findConveyorPartParamById(conveyorParam,partParam.joinPartId);
			var previousStartPosition = previousPartParam.cfg.startPosition;
			var previousEndPosition = previousPartParam.cfg.endPosition;
			var previousFlow = previousPartParam.flow;
			var previousOrder = previousPartParam.order;
			var joinType = partParam.joinType;
			var currentFlow = partParam.flow;
			var joinedPoint = previousEndPosition;
			var makeUpCubeParam = {
				position:new THREE.Vector3(0,0,conveyorParam.height/2),
				width:conveyorParam.width/2,
				length:conveyorParam.width/2,
				height:conveyorParam.height,
				baseSegments:baseSegments,
				color:conveyorParam.color,
				baseGroup:baseGroup
			};
			var xStrategy,yStrategy = 'DO_NOTHING';
			var strategyGen = {
				TURN_LEFT:function(previousOrder,previousPartParam,currentPartParam,makeUpCubeParam){
					//make up a cube
					var makeUpStrategyGen = {
						DECREASE_ON_X:function(previousPartParam,makeUpCubeParam){
							makeUpCubeParam.position.x = previousPartParam.cfg.endPosition.x-makeUpCubeParam.width/2;
							makeUpCubeParam.position.y = previousPartParam.cfg.endPosition.y+makeUpCubeParam.length/2;
						},
						INCREASE_ON_X:function(previousPartParam,makeUpCubeParam){
							makeUpCubeParam.position.x = previousPartParam.cfg.endPosition.x+makeUpCubeParam.width/2;
							makeUpCubeParam.position.y = previousPartParam.cfg.endPosition.y-makeUpCubeParam.length/2;
						},
						DECREASE_ON_Y:function(previousPartParam,makeUpCubeParam){
							makeUpCubeParam.position.x = previousPartParam.cfg.endPosition.x-makeUpCubeParam.width/2;
							makeUpCubeParam.position.y = previousPartParam.cfg.endPosition.y-makeUpCubeParam.length/2;
						},
						INCREASE_ON_Y:function(previousPartParam,makeUpCubeParam){
							makeUpCubeParam.position.x = previousPartParam.cfg.endPosition.x+makeUpCubeParam.width/2;
							makeUpCubeParam.position.y = previousPartParam.cfg.endPosition.y+makeUpCubeParam.length/2;
						}
					};
					makeUpStrategyGen[previousOrder].call(this,previousPartParam,makeUpCubeParam);
					makeUpCubeParam.baseGroup.add(makeUpCube(makeUpCubeParam));
					return {
						yStrategy:previousOrder==='DECREASE_ON_X'?'DECREASE':(previousOrder==='INCREASE_ON_X'?'INCREASE':'DO_NOTHING'),
						xStrategy:previousOrder==='DECREASE_ON_Y'?'INCREASE':(previousOrder==='INCREASE_ON_Y'?'DECREASE':'DO_NOTHING')
					};
				},
				TURN_RIGHT:function(previousOrder,previousPartParam,currentPartParam,makeUpCubeParam){
					//make up a cube
					var makeUpStrategyGen = {
						DECREASE_ON_X:function(previousPartParam,makeUpCubeParam){
							makeUpCubeParam.position.x = previousPartParam.cfg.endPosition.x-makeUpCubeParam.width/2;
							makeUpCubeParam.position.y = previousPartParam.cfg.endPosition.y-makeUpCubeParam.length/2;
						},
						INCREASE_ON_X:function(previousPartParam,makeUpCubeParam){
							makeUpCubeParam.position.x = previousPartParam.cfg.endPosition.x+makeUpCubeParam.width/2;
							makeUpCubeParam.position.y = previousPartParam.cfg.endPosition.y+makeUpCubeParam.length/2;
						},
						DECREASE_ON_Y:function(previousPartParam,makeUpCubeParam){
							makeUpCubeParam.position.x = previousPartParam.cfg.endPosition.x+makeUpCubeParam.width/2;
							makeUpCubeParam.position.y = previousPartParam.cfg.endPosition.y-makeUpCubeParam.length/2;
						},
						INCREASE_ON_Y:function(previousPartParam,makeUpCubeParam){
							makeUpCubeParam.position.x = previousPartParam.cfg.endPosition.x-makeUpCubeParam.width/2;
							makeUpCubeParam.position.y = previousPartParam.cfg.endPosition.y+makeUpCubeParam.length/2;
						}
					};
					makeUpStrategyGen[previousOrder].call(this,previousPartParam,makeUpCubeParam);
					makeUpCubeParam.baseGroup.add(makeUpCube(makeUpCubeParam));
					return {
						yStrategy:previousOrder==='DECREASE_ON_X'?'INCREASE':(previousOrder==='INCREASE_ON_X'?'DECREASE':'DO_NOTHING'),
						xStrategy:previousOrder==='DECREASE_ON_Y'?'DECREASE':(previousOrder==='INCREASE_ON_Y'?'INCREASE':'DO_NOTHING')
					};
				},
				GO_FORWARD:function(previousOrder){
					return {
						xStrategy:previousOrder==='DECREASE_ON_X'?'DECREASE':(previousOrder==='INCREASE_ON_X'?'INCREASE':'DO_NOTHING'),
						yStrategy:previousOrder==='DECREASE_ON_Y'?'DECREASE':(previousOrder==='INCREASE_ON_Y'?'INCREASE':'DO_NOTHING')
					};
				}
			};
			var strategyToLocatePartCenter = strategyGen[joinType].call(this,previousOrder,previousPartParam,partParam,makeUpCubeParam);
			var strategyExecutor = {
				INCREASE:function(baseValue,deltaValue){
					var rs = 
						{
							center:baseValue+deltaValue/2,
							end:baseValue+deltaValue
						};
					return rs;
				},
				DECREASE:function(baseValue,deltaValue){
					var rs = 
						{
							center:baseValue-deltaValue/2,
							end:baseValue-deltaValue
						};
					return rs;
				},
				DO_NOTHING:function(baseValue,deltaValue){
					var rs = 
						{
							center:baseValue,
							end:baseValue
						};
					return rs;
				}
			};
			var xStrategyRes = strategyExecutor[strategyToLocatePartCenter.xStrategy].call(this,joinedPoint.x,partCfg.xLength);
			var yStrategyRes = strategyExecutor[strategyToLocatePartCenter.yStrategy].call(this,joinedPoint.y,partCfg.yLength);
			//build new center position of current part
			var currentPartCenter = new THREE.Vector3(xStrategyRes.center,yStrategyRes.center,joinedPoint.z);
			cube.position.copy(currentPartCenter);
			//calc start and end position:
			partCfg.startPosition = joinedPoint;
			//handle offset
			var offset = {
				x:0,
				y:0
			};
			if(partParam.isLastPart){
				var endPositionOffset = partParam.endPositionOffset;
				if(currentFlow==='HORIZONTAL'){				
					offset.x = endPositionOffset?(partParam.order==='DECREASE_ON_X'?+endPositionOffset:-endPositionOffset):0;				
				}else{
					offset.y = endPositionOffset?(partParam.order==='DECREASE_ON_Y'?+endPositionOffset:-endPositionOffset):0;	
				}
			}			
			partCfg.endPosition = new THREE.Vector3(xStrategyRes.end+offset.x,yStrategyRes.end+offset.y,joinedPoint.z);
		}
		partCfg.startPosition_r =getPositionInScene(baseGroup.position,partCfg.startPosition);
		partCfg.endPosition_r =getPositionInScene(baseGroup.position,partCfg.endPosition);
		conveyorParam.parts[i].cfg = partCfg;
		baseGroup.add(cube);
	}
}

function findConveyorPartParamById(conveyorParam,partId){
		var rs = null;
		for(var i in conveyorParam.parts){
			if(conveyorParam.parts[i].id===partId){
				rs = conveyorParam.parts[i];
			}
		}
		return rs!=null?rs:undefined;
}

function makeUpCube(param){
	var geometry = new THREE.BoxGeometry( param.width, param.length, param.height, param.baseSegments,param.baseSegments, param.baseSegments);
	var cube = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: param.color, overdraw: 0.5, shading: THREE.SmoothShading } ));
	cube.position.copy(param.position);
	cube.name='make-up-cube_'+uuid();
	return cube;
}