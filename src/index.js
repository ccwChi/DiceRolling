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
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const canvasEl = document.querySelector('#canvas');
const scoreResult = document.querySelector('#score-result');
const addDiceBtn = document.querySelectorAll('.add-dice-btn');
const subtractionDiceBtn = document.querySelectorAll('.subtraction-dice-btn');
const reRollButton = document.getElementById('rerolliing');
const ignoreButton = document.getElementById('ignoring');
const sideBarButton = document.getElementById('sidebar-burger');
let ignoreing = false;
let canReRolling = false;
let doubleClick= true;
reRollButton.addEventListener('click', function () {
    canReRolling = !canReRolling;
    if (canReRolling) {
        reRollButton.classList.add('done');
        reRollButton.textContent = '重骰中';
        canReRolling = true;
        doubleClick= false;
        calculateResults();
    } else {
        reRollButton.classList.remove('done');
        reRollButton.textContent = '重骰關閉中';
        canReRolling = false;
        doubleClick= true;
        calculateResults();
    }
});
ignoreButton.addEventListener('click', function () {
    ignoreing = !ignoreing;
    if (ignoreing) {
        ignoreButton.classList.add('done');
        ignoreButton.textContent = '選忽視骰子';
        ignoreing = true;
        doubleClick= false;
        calculateResults();
    } else {
        ignoreButton.classList.remove('done');
        ignoreButton.textContent = '忽視關閉中';
        ignoreing = false;
        doubleClick= true;
        calculateResults();
        //console.log(canReRolling);
    }
});
// const sidebarBurger = document.getElementById("sidebar-burger");
// sidebarBurger.addEventListener("click", () => document.body.classList.toggle("open"))
// sidebarBurger.addEventListener("touchend", () => document.body.classList.toggle("open"));

let renderer, scene, camera, physicsWorld;

let diceIdCounter = 1;
var redCount = 0, orangeCount = 0, yellowCount = 0, blueCount = 0, greenCount = 0, darkCount = 0, enemyCount = 0;
let diceFace = {};
let checkFace= {};
const diceArray = [];
let totalAttributes = {
    att: 0,
    def: 0,
    mp: 0,
    scratches: 0,
    claw: 0,
    dark_skill: 0
};
let attributes = {
    att: 0,
    def: 0,
    mp: 0,
    scratches: 0,
    claw: 0,
    dark_skill: 0
};
let tempArray = []
let lastTouchTime = 0;
const diceAttributes = {
    yellow: {
        "yellow0": {},
        "yellow1": { att: 1 },
        "yellow2": { att: 1 },
        "yellow3": { att: 2 },
        "yellow4": { mp: 1, att: 1 },
        "yellow5": { mp: 1, att: 1 }
    },
    orange: {
        "orange0": {},
        "orange1": { att: 1 },
        "orange2": { att: 2 },
        "orange3": { att: 2 },
        "orange4": { mp: 1, att: 1 },
        "orange5": { att: 3 }
    },
    red: {
        "red0": { att: 1 },
        "red1": { att: 1 },
        "red2": { mp: 1, att: 1 },
        "red3": { mp: 1, att: 2 },
        "red4": { att: 3 },
        "red5": { att: 4 }
    },
    green: {
        "green0": {},
        "green1": { def: 1 },
        "green2": { def: 1 },
        "green3": { def: 1 },
        "green4": { def: 2 },
        "green5": { def: 3 },
    },
    blue: {
        "blue0": {},
        "blue1": {},
        "blue2": { def: 1 },
        "blue3": { def: 1 },
        "blue4": { def: 1 },
        "blue5": { def: 2 },
    },
    enemy: {
        "enemy0": {},
        "enemy1": { scratches: 1 },
        "enemy2": { scratches: 1 },
        "enemy3": { claw: 1 },
        "enemy4": { claw: 1 },
        "enemy5": { scratches: 1, claw: 1 }
    },
    dark: {
        "dark0": { att: 1 },
        "dark1": { att: 2 },
        "dark2": { att: 3 },
        "dark3": { mp: 1 },
        "dark4": { mp: 2 },
        "dark5": { dark_skill: 1 },
    }
}

// canvasEl.addEventListener('click',()=>{
//     document.body.classList.remove("open")
// })
// sideBarButton.addEventListener("click", ()=>{
//     document.body.classList.toggle("open")
// })

window.addEventListener('dblclick',()=>{
    if (doubleClick){throwDice()}});
