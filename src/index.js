// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBKdy-jK_M5hUQfNxC-_Efq411EKKDgUrw",
  authDomain: "rollingdice-d0727.firebaseapp.com",
  projectId: "rollingdice-d0727",
  storageBucket: "rollingdice-d0727.appspot.com",
  messagingSenderId: "754345693197",
  appId: "1:754345693197:web:ba34f01984763a3a38c544"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

import "./style.css"
import * as CANNON from 'cannon-es';

import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

const canvasEl = document.querySelector('#canvas');
const scoreResult = document.querySelector('#score-result');
const rollBtn = document.querySelector('#roll-btn');
const addDiceBtn = document.querySelectorAll('.add-dice-btn');
const subtractionDiceBtn = document.querySelectorAll('.subtraction-dice-btn');

let renderer, scene, camera, diceMesh, physicsWorld;

const params = {
    numberOfDice: 2,
    segments: 40,
    edgeRadius: .07,
    notchRadius: .12,
    notchDepth: .1,
};

const diceArray = [];
let totalAttributes = {
    att: 0,
    def: 0,
    mp: 0,
    scratches: 0,
    claw: 0,
    dark_skill: 0
};

initPhysics();
initScene();

window.addEventListener('resize', updateSceneSize);
window.addEventListener('dblclick', throwDice);
rollBtn.addEventListener('click', throwDice);
addDiceBtn.forEach(function(btn){
    btn.addEventListener('click', function(){
        let color = this.dataset.color;
        addDice(color);        
    }
)
});
subtractionDiceBtn.forEach(function(btn){
    btn.addEventListener('click', function(){
        let color = this.dataset.color;
        destroyDice(color);        
    }
)
});

function initScene() {

    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas: canvasEl
    });
    renderer.shadowMap.enabled = true
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 300)
    camera.position.set(0, 2, 4).multiplyScalar(3); //攝影機拉遠拉近
    camera.lookAt(0, -4, 1); //觀看角度

    updateSceneSize();
    THREE.ColorManagement.legacyMode = false;
    const ambientLight = new THREE.AmbientLight(0xffffff, .2);
    scene.add(ambientLight);
    const topLight = new THREE.PointLight(0xffffff, .5);
    topLight.position.set(10, 15, 0);
    topLight.castShadow = true;
    topLight.shadow.mapSize.width = 2048;
    topLight.shadow.mapSize.height = 2048;
    topLight.shadow.camera.near = 5;
    topLight.shadow.camera.far = 400;
    scene.add(topLight);


    createFloor();

    throwDice();

    render();
}

function addDice(color) {
    const newDice = createDice(color);
    diceArray.push(newDice);
    addDiceEvents(newDice, color);

    throwDice();
}

function destroyDice(color){
    for (let i = diceArray.length-1; i>=0; i--){
        if (diceArray[i].color === color){
            scene.remove(diceArray[i].mesh);
            diceArray.splice(i, 1);
            break;
        }
    }
    
}

function initPhysics() {
    physicsWorld = new CANNON.World({
        allowSleep: true,
        gravity: new CANNON.Vec3(0, -50, 0),
    })
    physicsWorld.defaultContactMaterial.restitution = .3;
}


function createFloor() {
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(1000, 1000),
        new THREE.ShadowMaterial({
            opacity: .1
        })
    )
    floor.receiveShadow = true;
    floor.position.y = -7;
    floor.quaternion.setFromAxisAngle(new THREE.Vector3(-1, 0, 0), Math.PI * .5);
    scene.add(floor);

    const floorBody = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Plane(),
    });
    floorBody.position.copy(floor.position);
    floorBody.quaternion.copy(floor.quaternion);
    physicsWorld.addBody(floorBody);
}

function resetTotalAttributes() {
    totalAttributes.att = 0;
    totalAttributes.def = 0;
    totalAttributes.mp = 0;
    totalAttributes.claw = 0;
    totalAttributes.scratches =0;
    totalAttributes.dark_skill = 0;
}

function createYellowDiceMesh() {
  const diceMesh = new THREE.Group();

  const textureLoader = new THREE.TextureLoader();
  const geometry = new THREE.BoxGeometry(1, 1, 1);

  const textureCube3 = []

  for (let i=0; i<6; i++){
      const texturePath = `/image/yellow${i}.png`;
      const material = new THREE.MeshStandardMaterial({
          map: textureLoader.load(texturePath),
      });
      textureCube3.push(material);
  }
  const plane = new THREE.Mesh(geometry, textureCube3);
  diceMesh.add(plane);

  return diceMesh;
}

