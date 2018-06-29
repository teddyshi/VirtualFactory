var ModelCarFactory = {};
ModelCarFactory.createCover = function(sfc){
	var cubeWidth = 47;
	var cubeLength = 18;
	var cubeHeight = 8;
	var object = new THREE.Object3D();
	object.name = sfc;
	object.xLength = cubeWidth;
	object.yLength = cubeLength;
	object.zLength = cubeHeight;
	var geometry = new THREE.BoxGeometry( cubeWidth, cubeLength, cubeHeight , 32, 32, 32);
	var material = new THREE.MeshPhongMaterial( { color: 0xF4F707, overdraw: 0.5,shading: THREE.SmoothShading });
	var cube = new THREE.Mesh( geometry, material );
	cube.name='cover';
	object.add(cube);
	return object;
};

ModelCarFactory.installChassis = function(orignal){
	var geometry = new THREE.CylinderGeometry( 6, 6, 19, 32);
	var material = new THREE.MeshPhongMaterial( { color: 0x141207, overdraw: 0.5, shading: THREE.SmoothShading } );
	var frontWheel = new THREE.Mesh( geometry, material );
	frontWheel.position.x = -12;
	frontWheel.position.y = 0;
	frontWheel.position.z = 3;
	frontWheel.rotation.y = Math.PI*0.5;
	frontWheel.name = 'frontWheel';
	var backWheel = new THREE.Mesh( geometry, material );
	backWheel.position.x = 12;
	backWheel.position.y = 0;
	backWheel.position.z = 3;
	backWheel.rotation.y = Math.PI*0.5;
	backWheel.name = 'backWheel';
	var cover = orignal.getObjectByName('cover');
	cover.position.z = 8;
	orignal.add(frontWheel);
	orignal.add(backWheel);
};

ModelCarFactory.installMainBody = function(orignal){
	var geometry = new THREE.CylinderGeometry( 10, 10, 18, 32,8,false,-Math.PI*0.5,Math.PI);
	var material = new THREE.MeshPhongMaterial( { color: 0x4C0257, overdraw: 0.5,transparent:true,opacity:0.7, shading: THREE.SmoothShading } );
	var cylinder = new THREE.Mesh( geometry, material );
	cylinder.scale.x = 1.3;
	cylinder.name='mainBody';
	cylinder.position.z = 12;
	orignal.add(cylinder);
};