import { CircularRange } from "../math/functions.js";

const ControlMode =
{
    CamSpeed: Symbol('CamSpeed'),
    Yaw: Symbol('Yaw'),
    Pitch: Symbol('Pitch'),
    Roll: Symbol('Roll')
}
const Controls = {};
const Movements =
{
    Forward: -1,
    Neutral: 0,
    Backwards: 1
};
let CamMovement = Movements.Neutral;

let [Yaw, Pitch, Roll, CamSpeed] = [0, 0, 0, 1];
let Mode = ControlMode.CamSpeed;

Controls[ControlMode.Yaw] = (v) => Pitch = v != 0 ? CircularRange(Pitch + v, 0, 359) : 0;

Controls[ControlMode.Pitch] = (v) => Yaw = v != 0 ? CircularRange(Yaw + v, 0, 359) : 0;

Controls[ControlMode.Roll] = (v) => Roll = v != 0 ? CircularRange(Roll + v, 0, 359) : 0;

Controls[ControlMode.CamSpeed] = (v) => CamSpeed = Math.max(1, CamSpeed + v);

function HandleInputs()
{
    if(["NumpadAdd", "NumpadSubtract", "Delete"].includes(KeyCode) && KeyPressed)
    {   
        Controls[Mode](KeyCode == "NumpadAdd" ? 1 : KeyCode == "Delete" ? 0 : -1);
    }
}


let KeyPressed = false;
let KeyCode;

window.addEventListener("keyup", (e) =>
{
    KeyPressed = false;
    if(["KeyW", "KeyS"].includes(e.code))
        CamMovement = Movements.Neutral;
});

window.addEventListener("keydown", e =>
{
    KeyPressed = true;
    if(["KeyY", "KeyP", "KeyR", "KeyC", "KeyW", "KeyS"].includes(e.code))
    {
        const Keys =
        {
            "KeyY": () => Mode = ControlMode.Yaw,
            "KeyP": () => Mode = ControlMode.Pitch,
            "KeyR": () => Mode = ControlMode.Roll,
            "KeyC": () => Mode = ControlMode.CamSpeed,
            "KeyW": () => CamMovement = Movements.Forward,
            "KeyS": () => CamMovement = Movements.Backwards
        };
        Keys[e.code]();
    }
    KeyCode = e.code;
});

export { Yaw, Pitch, Roll, CamSpeed, Mode, Movements, CamMovement, HandleInputs };