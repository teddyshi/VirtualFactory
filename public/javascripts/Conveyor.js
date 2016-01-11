var Conveyor = function(vf,name,position){
	this.virtualFactory =  vf;
	this.name = name;
	this.conveyorPartTwo = createConveyorPartTwo();
	this.conveyorPartOne = createConveyorPartOne();
	var baseGroup = new THREE.Object3D();
	if(position){
		baseGroup.position.copy(position);
	}
	baseGroup.name='base';
	baseGroup.add(this.conveyorPartTwo);
	baseGroup.add(this.conveyorPartOne);
	this.conveyor = baseGroup;
	return this;
};

function createConveyorPartTwo(){
	var xLength = 1000;
	var yLength = 100;
	var zLength = 50;
	var geometry = new THREE.BoxGeometry( xLength, yLength, zLength , 64, 16, 16);
	var material = new THREE.MeshNormalMaterial( {color: 0x00ff00} );
	var cube = new THREE.Mesh( geometry, material );
	cube.position.z = zLength/2;
	cube.name='conveyorPartTwo';
	return cube;
}

function createConveyorPartOne(){
	var xLength = 100;
	var yLength = 550;
	var zLength = 50;
	var geometry = new THREE.BoxGeometry( xLength, yLength, zLength , 16, 64, 16);
	var material = new THREE.MeshNormalMaterial( {color: 0x00ff00} );
	var cube = new THREE.Mesh( geometry, material );
	cube.position.z = zLength/2;
	cube.position.x = 450;
	cube.position.y = -325;
	cube.name='conveyorPartOne';
	return cube;
}