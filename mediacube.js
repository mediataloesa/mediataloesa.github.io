$(function(){

	var textures;
	//$.getJSON('http://www2.ess.fi/cube/ad.js',function(d){
		THREE.ImageUtils.loadTexture( 'crate.gif',undefined,function(t1){
			THREE.ImageUtils.loadTexture( 'http://cdn3.emediate.eu/media/113/23081/170761/130900-RV-HT-468x400.jpg',undefined,function(t2){
				THREE.ImageUtils.loadTexture( 'http://cdn3.emediate.eu/media/33/2127/193012/0202-Lahti-468x400.jpg',undefined,function(t3){

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
	var container;
	var camera, scene, renderer;
	var cube;
	var targetRotation = 0;
	var targetRotationOnMouseDown = 0;
	var mouseX = 0;
	var mouseXOnMouseDown = 0;
	var windowHalfX = window.innerWidth / 2;
	var windowHalfY = window.innerHeight / 2;

	function init() {
		container = document.createElement( 'div' );
		document.body.appendChild( container );

		camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
		camera.position.y = 150;
		camera.position.z = 500;

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
		cube = new THREE.Mesh(new THREE.CubeGeometry(256,256,256,4,4,4),new THREE.MeshFaceMaterial(materials) );
		cube.dynamic = true;
		cube.position.y = 150;
		scene.add( cube );


		renderer = new THREE.CanvasRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );

		// background color
		renderer.setClearColor(0);
		container.appendChild( renderer.domElement );

		document.addEventListener( 'mousedown', onDocumentMouseDown, false );
		document.addEventListener( 'touchstart', onDocumentTouchStart, false );
		document.addEventListener( 'touchmove', onDocumentTouchMove, false );

		//_.each(textures,function(t) { t.anisotropy = renderer.getMaxAnisotropy();});

		window.addEventListener( 'resize', onWindowResize, false );

	}

	function onWindowResize() {
		windowHalfX = window.innerWidth / 2;
		windowHalfY = window.innerHeight / 2;
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	}



	function onDocumentMouseDown( e ) {
		event.preventDefault();

		var projector = new THREE.Projector();
		mouseVector.x = 2 * (e.clientX / window.innerWidth) - 1;
		mouseVector.y = 1 - 2 * ( e.clientY / window.innerHeight );

		var raycaster = projector.pickingRay( mouseVector.clone(), camera ),
			a = raycaster.intersectObjects( scene.children );

		if (a.length > 0) {
			console.log(a[0].object.id + ', '+a[0].faceIndex+', '+a[0].face.materialIndex);

		}
		document.addEventListener( 'mousemove', onDocumentMouseMove, false );
		document.addEventListener( 'mouseup', onDocumentMouseUp, false );
		document.addEventListener( 'mouseout', onDocumentMouseOut, false );
		mouseXOnMouseDown = event.clientX - windowHalfX;
		targetRotationOnMouseDown = targetRotation;
	}

	function onDocumentMouseMove( event ) {
		mouseX = event.clientX - windowHalfX;
		targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.02;
	}

	function onDocumentMouseUp( event ) {
		document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
		document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
		document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
	}

	function onDocumentMouseOut( event ) {
		document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
		document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
		document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
	}

	function onDocumentTouchStart( event ) {
		if ( event.touches.length === 1 ) {
			event.preventDefault();
			mouseXOnMouseDown = event.touches[ 0 ].pageX - windowHalfX;
			targetRotationOnMouseDown = targetRotation;
		}
	}

	function onDocumentTouchMove( event ) {
		if ( event.touches.length === 1 ) {
			event.preventDefault();
			mouseX = event.touches[ 0 ].pageX - windowHalfX;
			targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.05;
		}
	}

	function animate() {
		requestAnimationFrame( animate );
		render();
	}

	function render() {
		cube.rotation.y += ( targetRotation - cube.rotation.y ) * 0.05;
		renderer.render( scene, camera );
	}
});


/*
 var ad = {
 link: "http://eas3.emediate.se/eas?camp=190431::cu=10499::no=334677::ty=ct::uuid=1d7755c2-8d7c-11e3-87d1-002590af902f::cman1=2137::cman2=2139::csit=111111111114111111",
 images: [{image: "http://cdn3.emediate.eu/media/33/2127/193012/Kylpyla-468x400_2.jpg"},
 {image: "http://cdn3.emediate.eu/media/113/23081/170761/130900-RV-HT-468x400.jpg"},
 {image: "http://cdn3.emediate.eu/media/33/2127/193012/0202-Lahti-468x400.jpg"}
 ]
 }
 var textures = [
 THREE.ImageUtils.loadTexture( '1.jpg' )
 ,THREE.ImageUtils.loadTexture( '2.jpg' )
 ,THREE.ImageUtils.loadTexture( '3.jpg' )
 ,THREE.ImageUtils.loadTexture( '1.jpg' )
 ,THREE.ImageUtils.loadTexture( '2.jpg' )
 ,THREE.ImageUtils.loadTexture( '3.jpg' )
 ];
 init();
 animate();*/