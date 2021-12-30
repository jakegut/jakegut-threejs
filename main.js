import './style.css'

import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg')
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);
camera.position.setY(3);

const geometry = new THREE.TorusGeometry(10, 3, 16, 100);

const material = new THREE.MeshStandardMaterial({color: 0xFF6347});

const torus = new THREE.Mesh(geometry, material);

// scene.add(torus);

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(20,20,20);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

const pointLightHelper = new THREE.PointLightHelper(pointLight);
// const gridHelper = new THREE.GridHelper(200, 50, 0xffffff, 0xffffff);
scene.add(pointLightHelper);

const terrainWidth = 100;
const terrainDepth = 100;

const plane = new THREE.PlaneGeometry(150, 150, terrainWidth - 1, terrainDepth - 1);
plane.rotateX( - Math.PI / 2 );
const groundMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff } );
const planeMesh = new THREE.Mesh(plane, groundMaterial);
scene.add(planeMesh);

const vertices = plane.attributes.position.array;

function updateVerticies(){
  for ( let i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
    // j + 1 because it is the y component that we modify
    // vertices[ j + 1 ] = THREE.MathUtils.randFloatSpread(1);

  }
}

updateVerticies();

const textureLoader = new THREE.TextureLoader();
textureLoader.load( "grid-modified.png", function ( texture ) {
  texture.anisotropy = 16;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set( terrainWidth - 1, terrainDepth - 1 );
  groundMaterial.map = texture;
  groundMaterial.needsUpdate = true;

} );


const controls = new OrbitControls(camera, renderer.domElement);

function addStar() {
  const geo = new THREE.SphereGeometry(0.25, 24, 24);
  const mat = new THREE.MeshStandardMaterial({color: 0xffffff});
  const star = new THREE.Mesh(geo,mat);
  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));

  star.position.set(x, y, z);
  scene.add(star);
}

Array(200).fill().forEach(() => addStar())

const spaceTexture = new THREE.TextureLoader().load('space.jpg');
scene.background = spaceTexture;

const jeffTexture = new THREE.TextureLoader().load('jeff.png');

const jeff = new THREE.Mesh(
  new THREE.BoxGeometry(3,3,3),
  new THREE.MeshBasicMaterial({map: jeffTexture})
);
// scene.add(jeff);

const moonTexture = new THREE.TextureLoader().load('moon.jpg');
const normalTexture = new THREE.TextureLoader().load('normal.jpg');

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
  new THREE.MeshBasicMaterial({
    map: moonTexture,
    normalMap: normalTexture,
  })
)
// scene.add(moon);

moon.position.z = 30;
moon.position.setX(-10);


function moveCamera(){
  const t = document.body.getBoundingClientRect().top;
  moon.rotation.x += 0.05;

  jeff.rotation.y += 0.01;

  camera.position.z = t * -0.01;
  camera.position.x = t * -0.0002;
  camera.position.y = t * -0.0002;
}

// document.body.onscroll = moveCamera;

function animate(){
  requestAnimationFrame(animate);

  torus.rotation.x += 0.01;
  torus.rotation.y += 0.01;
  torus.rotation.z += 0.01;

  controls.update();

  renderer.render(scene, camera);
}

animate();