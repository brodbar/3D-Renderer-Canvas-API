import { Vector3 } from "./Vector.js";

export class Plane
{
    constructor(normal, point)
    {
        this.normal = normal;
        this.point = point;
        this.x = (x) => normal.x * x;
        this.y = (y) => normal.y * y;
        this.z = (z) => normal.z * z;
        this.D = () => normal.dotProduct(Vector3.mult(point, -1));
    }

    get coefficients()
    {
        return {
            a: this.normal.x,
            b: this.normal.y,
            c: this.normal.z,
            sum: this.D()
        };
    }

    get length()
    {
        const { x, y, z } = this.normal;
        return Math.sqrt(Math.pow(x, 2) +  Math.pow(y, 2) + Math.pow(z, 2));
    }

    distance(point)
    {
        return Math.abs(this.x(point.x) + this.y(point.y) + this.z(point.z) + this.D()) / this.length;
    }


    distance2(point)
    {
        return (this.x(point.x) + this.y(point.y) + this.z(point.z) + this.D()) / this.length;
    }

    dotProduct(point)
    {
        return this.normal.dotProduct(Vector3.sub(this.point, point), true);
    }
}