//用來作手機雙擊反應用
document.addEventListener('touchstart', (event) => {
    if (doubleClick){
    const currentTime = new Date().getTime();
    const timeSinceLastTouch = currentTime - lastTouchTime;
    if (timeSinceLastTouch <= 280 && timeSinceLastTouch >= 100) {
        throwDice();
    }
    lastTouchTime = currentTime;}
});

const raycaster = new THREE.Raycaster();

initPhysics();
initScene();

canvasEl.addEventListener('mousedown', onPointerDown);
canvasEl.addEventListener('touchstart', onPointerDown);

window.addEventListener('resize', updateSceneSize);
window.addEventListener('click', calculateResults);

addDiceBtn.forEach(function (btn) {
    btn.addEventListener('click', function () {
        let color = this.dataset.color;
        addDice(color);
    })
});
subtractionDiceBtn.forEach(function (btn) {
    btn.addEventListener('click', function () {
        let color = this.dataset.color;
        destroyDice(color);
    })
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
    canvasEl.addEventListener('mousedown', onPointerDown, false);
    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, .1, 300);
    camera.position.set(-3, 20, 9).multiplyScalar(4
    ); //攝影機拉遠拉近
    camera.lookAt(0, 0, 0); //觀看角度

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

    let controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, -14, 10); // 设置控制器的焦点
    controls.update();

    createFloor();
    throwDice();
    render();
}

function onPointerDown(event) {
    event.preventDefault();

    // 檢查是否是滑鼠事件或觸摸事件
    const isTouch = event.type.startsWith('touch');
    const coordinates = isTouch ? event.touches[0] : event;
    const x = coordinates.clientX;
    const y = coordinates.clientY;
    // 計算滑鼠在畫布中的位置
    const rect = canvasEl.getBoundingClientRect();
    const canvasX = x - rect.left;
    const canvasY = y - rect.top;

    // 將滑鼠位置轉換為three.js的裝置座標系統
    const mouse = new THREE.Vector2();
    mouse.x = (canvasX / canvasEl.clientWidth) * 2 - 1;
    mouse.y = -(canvasY / canvasEl.clientHeight) * 2 + 1;

    // 使用射線檢測滑鼠是否點擊到物體
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    // 檢查是否有物體被點擊到
    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        //console.log('點擊物', intersects[0].object.parent.uuid);
        // console.log('矩陣內的',diceArray[0].mesh.uuid);
        if (clickedObject.hasOwnProperty('geometry')) {
            const clickedObjectGeo = clickedObject.geometry;
            //console.log('Clicked object ID:', clickedObjectGeo);
            if (clickedObjectGeo.type === "BoxGeometry") {
                // console.log("attack");
                CanthrowOneDice(clickedObject);
            }
        }
    }
}
function onTouchStart(event) {
    if (event.cancelable) {
        event.preventDefault();
    }
    onPointerDown(event);
}

canvasEl.addEventListener('mousedown', onPointerDown, false);
canvasEl.addEventListener('touchstart', onTouchStart, { passive: false });
function initPhysics() {
    physicsWorld = new CANNON.World({
        allowSleep: true,
        gravity: new CANNON.Vec3(0, -50, 0),
    })
    physicsWorld.defaultContactMaterial.restitution = .3;
}

function createFloor() {
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.MeshBasicMaterial({
            color: "#E6E6E6", // 綠色
            opacity: 0.5,
        })
    );
    floor.receiveShadow = true;
    floor.position.y = -7;
    floor.quaternion.setFromAxisAngle(new THREE.Vector3(-1, 0, 0), Math.PI * 0.5);
    scene.add(floor);

    const floorBody = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Plane(),
    });
    floorBody.position.copy(floor.position);
    floorBody.quaternion.copy(floor.quaternion);
    physicsWorld.addBody(floorBody);
}

function addDice(color) {
    const newDice = createDice(color);
    diceArray.push(newDice);
    addDiceEvents(newDice, color);
    switch (color) {
        case "red":
            redCount++;
            break;
        case "orange":
            orangeCount++;
            break;
        case "yellow":
            yellowCount++;
            break;
        case "blue":
            blueCount++;
            break;
        case "green":
            greenCount++;
            break;
        case "dark":
            darkCount++;
            break;
        case "enemy":
            enemyCount++;
            break;
    }

    throwDice();
    updateCounter();
}

