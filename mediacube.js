$(function(){

	if( !window.mediacube )
		return;

	var $container = $('#mediacube');
	if( !$container.length )
		return;
	var container = $container[0];

	var textures;
	//$.getJSON('http://www2.ess.fi/cube/ad.js',function(d){
	THREE.ImageUtils.loadTexture(cubeImages[0],undefined,function(t1){
		THREE.ImageUtils.loadTexture(cubeImages[1],undefined,function(t2){
			THREE.ImageUtils.loadTexture(cubeImages[2],undefined,function(t3){
				THREE.ImageUtils.loadTexture(cubeImages[3],undefined,function(t4){

					// https://github.com/mrdoob/three.js/issues/1440
					// https://github.com/mrdoob/three.js/issues/1200
					// https://github.com/mrdoob/three.js/issues/1338
					t1.wrapS = t2.wrapS = t3.wrapS = t4.wrapS = t1.wrapT = t2.wrapT = t3.wrapT = t4.wrapT = THREE.RepeatWrapping;
					t1.repeat.set(1,1);
					t2.repeat.set(1,1);
					t3.repeat.set(1,1);
					t4.repeat.set(1,1);

					textures = [t1,t2,t3,t4,t4,t3];
					setTimeout(function(){
						init();
						animate();
					});
				});
			});
		});
	});

	var mouseVector = new THREE.Vector3();
	var camera, scene, renderer;
	var cube;
	var targetRotation = 0;
	var targetRotationOnMouseDown = 0;
	var mouseX = 0;
	var mouseXOnMouseDown = 0,mouseYOnMouseDown = 0;
	var w = 300, h = 300;

	function init() {

		camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
		camera.position.y = 150;
		camera.position.z = 400;

		scene = new THREE.Scene();

		// overdraw needed here otherwise seams are drawn on top of textures
		var materials = [
			new THREE.MeshBasicMaterial({overdraw:1,wireframe:false,ambient:0xffffff,map:textures[0]}),
			new THREE.MeshBasicMaterial({overdraw:1,wireframe:false,ambient:0xffffff,map:textures[1]}),
			new THREE.MeshBasicMaterial({overdraw:1,wireframe:false,ambient:0xffffff,map:textures[2]}),
			new THREE.MeshBasicMaterial({overdraw:1,wireframe:false,ambient:0xffffff,map:textures[3]}),
			new THREE.MeshBasicMaterial({overdraw:1,wireframe:false,ambient:0xffffff,map:textures[4]}),
			new THREE.MeshBasicMaterial({overdraw:1,wireframe:false,ambient:0xffffff,map:textures[5]})
		];

		// segments affect how well texture is mapped but affects the performace considerably
		cube = new THREE.Mesh(new THREE.CubeGeometry(300,300,300,4,4,4),new THREE.MeshFaceMaterial(materials) );
		cube.dynamic = true;
		cube.position.y = 150;
		scene.add( cube );

		renderer = new THREE.CanvasRenderer();

		// background color
		renderer.setClearColor(0);
		$container.append( renderer.domElement );
		//$(renderer.domElement).css({"-ms-touch-action":"none"});
		//_.each(textures,function(t) { t.anisotropy = renderer.getMaxAnisotropy();});
		$(window).on('resize orientationchange',resize);

		resize();
	}

	var roundTripDone = false;
	function initEvents() {
		renderer.domElement.addEventListener('pointerdown', pointerdown);
		renderer.domElement.addEventListener('pointermove', pointermove);
		renderer.domElement.addEventListener('pointerup', pointerup);
		//renderer.domElement.addEventListener('pointercancel', pointerup);
	}

	function resize() {
		var cw = $container.width(),ch = $container.height();
		if( cw < w ) {
			w = h = cw;
		} else w = h = 300;
		$container.find('canvas').css({
			"margin-top" : (parseInt(ch - h)/2) + "px",
			"margin-left" : (parseInt(cw - h)/2) + "px"
		});
		camera.aspect = 1;
		camera.updateProjectionMatrix();
		renderer.setSize( w, h );
	}

	function pointerup(e) {
		var mx = e.offsetX - 150
			,my = e.offsetY - 150;
		if( Math.sqrt(Math.pow(mouseXOnMouseDown-mx,2) +Math.pow(mouseYOnMouseDown-my,2)) < 2 ) {
			var projector = new THREE.Projector();

			// calculate normalized device coordinates
			mouseVector.x = (mx/150);
			mouseVector.y = (my/150);
			//console.log('touch detected at '+mouseVector.x+','+mouseVector.y);
			var raycaster = projector.pickingRay( mouseVector.clone(), camera ),
				a = raycaster.intersectObjects( scene.children );
			if (a.length > 0) {
				console.log(a[0].object.id + ', '+a[0].faceIndex+', '+a[0].face.materialIndex);
			}
		}
	}

	function pointerdown( e ) {
		e.preventDefault();
		mouseXOnMouseDown = e.offsetX - 150;
		mouseYOnMouseDown = e.offsetY - 150;
		targetRotationOnMouseDown = targetRotation;
	}
	function pointermove( e ) {
		console.log(e.offsetX+','+e.offsetY);
		mouseX = e.offsetX - 150;
		targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.02;
	}

	function animate() {
		requestAnimationFrame( animate );
		render();
	}

	function render() {
		if( roundTripDone )
			cube.rotation.y += ( targetRotation - cube.rotation.y ) * 0.05;
		else {
			cube.rotation.y += 0.05;
			if( cube.rotation.y >= (Math.PI*2) ) {
				roundTripDone = true;
				targetRotation = cube.rotation.y;
				initEvents();
			}
		}
		renderer.render( scene, camera );
	}
});

