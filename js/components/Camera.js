import { Vector3 } from './Vector.js';
import { Plane } from './Plane.js';
import { Line } from '../components/Line.js';
//import { Input } from './Input.js';
import { map } from '../math/functions.js';
import { CamSpeed, CamMovement } from "./Controls.js";

export class Camera
{
    #position;
    #rotation;
    #distance;
    #observer;
    #initNormal;
    #normal;

    constructor(Scene)
    {
        this.width = Scene.width;
        this.height = Scene.height;
        this.scene = Scene;
        this.aspectRatio = this.height / this.width;
        this.#distance = 5;
        this.#observer = Vector3.ZERO;
        this.#position = Vector3.ZERO;
        this.#initNormal = new Vector3(1, 0, 0);
        this.#normal = this.#initNormal;
        this.#rotation = { "y": 0, "z": 0, "x": 0 };
        this.borders = {};
        this.DEBUG = -1;
        this.locateScreenPlane();
        this.locateObserver();
        this.debugs = [];
    }

    get normal() { return this.#normal; }

    get pos() { return this.#position; }

    get xAxis() { return this.#normal; }

    get yAxis()
    {
        let zsim = new Vector3(0, 0, 1);
        zsim = Vector3.rotateWithEuler(this.#rotation.z, this.#rotation.y, this.#rotation.x, zsim);
        return zsim.crossProduct(this.xAxis, true);
    }

    get zAxis() { return this.xAxis.crossProduct(this.yAxis, true); }
    
    get planes()
    {
        return {
            "xy": new Plane(this.zAxis, Vector3.ZERO),
            "xz": new Plane(this.yAxis, Vector3.ZERO),
            "yz": new Plane(this.xAxis, Vector3.ZERO)
        };
    }

    get observer(){ return this.#observer; }

    distance(point)
    {
        return this.#position.distance(point);
    }

    handleInput()
    {
        this.addPos(
            {
                x: CamMovement * CamSpeed,
                y: CamMovement * CamSpeed,
                z: CamMovement * CamSpeed
            }
        );
    }

    locateScreenPlane()
    {
        this.screenPlane = new Plane(this.#normal, this.#position);
        return this.screenPlane;
    }

    locateObserver()
    {
        // TODO: Use screen plane instead (Single equation)
        this.#observer = Vector3.add(this.#position, Vector3.mult(this.#normal, this.#distance));
        this.borders.bottom = new Plane(
            this.zAxis,
            Vector3.add(this.pos, Vector3.mult(this.zAxis, -0.5 * this.aspectRatio))
        );
        this.borders.left = new Plane(
            this.yAxis,
            Vector3.add(this.pos, Vector3.mult(this.yAxis, -0.5))
        );
        this.borders.top = new Plane(
            Vector3.mult(this.zAxis, -1),
            Vector3.add(this.pos, Vector3.mult(this.zAxis, 0.5 * this.aspectRatio))
        );
        this.borders.right = new Plane(
            Vector3.mult(this.yAxis, -1),
            Vector3.add(this.pos, Vector3.mult(this.yAxis, 0.5))
        );
    }

    isPointVisible(point, projectedPoint)
    {        
        return this.borders.bottom.dotProduct(projectedPoint) >= 0 &&
            this.borders.left.dotProduct(projectedPoint) >= 0 &&
            this.screenPlane.dotProduct(point) <= 0
    }

    getProjectedPoint(point)
    {
        const observerRay = new Line(this.observer, point);
        const param = observerRay.findParameter(this.screenPlane.coefficients);
        return observerRay.generatePoint(param);
    }
    
    createPoint(point)
    {
        const projection = this.getProjectedPoint(point);
        return {
            initial: point,
            projection,
            x: this.borders.left.distance2(projection),
            y: this.borders.bottom.distance2(projection),
            visible: this.isPointVisible(point, projection)
        };
    }

    sprayPoint(vec)
    {
        const point = this.createPoint(vec);
        if(point.visible)
        {
            const camDist = this.observer.distance(point.initial);
            this.scene.arc(
                point.x * this.width / 1,
                this.height - point.y * this.height / (1 * this.aspectRatio),
                (this.width / 100) * (this.height / 100) / (camDist * 0.05|| 1),
                "#646432"
            );
        }
    }

    drawLine(l, COLOR)
    {
        const [s, e] = [this.createPoint(l.start), this.createPoint(l.end)];
        
        this.scene.context.save();
        this.scene.context.beginPath();
        this.scene.context.moveTo(s.x * this.width / 1, this.height - s.y * this.height / (1 * this.aspectRatio));
        this.scene.context.lineTo(e.x * this.width / 1, this.height - e.y * this.height / (1 * this.aspectRatio));
        this.scene.context.fillStyle = COLOR;
        this.scene.context.fill();
        this.scene.context.strokeStyle = COLOR;
        this.scene.context.stroke();
        this.scene.context.closePath();
        this.scene.context.restore();
    }

    drawMesh(m, COLOR)
    {
        const [a, b, c] = [this.createPoint(m[0]), this.createPoint(m[1]), this.createPoint(m[2])];
        
        
        if(a.visible && b.visible && c.visible)
        {
            const normal = Vector3.sub(m[2], m[1]).crossProduct(Vector3.sub(m[0], m[1]), true);
            const camDirection = Vector3.sub(this.#position, Vector3.avg2(m));
            const lightPosition = new Vector3(10 * 10, 30 * 10, 25 * 10);
            const lightDirection = Vector3.sub(lightPosition, Vector3.avg2(m));
            
            if(Math.sign(camDirection.dotProduct(normal)) >= 0 )
            {
                return;
            }
            const col = Math.acos(normal.dotProduct(lightDirection) / (normal.length * lightDirection.length)) * 180 / Math.PI;
            const brightness = map(col, 80, 180, 0.1, 1);
            
            const newColor = COLOR.map(m => m * brightness).join(",");
            
            //this.sprayPoint(lightPosition);
            this.scene.context.save();
            this.scene.context.beginPath();
            this.scene.context.moveTo(a.x * this.width, this.height - a.y * this.height / this.aspectRatio);
            this.scene.context.lineTo(b.x * this.width, this.height - b.y * this.height / this.aspectRatio);
            this.scene.context.lineTo(c.x * this.width, this.height - c.y * this.height / this.aspectRatio);

            this.scene.context.closePath();
            this.scene.context.fillStyle = `rgb(${newColor})`;
            this.scene.context.fill();
            this.scene.context.strokeStyle = `rgb(${newColor})`;
            this.scene.context.stroke();
            this.scene.context.restore();

            if(this.DEBUG > 0)
            {
                const p = this.createPoint(Vector3.avg2(m));
                const n = this.createPoint(Vector3.add(Vector3.avg2(m), normal));

                this.scene.context.save();
                this.scene.context.moveTo(p.x * this.width / 1, this.height - p.y * this.height / (1 * this.aspectRatio));
                this.scene.context.lineTo(n.x * this.width / 1, this.height - n.y * this.height / (1 * this.aspectRatio));
                this.scene.context.strokeStyle = `rgba(255, 0, 0, 100)`;
                this.scene.context.stroke();
                this.scene.context.restore();
            }
        }
        this.scene.context.restore();
    }

    flushDebugs()
    {
        this.debugs = []
    }

    drawDebugs()
    {
        this.debugs.forEach(d => d());
    }

    setPos(x, y, z)
    {
        this.#position.set(x, y, z);
        this.locateObserver();
        this.locateScreenPlane();
    }

    addPos({x, y, z})
    {
        this.#position.x += x;
        this.#position.y += y;
        this.#position.z += z;
        this.locateObserver();
        this.locateScreenPlane();
    }

    setRotation(z, y, x)
    {
        this.#rotation = { y, z, x };
        this.#normal = Vector3.rotateWithEuler(z, y, x, this.#initNormal);
        this.locateObserver();
        this.locateScreenPlane();
    }

    addRotation(z, y, x)
    {
        this.setRotation(this.#rotation.z + z, this.#rotation.y + y, this.#rotation.x + x);
        this.locateObserver();
        this.locateScreenPlane();
    }

    getRotation() { return this.#rotation; }
}