function createGreenDiceMesh(){
    const diceMesh = new THREE.Group();

    const textureLoader = new THREE.TextureLoader();
    const geometry = new THREE.BoxGeometry(1, 1, 1);

    const textureCube3 = []

    for (let i=0; i<6; i++){
        const texturePath = `./image/green${i}.png`;

        const material = new THREE.MeshStandardMaterial({
            map: textureLoader.load(texturePath),
        });
        textureCube3.push(material);
    }
    const plane = new THREE.Mesh(geometry, textureCube3);
    diceMesh.add(plane);

    return diceMesh;
}

function createBlueDiceMesh(){
    const diceMesh = new THREE.Group();

    const textureLoader = new THREE.TextureLoader();
    const geometry = new THREE.BoxGeometry(1, 1, 1);

    const textureCube3 = []

    for (let i=0; i<6; i++){
        const texturePath = `./image/blue${i}.png`;
        const material = new THREE.MeshStandardMaterial({
            map: textureLoader.load(texturePath),
        });
        textureCube3.push(material);
    }
    const plane = new THREE.Mesh(geometry, textureCube3);
    diceMesh.add(plane);

    return diceMesh;
}

function createDarkDiceMesh(){
    const diceMesh = new THREE.Group();

    const textureLoader = new THREE.TextureLoader();
    const geometry = new THREE.BoxGeometry(1, 1, 1);

    const textureCube3 = []

    for (let i=0; i<6; i++){
        const texturePath = `./image/dark${i}.png`;
        const material = new THREE.MeshStandardMaterial({
            map: textureLoader.load(texturePath),
        });
        textureCube3.push(material);
    }
    const plane = new THREE.Mesh(geometry, textureCube3);
    diceMesh.add(plane);

    return diceMesh;
}

function createOrangeDiceMesh(){
    const diceMesh = new THREE.Group();

    const textureLoader = new THREE.TextureLoader();
    const geometry = new THREE.BoxGeometry(1, 1, 1);

    const textureCube3 = []

    for (let i=0; i<6; i++){
        const texturePath = `./image/orange${i}.png`;
        const material = new THREE.MeshStandardMaterial({
            map: textureLoader.load(texturePath),
        });
        textureCube3.push(material);
    }
    const plane = new THREE.Mesh(geometry, textureCube3);
    diceMesh.add(plane);

    return diceMesh;
}

function createEnemyDiceMesh() {
    const diceMesh = new THREE.Group();

    const textureLoader = new THREE.TextureLoader();
    const geometry = new THREE.BoxGeometry(1, 1, 1);

    const textureCube3 = []

    for (let i=0; i<6; i++){
        const texturePath = `./image/enemy${i}.png`;
        const material = new THREE.MeshStandardMaterial({
            map: textureLoader.load(texturePath),
        });
        textureCube3.push(material);
    }
    const plane = new THREE.Mesh(geometry, textureCube3);
    diceMesh.add(plane);

    return diceMesh;
}

function createRedDiceMesh(){
    const diceMesh = new THREE.Group();

    const textureLoader = new THREE.TextureLoader();
    const geometry = new THREE.BoxGeometry(1, 1, 1);

    const textureCube3 = []

    for (let i=0; i<6; i++){
        const texturePath = `./image/red${i}.png`;
        const material = new THREE.MeshStandardMaterial({
            map: textureLoader.load(texturePath),
        });
        textureCube3.push(material);
    }
    const plane = new THREE.Mesh(geometry, textureCube3);
    diceMesh.add(plane);

    return diceMesh;
}

//createDice 則是將外觀模型和物理特性結合起來，並將骰子加入場景和物理世界，以實現模擬物理行為的效果。
function createDice(color) {

    let mesh = createYellowDiceMesh().clone();

    if (color === "red"){
        mesh = createRedDiceMesh().clone()
    }else if(color === "orange"){
        mesh = createOrangeDiceMesh().clone()   
    }else if(color === "yellow"){
        mesh = createYellowDiceMesh().clone()   
    }else if(color === "blue"){
        mesh = createBlueDiceMesh().clone()   
    }else if(color === "green"){
        mesh = createGreenDiceMesh().clone()   
    }else if(color === "enemy"){
        mesh = createEnemyDiceMesh().clone()   
    }else if(color === "dark"){
        mesh = createDarkDiceMesh().clone()   
    }
    ;

    
    scene.add(mesh);

    const body = new CANNON.Body({
        mass: 1,
        shape: new CANNON.Box(new CANNON.Vec3(.5, .5, .5)),
        sleepTimeLimit: .1
    });
    physicsWorld.addBody(body);

    return { mesh, body, color };
}

