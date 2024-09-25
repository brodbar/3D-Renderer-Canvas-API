import { Canvas } from './components/Canvas.js';
import { Camera } from './components/Camera.js';
import { Timer } from './components/Timer.js';
import { Vector3, Quaternion } from './components/Vector.js';
import { ParseModel } from "./utils/LoadModel.js";

import { HandleInputs, Yaw, Pitch, Roll, CamSpeed, Mode } from "./components/Controls.js";

const Screen = {width: window.screen.availWidth, height: window.screen.availHeight}
const _Timer = new Timer(1/60);
const Scene = new Canvas(Screen.width, Screen.height);
Scene.append();

const cursorLock = [
    "pointerLockElement", "mozPointerLockElement", "webkitPointerLockElement"
].some(e => e in document);

const _Camera = new Camera(Scene, cursorLock);
window.cam = _Camera;
_Camera.addRotation(45, -35, 0);

let Meshes = [];
let Colors = [];

window.vec = Vector3
window.qua = Quaternion
let max = 0;
let pos = null;

for(let i = 0; i < 1; i++)
{
    const { meshes, colors } = await ParseModel("Cylinder", _Camera, {x: 0, y: 0, z: 0});
    meshes.forEach(x =>
        {
            Meshes.push(x);
            const dist = _Camera.pos.distance(Vector3.avg2(x.tri));
            if(dist > max)
            {
                max = dist;
                pos = Vector3.ZERO.distance(Vector3.avg2(x.tri)) * 3;
            }
            Colors = colors;
        }
    );
}
_Camera.setPos(pos, pos, pos);


const Container = document.querySelector("#Container");
const [
    YawBox,
    PitchBox,
    RollBox,
    CamBox,
    ModeBox,
    TriangleBox
] = [
    Container.querySelector("#Yaw .Value"),
    Container.querySelector("#Pitch .Value"),
    Container.querySelector("#Roll .Value"),
    Container.querySelector("#CamSpeed .Value"),
    Container.querySelector("#Mode .Value"),
    Container.querySelector("#TriangleCount .Value")
];


function draw()
{
    console.log({ Yaw, Pitch, Roll });
    HandleInputs();
    _Camera.MoveSpeed = CamSpeed;
    _Camera.flushDebugs();
    _Camera.handleInput();
    Scene.context.clearRect(0, 0, Scene.width, Scene.height);
    
    
    const mx = Meshes.map(t => {
        return { tri: t.tri.map(x => Vector3.rotateWithEuler(Yaw, Pitch, Roll, x)), color: t.color };
    })
    mx.sort((t1, t2) =>
    {
        const d1 = _Camera.pos.distance(Vector3.avg2(t1.tri));
        const d2 = _Camera.pos.distance(Vector3.avg2(t2.tri));
        return d2 - d1;
    })

    for(let i = 0; i < mx.length; i++)
    {
        _Camera.drawMesh(mx[i].tri, mx[i].color || [255, 255, 0]);
    }
    _Camera.drawDebugs();
    YawBox.textContent = Yaw;
    PitchBox.textContent = Pitch;
    RollBox.textContent = Roll;
    ModeBox.textContent = Mode.description;
    CamBox.textContent = _Camera.MoveSpeed;
    TriangleBox.textContent = Meshes.length;
}
_Timer.evoke(draw);