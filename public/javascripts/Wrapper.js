var Wrapper = function(vf,name,position){
	this.virtualFactory =  vf;
	this.name = name;
	var baseGroup = new THREE.Object3D();
	baseGroup.name='wrapper';
	if(position){
		baseGroup.position.copy(position);
	}
	var wrapperParam = {
		base:{
			width:100,
			length:100,
			height:5
		},
		rampart:{
			width:5,
			length:105,
			height:30
		}
	};
	this.base = createBase(wrapperParam);
	this.firstHorizontalRampart = createFirstHorizontalRampart(wrapperParam);
	this.secondHorizontalRampart = createSecondHorizontalRampart(wrapperParam);
	this.firstVerticalRampart = createFirstVerticalRampart(wrapperParam);
	this.secondVerticalRampart = createSecondVerticalRampart(wrapperParam);
	baseGroup.add(this.base);
	baseGroup.add(this.firstHorizontalRampart);
	baseGroup.add(this.secondHorizontalRampart);
	baseGroup.add(this.firstVerticalRampart);
	baseGroup.add(this.secondVerticalRampart);
	this.wrapper = baseGroup;
	return this;
};

function createBase(param){
	var xLength = param.base.width;
	var yLength = param.base.length;
	var zLength = param.base.height;
	var geometry = new THREE.BoxGeometry( xLength, yLength, zLength , 32, 32, 4);
	var cube = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: 0x008FD3, overdraw: 0.1, shading: THREE.SmoothShading } ));
	cube.position.z = zLength/2;
	cube.name='base';
	return cube;
}

function createFirstHorizontalRampart(param){
	var xLength = param.rampart.width;
	var yLength = param.rampart.length;
	var zLength = param.rampart.height;
	var geometry = new THREE.BoxGeometry( xLength, yLength, zLength , 4, 32, 32);
	var cube = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: 0x008FD3, overdraw: 0.1, shading: THREE.SmoothShading } ));
	cube.position.z = zLength/2;
	cube.position.x = -param.base.length/2;
	cube.name='firstHorizontalRampart';
	return cube;
}

function createSecondHorizontalRampart(param){
	var xLength = param.rampart.width;
	var yLength = param.rampart.length;
	var zLength = param.rampart.height;
	var geometry = new THREE.BoxGeometry( xLength, yLength, zLength , 4, 32, 32);
	var cube = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: 0x008FD3, overdraw: 0.1, shading: THREE.SmoothShading } ));
	cube.position.z = zLength/2;
	cube.position.x = param.base.length/2;
	cube.name='secondHorizontalRampart';
	return cube;
}

function createFirstVerticalRampart(param){
	var xLength = param.rampart.length;
	var yLength = param.rampart.width;
	var zLength = param.rampart.height;
	var geometry = new THREE.BoxGeometry( xLength, yLength, zLength , 32, 4, 32);
	var cube = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: 0x008FD3, overdraw: 0.1, shading: THREE.SmoothShading } ));
	cube.position.z = zLength/2;
	cube.position.y = -param.base.length/2;
	cube.name='firstVerticalRampart';
	return cube;
}

function createSecondVerticalRampart(param){
	var xLength = param.rampart.length;
	var yLength = param.rampart.width;
	var zLength = param.rampart.height;
	var geometry = new THREE.BoxGeometry( xLength, yLength, zLength , 32, 4, 32);
	var cube = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: 0x008FD3, overdraw: 0.1, shading: THREE.SmoothShading } ));
	cube.position.z = zLength/2;
	cube.position.y = param.base.length/2;
	cube.name='secondVerticalRampart';
	return cube;
}