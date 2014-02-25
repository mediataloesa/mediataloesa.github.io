$(function(){

	if( !window.mediacube )
		return;

	var $container = $('#mediacube');
	if( !$container.length )
		return;

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
					t1.anisotropy = t2.anisotropy = t3.anisotropy = t4.anisotropy = 1;
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
	var pointers = {};
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
		renderer.setClearColor(0); // background color
		$container.append( renderer.domElement );
		$(renderer.domElement).attr('touch-action',"none");
		$(window).on('resize orientationchange',resize);
		resize();
	}

	var roundTripDone = false;
	function initEvents() {
		renderer.domElement.addEventListener('pointerdown', pointerdown);
		renderer.domElement.addEventListener('pointermove', pointermove);
		renderer.domElement.addEventListener('pointerup', pointerup);
		renderer.domElement.addEventListener('pointercancel', pointerup);
		renderer.domElement.addEventListener('pointerout', pointerup);
		renderer.domElement.addEventListener('pointerleave', pointerup);
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

	// http://www.jacklmoore.com/notes/mouse-position/
	// offsetX and Y are not standard, so calculate'em, x and y on canvas needed to raytrace to the cube face element
	function offsetXY(e) {
		e = e || window.event;
		var target = e.target || e.srcElement,
			rect = target.getBoundingClientRect(),
			offsetX = e.clientX - rect.left,
			offsetY = e.clientY - rect.top;
		var a = [offsetX, offsetY];
		console.log(a);
		return a;
	};

	function pointerup(e) {
		if( pointers[e.pointerId] ) {
			var xy = offsetXY(e)
				,mx = xy[0] - 150
				,my = xy[1] - 150;

			// use pythagoras to calculate how much pointer moved while it was down
			if( Math.sqrt(Math.pow(pointers[e.pointerId][0]-mx,2) +Math.pow(pointers[e.pointerId][1]-my,2)) < 2 ) {
				var projector = new THREE.Projector();

				// calculate normalized device coordinates
				mouseVector.x = (mx/150);
				mouseVector.y = (my/150);
				//console.log('touch detected at '+mouseVector.x+','+mouseVector.y);
				var raycaster = projector.pickingRay( mouseVector.clone(), camera ),
					a = raycaster.intersectObjects( scene.children );
				if (a.length > 0) {
					var linkIndex = a[0].face.materialIndex;
					if( linkIndex >= 0 && linkIndex < cubeLinks.length)
						window.open(cubeLinks[linkIndex]);
					//console.log(a[0].object.id + ', '+a[0].faceIndex+', '+a[0].face.materialIndex);
				}
			}
			delete pointers[e.pointerId];
		}
	}

	function pointerdown(e) {
		var a = offsetXY(e);
		if(e.pointerId)
			pointers[e.pointerId] = [a[0]-150,a[1]-150];
		targetRotationOnMouseDown = targetRotation;
	}
	function pointermove(e) {
		if( !pointers[e.pointerId] )
			return;
		mouseX = offsetXY(e)[0] - 150;
		targetRotation = targetRotationOnMouseDown + ( mouseX - pointers[e.pointerId][0] ) * 0.02;
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

