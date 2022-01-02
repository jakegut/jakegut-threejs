import './style.css'
import './public/icomoon.css'

import * as THREE from 'three';
import noise from 'asm-noise';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// import { BloomEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
  powerPreference: "high-performance",
	antialias: false,
	stencil: false,
	depth: false
});

const composer = new EffectComposer(renderer);
composer.setSize( window.innerWidth, window.innerHeight );
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1, 0.4, 0.1 );
composer.addPass( bloomPass );

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(80);
camera.position.setY(6);

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

const terrainWidth = 75;
const terrainDepth = 75;
const terrainX = 150;
const terrainY = 150;

const plane = new THREE.PlaneGeometry(terrainX, terrainY, terrainWidth - 1, terrainDepth - 1);
plane.rotateX( - Math.PI / 2 );
plane.rotateY( - Math.PI / 2 );
const groundMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff } );
const planeMesh = new THREE.Mesh(plane, groundMaterial);
scene.add(planeMesh);

const vertices = plane.attributes.position.array;

function genNoise(t, q){
  noise.algorithm = 'perlin';
  let data = []
  for(let i = 0; i < terrainWidth; i++){
    for(let j = 0; j < terrainDepth; j++){
      const height = (noise(i / 6, (j + t) / 6));
      data.push(height);
    }
  }
  return data;
}

function updateVerticies(t){
  const q = terrainDepth / 2;
  const heightData = genNoise(t, q);
  for ( let i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
    // j + 1 because it is the y component that we modify
    const d = i % terrainDepth;
    if(d <= q){
      const rad = (d / q * Math.PI);
      const h = Math.sin(rad);
      vertices[ j + 1 ] = (heightData[i] * 4) * Math.pow(h, 3) * 4
    } else {
      vertices[ j + 1 ] = 0;
    }    
  }
}

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
const starColors = [0xffffff, 0x0077b6, 0xe46700];
function addStar() {
  const geo = new THREE.SphereGeometry(0.25, 24, 24);
  const color = starColors[THREE.MathUtils.randInt(0, starColors.length - 1)];
  const mat = new THREE.MeshStandardMaterial({color});
  const star = new THREE.Mesh(geo,mat);
  const [x, z] = Array(2).fill().map(() => THREE.MathUtils.randFloatSpread(140));
  const y = THREE.MathUtils.randFloatSpread(40) + 20

  star.position.set(x, y, z - 150);
  scene.add(star);
}

Array(300).fill().forEach(() => addStar())

// const spaceTexture = new THREE.TextureLoader().load('space.jpg');
// scene.background = spaceTexture;
// const loader = new THREE.TextureLoader();
// const texture = loader.load(
// 'hdr.png',
// () => {
//   const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
//   rt.fromEquirectangularTexture(renderer, texture);
//   scene.background = rt.texture;
// });

// const jeffTexture = new THREE.TextureLoader().load('jeff.png');

// const jeff = new THREE.Mesh(
//   new THREE.BoxGeometry(3,3,3),
//   new THREE.MeshBasicMaterial({map: jeffTexture})
// );
// scene.add(jeff);

// const moonTexture = new THREE.TextureLoader().load('moon.jpg');
// const normalTexture = new THREE.TextureLoader().load('normal.jpg');

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(8, 6, 6),
  new THREE.MeshBasicMaterial({
    color: 0xda571c
  })
)
scene.add(moon);

moon.position.z = -90;
moon.position.y = 10;

window.addEventListener( 'resize', onWindowResize );

function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize( width, height );
  composer.setSize( width, height );

}

updateVerticies(0);
function moveCamera(){
  const t = document.body.getBoundingClientRect().top;
  // moon.rotation.x += 0.05;

  // jeff.rotation.y += 0.01;

  // camera.position.z = t * -0.01;
  // camera.position.x = t * -0.0002;
  // camera.position.y = t * -0.0002;
  updateVerticies(t * -0.01);
  geometry.attributes.position.needsUpdate = true;
  // console.log(t);
}

document.body.onscroll = moveCamera;

function animate(){
  requestAnimationFrame(animate);

  torus.rotation.x += 0.01;
  torus.rotation.y += 0.01;
  torus.rotation.z += 0.01;

  controls.update();

  // renderer.render(scene, camera);
  plane.attributes.position.needsUpdate = true;
  composer.render();
}

animate();