var ShopFloor = function(vf,name,position){
	this.virtualFactory =  vf;
	this.name = name;
	var baseGroup = new THREE.Object3D();
	baseGroup.name='shopFloor';
	if(position){
		baseGroup.position.copy(position);
	}

	this.base = createBase();
	this.wallOne  = createWallOne();
	this.wallTwo = createWallTwo();

	baseGroup.add(this.wallOne);
	baseGroup.add(this.wallTwo);
	baseGroup.add(this.base);
	this.shopFloor = baseGroup;
	return this;
};

function createBase(){
	var xLength = 2500;
	var yLength = 1500;
	var zLength = 5;
	var geometry = new THREE.BoxGeometry( xLength, yLength, zLength , 128, 128, 4);
	var cube = new THREE.Mesh( geometry,new THREE.MeshPhongMaterial( { color: 0xE8E8E8, overdraw: 0.5, shading: THREE.SmoothShading } ));
	cube.position.x = 0;
	cube.position.z = 0;
	cube.position.y = 0;
	cube.name='wall_one';
	return cube;
}

function createWallOne(){
	var xLength = 2500;
	var yLength = 5;
	var zLength = 800;
    var materials = [
       new THREE.MeshBasicMaterial({
           color:0xE8E8E8
       }),
       new THREE.MeshBasicMaterial({
           color:0xE8E8E8
       }),
       new THREE.MeshBasicMaterial({
          color:0xE8E8E8
       }),
       new THREE.MeshBasicMaterial({
           map: THREE.ImageUtils.loadTexture('/images/wall_new.jpg')
       }),
       new THREE.MeshBasicMaterial({
          color:0xE8E8E8
       }),
       new THREE.MeshBasicMaterial({
           color:0xE8E8E8
       }),
    ];

	var geometry = new THREE.BoxGeometry( xLength, yLength, zLength , 128, 4, 128);
	var cube = new THREE.Mesh( geometry,new THREE.MeshFaceMaterial(materials));
	cube.position.x = 0;
	cube.position.z = zLength/2;
	cube.position.y = 750;
	cube.name='wall_one';
	return cube;
}

function createWallTwo(){
	var xLength = 5;
	var yLength = 800;
	var zLength = 1500;
    var materials = [
       new THREE.MeshBasicMaterial({
           map: THREE.ImageUtils.loadTexture('/images/wall_2512.jpg')
       }),
       new THREE.MeshBasicMaterial({
           color:0xE8E8E8
       }),
       new THREE.MeshBasicMaterial({
           color:0xE8E8E8
       }),
       new THREE.MeshBasicMaterial({
          color:0xE8E8E8
       }),

       new THREE.MeshBasicMaterial({
          color:0xE8E8E8
       }),

       new THREE.MeshBasicMaterial({
           color:0xE8E8E8
       })
    ];
	var geometry = new THREE.BoxGeometry( xLength, yLength, zLength , 4, 128, 128);
	var cube = new THREE.Mesh( geometry,new THREE.MeshFaceMaterial(materials));
	cube.position.x = -1250;
	cube.position.z = yLength/2;
	cube.position.y = 0;
	cube.rotation.x = Math.PI*0.5;
	cube.name='wall_two';
	return cube;
}

