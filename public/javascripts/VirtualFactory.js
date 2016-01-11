var VF = {version:'1.00'};
VF.robotGroups = new Array();
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
			new THREE.MeshBasicMaterial( { color: 0xe8e8e8, opacity: 0.25, transparent: true } )
		);
    VF.assPlane.visible = true;
    VF.scene.add(VF.assPlane);
    var helper = new THREE.GridHelper( 1500, 100 );
    VF.scene.add( helper );
};


VF.loadComponents = function(){
	require(["/javascripts/RobotArm.js"], function() {
		var robot1 = new RobotArm(VF,'ARM01',new THREE.Vector3(-450,300,0));
		VF.robotGroups.push(robot1.robotArm);
		VF.scene.add(robot1.robotArm);
		VF.robot1 = robot1;
		VF.render();
	});

	require(["/javascripts/Conveyor.js"], function() {
		var conveyor = new Conveyor(VF,'CONVEYOR01',new THREE.Vector3(250,300,0));
		VF.scene.add(conveyor.conveyor);
		VF.render();
	});
};



VF.install = function(){
	VF.loadComponents();
	VF.container = $("#container");
	VF.scene = new THREE.Scene();
	VF.camera = VF.getInitCamera();
	VF.raycaster = new THREE.Raycaster();
	VF.renderer = new THREE.WebGLRenderer();
	VF.renderer.setPixelRatio( window.devicePixelRatio );
	VF.renderer.setSize( window.innerWidth, window.innerHeight );	
	VF.controls = new THREE.OrbitControls( VF.camera ,document,VF.renderer.domElement);
	VF.controls.damping = 2;
	VF.controls.addEventListener('change', VF.render );
	VF.container.append( VF.renderer.domElement );
	


	//add assist plane and grid helper
	VF.addAssist();

	//events
	VF.renderer.domElement.addEventListener( 'dblclick', VF.onDocumentDblClick, false );
	VF.renderer.domElement.addEventListener( 'mousemove', VF.onDocumentMouseMove, false );
	VF.renderer.domElement.addEventListener( 'mousedown', VF.onDocumentMouseDown, false );
	VF.renderer.domElement.addEventListener( 'mouseup', VF.onDocumentMouseUp, false );

	VF.animate();
	VF.render();
};

VF.onDocumentDblClick = function( event ){

};

VF.onDocumentMouseMove = function( event ){

};

VF.onDocumentMouseDown = function( event ){

};

VF.onDocumentMouseUp = function( event ){

};