function createBoxGeometry() {

    let boxGeometry = new THREE.BoxGeometry(1, 1, 1, params.segments, params.segments, params.segments);

    const positionAttr = boxGeometry.attributes.position;
    const subCubeHalfSize = .5 - params.edgeRadius;

    //替骰子做圓角的總覽
    for (let i = 0; i < positionAttr.count; i++) {

        let position = new THREE.Vector3().fromBufferAttribute(positionAttr, i);

        const subCube = new THREE.Vector3(Math.sign(position.x), Math.sign(position.y), Math.sign(position.z)).multiplyScalar(subCubeHalfSize);
        const addition = new THREE.Vector3().subVectors(position, subCube);

        if (Math.abs(position.x) > subCubeHalfSize && Math.abs(position.y) > subCubeHalfSize && Math.abs(position.z) > subCubeHalfSize) {
            addition.normalize().multiplyScalar(params.edgeRadius);
            position = subCube.add(addition);
        } else if (Math.abs(position.x) > subCubeHalfSize && Math.abs(position.y) > subCubeHalfSize) {
            addition.z = 0;
            addition.normalize().multiplyScalar(params.edgeRadius);
            position.x = subCube.x + addition.x;
            position.y = subCube.y + addition.y;
        } else if (Math.abs(position.x) > subCubeHalfSize && Math.abs(position.z) > subCubeHalfSize) {
            addition.y = 0;
            addition.normalize().multiplyScalar(params.edgeRadius);
            position.x = subCube.x + addition.x;
            position.z = subCube.z + addition.z;
        } else if (Math.abs(position.y) > subCubeHalfSize && Math.abs(position.z) > subCubeHalfSize) {
            addition.x = 0;
            addition.normalize().multiplyScalar(params.edgeRadius);
            position.y = subCube.y + addition.y;
            position.z = subCube.z + addition.z;
        }


        positionAttr.setXYZ(i, position.x, position.y, position.z);
    }


    boxGeometry.deleteAttribute('normal');
    boxGeometry.deleteAttribute('uv');
    boxGeometry = BufferGeometryUtils.mergeVertices(boxGeometry);

    boxGeometry.computeVertexNormals();

    return boxGeometry;
}

