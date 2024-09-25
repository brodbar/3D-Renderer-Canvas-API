import { Vector3 } from "./Vector.js";

export class Line
{
    constructor(start, end)
    {
        const length = 1 / Vector3.length(Vector3.sub(start, end));
        this.v = new Vector3(
            (end.x - start.x) * length,
            (end.y - start.y) * length,
            (end.z - start.z) * length
            
        );
        this.start = start;
        this.end = end;
        this.x = (t) => start.x + this.v.x * t;
        this.y = (t) => start.y + this.v.y * t;
        this.z = (t) => start.z + this.v.z * t;
    }

    generatePoint(parameter)
    {
        return new Vector3(
            this.x(parameter),
            this.y(parameter),
            this.z(parameter)
        );
    }

    findParameter({ a, b, c, sum })
    {
        return -sum / (this.start.x * a + this.start.y * b + this.start.z * c);
        //return sum - (a * this.start.x + b * this.start.y + c * this.start.z) / (a * this.v.x + b * this.v.y + c * this.v.z);
    }
}
