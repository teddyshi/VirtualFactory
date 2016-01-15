var ShopFloor = function(vf,name,position){
	this.virtualFactory =  vf;
	this.name = name;
	var baseGroup = new THREE.Object3D();
	baseGroup.name='shopFloor';
	if(position){
		baseGroup.position.copy(position);
	}
	var wrapperParam = {
		base:{
			width:2500,
			length:1500,
			height:5
		}
	};
	this.base = createBase(wrapperParam);
	baseGroup.add(this.base);
	this.shopFloor = baseGroup;
	return this;
};

function createBase(param){
	var xLength = param.base.width;
	var yLength = param.base.length;
	var zLength = param.base.height;
	var geometry = new THREE.BoxGeometry( xLength, yLength, zLength , 128, 128, 4);
	var cube = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: 0x5F5B60, overdraw: 0.5, shading: THREE.FlatShading } ));
	cube.position.z = -zLength/2;
	cube.name='base';
	return cube;
}