function addDiceEvents(dice, color) {
    dice.body.addEventListener('sleep', (e) => {

        dice.body.allowSleep = false;

        const euler = new CANNON.Vec3();
        e.target.quaternion.toEuler(euler);

        const eps = .1;
        let isZero = (angle) => Math.abs(angle) < eps;
        let isHalfPi = (angle) => Math.abs(angle - .5 * Math.PI) < eps;
        let isMinusHalfPi = (angle) => Math.abs(.5 * Math.PI + angle) < eps;
        let isPiOrMinusPi = (angle) => (Math.abs(Math.PI - angle) < eps || Math.abs(Math.PI + angle) < eps);

    if (color === "red"){
        if (isZero(euler.z)) {
            if (isZero(euler.x)) {
                showRollResults("red2");
            } else if (isHalfPi(euler.x)) {
                showRollResults("red5");
            } else if (isMinusHalfPi(euler.x)) {
                showRollResults("red4");
            } else if (isPiOrMinusPi(euler.x)) {
                showRollResults("red3");
            } else {
                // landed on edge => wait to fall on side and fire the event again
                dice.body.allowSleep = true;
            }
        } else if (isHalfPi(euler.z)) {
            showRollResults("red0");
        } else if (isMinusHalfPi(euler.z)) {
            showRollResults("red1");
        } else {
            // landed on edge => wait to fall on side and fire the event again
            dice.body.allowSleep = true;
        }
    }else if (color === "yellow"){
        if (isZero(euler.z)) {
            if (isZero(euler.x)) {
                showRollResults("yellow2");
            } else if (isHalfPi(euler.x)) {
                showRollResults("yellow5");
            } else if (isMinusHalfPi(euler.x)) {
                showRollResults("yellow4");
            } else if (isPiOrMinusPi(euler.x)) {
                showRollResults("yellow3");
            } else {
                // landed on edge => wait to fall on side and fire the event again
                dice.body.allowSleep = true;
            }
        } else if (isHalfPi(euler.z)) {
            showRollResults("yellow0");
        } else if (isMinusHalfPi(euler.z)) {
            showRollResults("yellow1");
        } else {
            // landed on edge => wait to fall on side and fire the event again
            dice.body.allowSleep = true;
        }
    }else if (color === "orange"){
        if (isZero(euler.z)) {
            if (isZero(euler.x)) {
                showRollResults("orange2");
            } else if (isHalfPi(euler.x)) {
                showRollResults("orange5");
            } else if (isMinusHalfPi(euler.x)) {
                showRollResults("orange4");
            } else if (isPiOrMinusPi(euler.x)) {
                showRollResults("orange3");
            } else {
                // landed on edge => wait to fall on side and fire the event again
                dice.body.allowSleep = true;
            }
        } else if (isHalfPi(euler.z)) {
            showRollResults("orange0");
        } else if (isMinusHalfPi(euler.z)) {
            showRollResults("orange1");
        } else {
            // landed on edge => wait to fall on side and fire the event again
            dice.body.allowSleep = true;
        }
    }else if (color === "blue"){
        if (isZero(euler.z)) {
            if (isZero(euler.x)) {
                showRollResults("blue2");
            } else if (isHalfPi(euler.x)) {
                showRollResults("blue5");
            } else if (isMinusHalfPi(euler.x)) {
                showRollResults("blue4");
            } else if (isPiOrMinusPi(euler.x)) {
                showRollResults("blue3");
            } else {
                // landed on edge => wait to fall on side and fire the event again
                dice.body.allowSleep = true;
            }
        } else if (isHalfPi(euler.z)) {
            showRollResults("blue0");
        } else if (isMinusHalfPi(euler.z)) {
            showRollResults("blue1");
        } else {
            // landed on edge => wait to fall on side and fire the event again
            dice.body.allowSleep = true;
        }
    }else if (color === "green"){
        if (isZero(euler.z)) {
            if (isZero(euler.x)) {
                showRollResults("green2");
            } else if (isHalfPi(euler.x)) {
                showRollResults("green5");
            } else if (isMinusHalfPi(euler.x)) {
                showRollResults("green4");
            } else if (isPiOrMinusPi(euler.x)) {
                showRollResults("green3");
            } else {
                // landed on edge => wait to fall on side and fire the event again
                dice.body.allowSleep = true;
            }
        } else if (isHalfPi(euler.z)) {
            showRollResults("green0");
        } else if (isMinusHalfPi(euler.z)) {
            showRollResults("green1");
        } else {
            // landed on edge => wait to fall on side and fire the event again
            dice.body.allowSleep = true;
        }
    }else if (color === "dark"){
        if (isZero(euler.z)) {
            if (isZero(euler.x)) {
                showRollResults("dark2");
            } else if (isHalfPi(euler.x)) {
                showRollResults("dark5");
            } else if (isMinusHalfPi(euler.x)) {
                showRollResults("dark4");
            } else if (isPiOrMinusPi(euler.x)) {
                showRollResults("dark3");
            } else {
                // landed on edge => wait to fall on side and fire the event again
                dice.body.allowSleep = true;
            }
        } else if (isHalfPi(euler.z)) {
            showRollResults("dark0");
        } else if (isMinusHalfPi(euler.z)) {
            showRollResults("dark1");
        } else {
            // landed on edge => wait to fall on side and fire the event again
            dice.body.allowSleep = true;
        }
    }else if (color === "enemy"){
        if (isZero(euler.z)) {
            if (isZero(euler.x)) {
                showRollResults("enemy2");
            } else if (isHalfPi(euler.x)) {
                showRollResults("enemy5");
            } else if (isMinusHalfPi(euler.x)) {
                showRollResults("enemy4");
            } else if (isPiOrMinusPi(euler.x)) {
                showRollResults("enemy3");
            } else {
                // landed on edge => wait to fall on side and fire the event again
                dice.body.allowSleep = true;
            }
        } else if (isHalfPi(euler.z)) {
            showRollResults("enemy0");
        } else if (isMinusHalfPi(euler.z)) {
            showRollResults("enemy1");
        } else {
            // landed on edge => wait to fall on side and fire the event again
            dice.body.allowSleep = true;
        }
    }
    });
}





