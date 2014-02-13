$(function(){

	if( !window.mediacube )
		return;

	var $container = $('#mediacube');
	if( !$container.length )
		return;
	var container = $container[0];

	var textures;
	//$.getJSON('http://www2.ess.fi/cube/ad.js',function(d){
		THREE.ImageUtils.loadTexture('http://placehold.it/300x300',undefined,function(t1){
			THREE.ImageUtils.loadTexture( 'http://placehold.it/300x300',undefined,function(t2){
				THREE.ImageUtils.loadTexture( 'http://placehold.it/300x300',undefined,function(t3){

					// https://github.com/mrdoob/three.js/issues/1440
					// https://github.com/mrdoob/three.js/issues/1200
					// https://github.com/mrdoob/three.js/issues/1338
					t1.wrapS = t2.wrapS = t3.wrapS = t1.wrapT = t2.wrapT = t3.wrapT= THREE.RepeatWrapping;
					t1.repeat.set( 1, 1 );
					t2.repeat.set( 1, 1 );
					t3.repeat.set( 1, 1 );

					textures = [t1,t2,t3,t1,t2,t3];
					setTimeout(function(){
						init();
						animate();
					});
				});

			});
		});
	//});

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
			new THREE.MeshBasicMaterial({overdraw:0.5,wireframe:false,ambient:0xffffff,map:textures[0]}),
			new THREE.MeshBasicMaterial({overdraw:0.5,wireframe:false,ambient:0xffffff,map:textures[1]}),
			new THREE.MeshBasicMaterial({overdraw:0.5,wireframe:false,ambient:0xffffff,map:textures[2]}),
			new THREE.MeshBasicMaterial({overdraw:0.5,wireframe:false,ambient:0xffffff,map:textures[3]}),
			new THREE.MeshBasicMaterial({overdraw:0.5,wireframe:false,ambient:0xffffff,map:textures[4]}),
			new THREE.MeshBasicMaterial({overdraw:0.5,wireframe:false,ambient:0xffffff,map:textures[5]})
		];

		// segments affect how well texture is mapped but affects the performace considerably
		cube = new THREE.Mesh(new THREE.CubeGeometry(300,300,300,2,2,2),new THREE.MeshFaceMaterial(materials) );
		cube.dynamic = true;
		cube.position.y = 150;
		scene.add( cube );

		renderer = new THREE.CanvasRenderer();

		// background color
		renderer.setClearColor(0);
		$container.append( renderer.domElement );
		//_.each(textures,function(t) { t.anisotropy = renderer.getMaxAnisotropy();});
		$(window).on('resize orientationchange',resize);
		resize();
	}

	var roundTripDone = false;
	function initEvents() {
		renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
		renderer.domElement.addEventListener( 'touchstart', onDocumentTouchStart, false );
		renderer.domElement.addEventListener( 'touchmove', onDocumentTouchMove, false );
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

	function onDocumentMouseUp(e) {
		var mx = e.clientX - 150
			,my = e.clientY - 150;
		if( Math.sqrt(Math.pow(mouseXOnMouseDown-mx,2) +Math.pow(mouseYOnMouseDown-my,2)) < 2 ) {
			var projector = new THREE.Projector();
			mouseVector.x = 2 * (e.clientX / 300) - 1;
			mouseVector.y = 1 - 2 * ( e.clientY / 300 );
			var raycaster = projector.pickingRay( mouseVector.clone(), camera ),
				a = raycaster.intersectObjects( scene.children );
			if (a.length > 0) {
				console.log(a[0].object.id + ', '+a[0].faceIndex+', '+a[0].face.materialIndex);
			}
		}
		renderer.domElement.removeEventListener( 'mousemove', onDocumentMouseMove, false );
		renderer.domElement.removeEventListener( 'mouseup', onDocumentMouseUp, false );
		renderer.domElement.removeEventListener( 'mouseout', onDocumentMouseOut, false );
	}

	function onDocumentMouseOut( event ) {
		renderer.domElement.removeEventListener( 'mousemove', onDocumentMouseMove, false );
		renderer.domElement.removeEventListener( 'mouseup', onDocumentMouseUp, false );
		renderer.domElement.removeEventListener( 'mouseout', onDocumentMouseOut, false );
	}

	function onDocumentMouseDown( e ) {
		e.preventDefault();
		renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
		renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );
		renderer.domElement.addEventListener( 'mouseout', onDocumentMouseOut, false );
		mouseXOnMouseDown = e.clientX - 150;
		mouseYOnMouseDown = e.clientY - 150;
		targetRotationOnMouseDown = targetRotation;
	}
	function onDocumentTouchStart( event ) {
		if ( event.touches.length === 1 ) {
			event.preventDefault();
			mouseXOnMouseDown = event.touches[ 0 ].pageX - 150;
			mouseYOnMouseDown = event.touches[ 0 ].pageY - 150;
			targetRotationOnMouseDown = targetRotation;
		}
	}

	function onDocumentTouchMove( event ) {
		if ( event.touches.length === 1 ) {
			event.preventDefault();
			mouseX = event.touches[ 0 ].pageX - 150;
			targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.05;
		}
	}
	function onDocumentMouseMove( event ) {
		mouseX = event.clientX - 150;
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