function destroyDice(color) {
    for (let i = diceArray.length - 1; i >= 0; i--) {
        if (diceArray[i].color === color) {
            scene.remove(diceArray[i].mesh);
            diceArray.splice(i, 1);
            break;
        }
    }
    switch (color) {
        case "red":
            if (redCount > 0) {
                redCount--;
            }
            break;
        case "orange":
            if (orangeCount > 0) {
                orangeCount--;
            }
            break;
        case "yellow":
            if (yellowCount > 0) {
                yellowCount--;
            }
            break;
        case "blue":
            if (blueCount > 0) {
                blueCount--;
            }
            break;
        case "green":
            if (greenCount > 0) {
                greenCount--;
            }
            break;
        case "dark":
            if (darkCount > 0) {
                darkCount--;
            }
            break;
        case "enemy":
            if (enemyCount > 0) {
                enemyCount--;
            }
            break;
    }
    updateCounter();

    //console.log("有刪除")
}

function createDiceMesh(color) {
    const diceMesh = new THREE.Group();

    const textureLoader = new THREE.TextureLoader();
    const geometry = new THREE.BoxGeometry(1, 1, 1);

    const textureCube3 = []

    for (let i = 0; i < 6; i++) {
        const texturePath = `./image/${color}${i}.png`;

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

    let mesh = createDiceMesh(color).clone();

    scene.add(mesh);

    const body = new CANNON.Body({
        mass: 1,
        shape: new CANNON.Box(new CANNON.Vec3(.5, .5, .5)),
        sleepTimeLimit: .1
    });
    physicsWorld.addBody(body);

    const id = `${color}_${diceIdCounter}`; // 生成唯一的骰子编号
    diceIdCounter++;

    return { mesh, body, color, id };
}

function addDiceEvents(dice, color) {
    dice.body.addEventListener('sleep', (e) => {

        dice.body.allowSleep = false;

        for (let i = 0; i < diceArray.length; i++){ 
            let diceObj = diceArray[i];
            let euler = new CANNON.Vec3();
            diceObj.body.quaternion.toEuler(euler);
            let diceId = diceObj.id;
            let color=diceObj.color;
  
        const eps = .1;
        let isZero = (angle) => Math.abs(angle) < eps;
        let isHalfPi = (angle) => Math.abs(angle - .5 * Math.PI) < eps;
        let isMinusHalfPi = (angle) => Math.abs(.5 * Math.PI + angle) < eps;
        let isPiOrMinusPi = (angle) => (Math.abs(Math.PI - angle) < eps || Math.abs(Math.PI + angle) < eps);

        if (isZero(euler.z)) {
            if (isZero(euler.x)) {
              diceFace[diceId] = `${color}2`;
            } else if (isHalfPi(euler.x)) {
                diceFace[diceId] = `${color}5`;
            } else if (isMinusHalfPi(euler.x)) {
                diceFace[diceId] = `${color}4`;
            } else if (isPiOrMinusPi(euler.x)) {
                diceFace[diceId] = `${color}3`;;
            }
          } else if (isHalfPi(euler.z)) {
            diceFace[diceId] = `${color}0`;;
          } else if (isMinusHalfPi(euler.z)) {
            diceFace[diceId] = `${color}1`;;
          }
          dice.body.allowSleep = true;
          
        }
    });
}


function calculateResults() {
    //console.log("有發動cal", diceArray, diceFace)
    
    totalAttributes = {
        att: 0,
        def: 0,
        mp: 0,
        scratches: 0,
        claw: 0,
        dark_skill: 0
    };
    checkDiceFaces();
    const filterItems = Object.keys(diceFace).reduce((filtered, key) => {
        if (diceArray.some(item => item.id === key)) {
            filtered[key] = diceFace[key];
        }
        return filtered;
    }, {});

    //console.log("有發動cal", diceArray, diceFace, "過濾玩的filteredItems", filterItems)
    //console.log(diceFace, "執行diceFace迴圈錢的diceFace")

    for (const face in filterItems) {
        //console.log("執行了迴圈中，目前有哪些face", face)
        const faceValue = filterItems[face];
        attributes = {
            att: 0,
            def: 0,
            mp: 0,
            scratches: 0,
            claw: 0,
            dark_skill: 0
        };
        //console.log(faceValue)
        if (faceValue in diceAttributes.red) {
            //console.log("如果faceValue有在紅骰骰面中，顯示faceValu",faceValue)
            Object.keys(diceAttributes.red[faceValue]).forEach((attribute) => {
                attributes[attribute] = diceAttributes.red[faceValue][attribute];
                //console.log(attributes,"前面是計算通值的內容因為紅屬而添加，後面是total",totalAttributes)
            })
        } else if (faceValue in diceAttributes.orange) {
            //console.log("如果faceValue有在紅骰骰面中，顯示faceValu",faceValue)
            Object.keys(diceAttributes.orange[faceValue]).forEach((attribute) => {
                attributes[attribute] = diceAttributes.orange[faceValue][attribute];
                //console.log(attributes,"計算通值的內容因為橘屬而添加，後面是total",totalAttributes)
            })
        } else if (faceValue in diceAttributes.yellow) {
            //console.log("如果faceValue有在紅骰骰面中，顯示faceValu",faceValue)
            Object.keys(diceAttributes.yellow[faceValue]).forEach((attribute) => {
                attributes[attribute] = diceAttributes.yellow[faceValue][attribute];
                //console.log(attributes,"計算通值的內容因為黃屬而添加，後面是total",totalAttributes)
            })
        } else if (faceValue in diceAttributes.blue) {
            //console.log("如果faceValue有在紅骰骰面中，顯示faceValu",faceValue)
            Object.keys(diceAttributes.blue[faceValue]).forEach((attribute) => {
                attributes[attribute] = diceAttributes.blue[faceValue][attribute];
                //console.log(attributes,"計算通值的內容因為藍屬而添加，後面是total",totalAttributes)
            })
        } else if (faceValue in diceAttributes.green) {
            //console.log("如果faceValue有在紅骰骰面中，顯示faceValu",faceValue)
            Object.keys(diceAttributes.green[faceValue]).forEach((attribute) => {
                attributes[attribute] = diceAttributes.green[faceValue][attribute];
                //console.log(attributes,"計算通值的內容因為綠屬而添加，後面是total",totalAttributes)
            })
        } else if (faceValue in diceAttributes.dark) {
            Object.keys(diceAttributes.dark[faceValue]).forEach((attribute) => {
                attributes[attribute] = diceAttributes.dark[faceValue][attribute];
                //console.log(attributes,"計算通值的內容因為暗影屬而添加，後面是total",totalAttributes)
            })
        } else if (faceValue in diceAttributes.enemy) {
            console.log("如果faceValue有在敵人骰面中，顯示faceValu", faceValue)
            Object.keys(diceAttributes.enemy[faceValue]).forEach((attribute) => {
                attributes[attribute] = diceAttributes.enemy[faceValue][attribute];
                //console.log(attributes,"計算通值的內容因為敵屬而添加，後面是total",totalAttributes)
            })
        }

        totalAttributes.att += attributes.att;
        totalAttributes.def += attributes.def;
        totalAttributes.mp += attributes.mp;
        totalAttributes.scratches += attributes.scratches;
        totalAttributes.claw += attributes.claw;
        totalAttributes.dark_skill += attributes.dark_skill;
    }


    scoreResult.innerHTML = `劍: ${totalAttributes.att || ""}  盾: ${totalAttributes.def || ""}  回魔: ${totalAttributes.mp || ""}
    ,<br>魔手: ${totalAttributes.scratches || ""}  爪痕: ${totalAttributes.claw || ""}  暗影狀態: ${totalAttributes.dark_skill || ""},`;
    //console.log( totalAttributes.att,"算完");
    //console.log("最後結算後的diceface,totalAttributes", diceFace, totalAttributes)
    checkDiceFaces();
    // }else {
    //     diceFace = checkFace;
    //     console.log("diceFace,checkFace",diceFace,checkFace)
    //     calculateResults();
    // }
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

function throwDice() {
    diceFace = {};
    totalAttributes = {
        att: 0,
        def: 0,
        mp: 0,
        scratches: 0,
        claw: 0,
        dark_skill: 0
    };

    //console.log("push前", diceArray)
    for (let i = tempArray.length - 1; i >= 0; i--) {
        const dice = tempArray[i];
        //console.log("看一下for有沒有工作", diceArray)
        // 顯示骰子
        dice.mesh.visible = true;
        // 將骰子放回原始矩陣
        diceArray.push(dice);
        tempArray.splice(i, 1);
        //console.log("push後", diceArray)
    }
    diceArray.forEach((d, dIdx) => {

        d.body.velocity.setZero();
        d.body.angularVelocity.setZero();

        d.body.position = new CANNON.Vec3(0, dIdx * 1.5, 0);
        d.mesh.position.copy(d.body.position);

        d.mesh.rotation.set(2 * Math.PI * Math.random(), 0, 2 * Math.PI * Math.random())
        d.body.quaternion.copy(d.mesh.quaternion);

        const force = 3 + 5 * Math.random();
        d.body.applyImpulse(
            new CANNON.Vec3(-force, force, .8),
            new CANNON.Vec3(0, 0, .3)
        );
        d.body.allowSleep = true;
        
    });
}



let CanthrowOneDice = function (clickedObject) {
    if (canReRolling) {
        throwOneDice(clickedObject);
    } else if (ignoreing) {
        ignoreDice(clickedObject)
    }
};

function throwOneDice(clickedObject) {
    totalAttributes = {
        att: 0,
        def: 0,
        mp: 0,
        scratches: 0,
        claw: 0,
        dark_skill: 0
    };

    for (let i = 0; i < diceArray.length; i++) {

        if (diceArray[i].mesh.uuid === clickedObject.parent.uuid) {
            delete diceFace[diceArray[i].id]
            const d = diceArray[i];
            d.body.velocity.setZero();
            d.body.angularVelocity.setZero();

            d.body.position = new CANNON.Vec3(0, 0, 0);
            d.mesh.position.copy(d.body.position);

            d.mesh.rotation.set(2 * Math.PI * Math.random(), 0, 2 * Math.PI * Math.random());
            d.body.quaternion.copy(d.mesh.quaternion);

            const force = 3 + 5 * Math.random();
            d.body.applyImpulse(
                new CANNON.Vec3(-force, force, 0),
                new CANNON.Vec3(.5, .5, .5)
            );
            d.body.allowSleep = true;
            
        }
    }
    calculateResults();
};

function ignoreDice(clickedObject) {
    for (let i = 0; i < diceArray.length; i++) {
        if (diceArray[i].mesh.uuid === clickedObject.parent.uuid) {
            const dice = diceArray[i];
            tempArray.push(dice);
            dice.mesh.visible = false;
            diceArray.splice(i, 1);
            
            dice.body.allowSleep = true;
            
        }
    }
    calculateResults();
};

const updateCounter = () => {
    const redCounter = document.getElementById('red-counter');
    const orangeCounter = document.getElementById('orange-counter');
    const yelloCounter = document.getElementById('yellow-counter');
    const blueCounter = document.getElementById('blue-counter');
    const greenCounter = document.getElementById('green-counter');
    const darkCounter = document.getElementById('dark-counter');
    const enemyCounter = document.getElementById('enemy-counter');

    redCounter.textContent = redCount;
    orangeCounter.textContent = orangeCount;
    yelloCounter.textContent = yellowCount;
    blueCounter.textContent = blueCount;
    greenCounter.textContent = greenCount;
    darkCounter.textContent = darkCount;
    enemyCounter.textContent = enemyCount;
};

function checkDiceFaces() {

        for (let i = 0; i < diceArray.length; i++) {
          let diceObj = diceArray[i];
          let euler = new CANNON.Vec3();
          diceObj.body.quaternion.toEuler(euler);
          let diceId = diceObj.id;
          let color=diceObj.color;

          const eps = .1;
          let isZero = (angle) => Math.abs(angle) < eps;
          let isHalfPi = (angle) => Math.abs(angle - .5 * Math.PI) < eps;
          let isMinusHalfPi = (angle) => Math.abs(.5 * Math.PI + angle) < eps;
          let isPiOrMinusPi = (angle) => (Math.abs(Math.PI - angle) < eps || Math.abs(Math.PI + angle) < eps);
            
            
          
          if (isZero(euler.z)) {
            if (isZero(euler.x)) {
              checkFace[diceId] = `${color}2`;
            } else if (isHalfPi(euler.x)) {
              checkFace[diceId] = `${color}5`;
            } else if (isMinusHalfPi(euler.x)) {
              checkFace[diceId] = `${color}4`;
            } else if (isPiOrMinusPi(euler.x)) {
              checkFace[diceId] = `${color}3`;;
            }
          } else if (isHalfPi(euler.z)) {
            checkFace[diceId] = `${color}0`;;
          } else if (isMinusHalfPi(euler.z)) {
            checkFace[diceId] = `${color}1`;;
          }
        }
        return checkFace;
  }

//   function areObjectsEqual(obj1, obj2) {

//     if (Object.keys(obj1).length !== Object.keys(obj2).length) {
//       return false;
//     }
  
//     for (let key in obj1) {
//       if (obj1.hasOwnProperty(key)) {
//         if (!(key in obj2) || obj1[key] !== obj2[key]) {
//           return false;
//         }
//       }
//     }
  
//     return true;
//   }