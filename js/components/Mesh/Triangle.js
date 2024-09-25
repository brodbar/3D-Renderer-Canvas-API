import { Vector3 } from "../Vector.js";

export default class Triangle
{
    constructor([a, b, c])
    {
        this.points =
        [
            new Vector3(a.x, a.y, a.z),
            new Vector3(b.x, b.y, b.z),
            new Vector3(c.x, c.y, c.z),
        ];
    }
}