function showRollResults(score) {
    const diceAttributes = {
        yellow : {
            "yellow0": { },
            "yellow1": { att: 1 },
            "yellow2": { att: 1 },
            "yellow3": { att: 2 },
            "yellow4": { mp: 1, att: 1 },
            "yellow5": { mp: 1, att: 1 }
        },
        orange : {
            "orange0": { },
            "orange1": { att: 1 },
            "orange2": { att: 2 },
            "orange3": { att: 2 },
            "orange4": { mp: 1, att: 1 },
            "orange5": { att: 3 }
        },
        red : {
            "red0": { att: 1 },
            "red1": { att: 1 },
            "red2": { mp: 1, att: 1 },
            "red3": { mp: 1, att: 1 },
            "red4": { att: 3 },
            "red5": { att: 4 }
        },
        green : {
            "green0": {},
            "green1": { def: 1},
            "green2": { def: 1},
            "green3": { def: 1},
            "green4": { def: 2},
            "green5": { def: 3},
        },
        blue : {
            "blue0": {},
            "blue1": { def: 1},
            "blue2": { def: 1},
            "blue3": { def: 1},
            "blue4": { def: 2},
            "blue5": { def: 3},
        },
        enemy : {
            "enemy0": {},
            "enemy1": {scratches: 1},
            "enemy2": {scratches: 1},
            "enemy3": {claw: 1},
            "enemy4": {claw: 1},
            "enemy5": {scratches:1, claw:1}
        },
        dark:{
            "dark0":{att:1},
            "dark1":{att:2},
            "dark2":{att:3},
            "dark3":{mp:1},
            "dark4":{mp:2},
            "dark5":{dark_skill: 1},
        }
    }

    let attributes = {        
        att: 0,
        def: 0,
        mp: 0,
        scratches: 0,
        claw: 0,
        dark_skill: 0
    };

    if (score in diceAttributes.yellow) {
        const scoreAttributes = diceAttributes.yellow[score];
            Object.keys(scoreAttributes).forEach((attribute) => {
                attributes[attribute] = scoreAttributes[attribute];
            });
            console.log(scoreAttributes);
    } else if (score in diceAttributes.green){
        const scoreAttributes = diceAttributes.green[score];
        Object.keys(scoreAttributes).forEach((attribute) => {
            attributes[attribute] = scoreAttributes[attribute];
        });
    }else if (score in diceAttributes.blue){
        const scoreAttributes = diceAttributes.blue[score];
        Object.keys(scoreAttributes).forEach((attribute) => {
            attributes[attribute] = scoreAttributes[attribute];
        });
    }else if (score in diceAttributes.red){
        const scoreAttributes = diceAttributes.red[score];
        Object.keys(scoreAttributes).forEach((attribute) => {
            attributes[attribute] = scoreAttributes[attribute];
        });
    }else if (score in diceAttributes.orange){
        const scoreAttributes = diceAttributes.orange[score];
        Object.keys(scoreAttributes).forEach((attribute) => {
            attributes[attribute] = scoreAttributes[attribute];
        });
    }else if (score in diceAttributes.enemy){
        const scoreAttributes = diceAttributes.enemy[score];
        Object.keys(scoreAttributes).forEach((attribute) => {
            attributes[attribute] = scoreAttributes[attribute];
        });
    }else if (score in diceAttributes.dark){
        const scoreAttributes = diceAttributes.dark[score];
        Object.keys(scoreAttributes).forEach((attribute) => {
            attributes[attribute] = scoreAttributes[attribute];
        });
    }
    console.log(attributes);

    totalAttributes.att += attributes.att || 0;
    totalAttributes.def += attributes.def || 0;
    totalAttributes.mp += attributes.mp || 0;
    totalAttributes.scratches += attributes.scratches || 0;
    totalAttributes.claw += attributes.claw || 0;
    totalAttributes.dark_skill += attributes.dark_skill || 0;

    
        scoreResult.textContent = `劍: ${totalAttributes.att || 0}, 盾: ${totalAttributes.def || 0}, 回魔: ${totalAttributes.mp || 0}, 魔手: ${totalAttributes.scratches || 0},爪痕: ${totalAttributes.claw || 0},暗影狀態: ${totalAttributes.dark_skill || 0},` 
    
}


function render() {
    physicsWorld.fixedStep();

    for (const dice of diceArray) {
        dice.mesh.position.copy(dice.body.position)
        dice.mesh.quaternion.copy(dice.body.quaternion)
    }

    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

function updateSceneSize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

//結果重整在這裡，只要有擲骰動作就會把結果計算歸""。
function throwDice() {
    scoreResult.innerHTML = '';
    resetTotalAttributes();
    console.log(diceArray, "aabb")

    diceArray.forEach((d, dIdx) => {

        d.body.velocity.setZero();
        d.body.angularVelocity.setZero();

        d.body.position = new CANNON.Vec3(6, dIdx * 1.5, 0);
        d.mesh.position.copy(d.body.position);

        d.mesh.rotation.set(2 * Math.PI * Math.random(), 0, 2 * Math.PI * Math.random())
        d.body.quaternion.copy(d.mesh.quaternion);

        const force = 3 + 5 * Math.random();
        d.body.applyImpulse(
            new CANNON.Vec3(-force, force, 0),
            new CANNON.Vec3(0, 0, .2)
        );

        d.body.allowSleep = true;
    });
}

