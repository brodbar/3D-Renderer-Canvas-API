export default class Vertice
{
    constructor([x, y, z], offset)
    {
        Object.assign(this, { x: x * 1, y : y * 1, z : z * 1});
        this.SetOffset(offset);
    }

    SetOffset({x, y, z})
    {
        this.x += x;
        this.y += y;
        this.z += z;
    }
}