/*
    No need to calculate rotation angles
*/

const sin = (deg) => Math.sin(deg * Math.PI / 180);
const cos = (deg) => Math.cos(deg * Math.PI / 180);

export class Quaternion
{
    constructor(w, i, j, k)
    {
        Object.assign(this, { w, i, j, k });
    }

    static FromEulerAngles(yaw, pitch, roll)
    {
        const cy = cos(yaw * 0.5);
        const cp = cos(pitch * 0.5);
        const cr = cos(roll * 0.5);
        const sy = sin(yaw * 0.5);
        const sp = sin(pitch * 0.5);
        const sr = sin(roll * 0.5);

        return new Quaternion(
            cr * cp * cy + sr * sp * sy,
            sr * cp * cy - cr * sp * sy,
            cr * sp * cy + sr * cp * sy,
            cr * cp * sy - sr * sp * cy
        );
    }

    Conjugate()
    {
        return new Quaternion(this.w, -this.i, -this.j, -this.k);
    }
}

function HamiltonProduct(A, B)
{
    const [a1, b1, c1, d1] = [A.w, A.i, A.j, A.k];
    const [a2, b2, c2, d2] = [B.w, B.i, B.j, B.k];

    return {
        w: a1 * a2 - b1 * b2 - c1 * c2 - d1 * d2,
        i: a1 * b2 + b1 * a2 + c1 * d2 - d1 * c2,
        j: a1 * c2 - b1 * d2 + c1 * a2 + d1 * b2,
        k: a1 * d2 + b1 * c2 - c1 * b2 + d1 * a2
    };
}

class Vector3
{
    static avg(vecs)
    {
        return vecs.reduce((a, b) => new Vector3(a.x + b.x, a.y + b.y, a.z + b.z)).mult(1/vecs.length);
    }

    static avg2(vecs)
    {
        return new Vector3(
            (vecs[0].x + vecs[1].x + vecs[2].x) * 0.333,
            (vecs[0].y + vecs[1].y + vecs[2].y) * 0.333,
            (vecs[0].z + vecs[1].z + vecs[2].z) * 0.333
        );
    }

    static get ZERO()
    {
        return new Vector3(0, 0, 0);
    }

    static from({x, y, z})
    {
        return new Vector3(x, y, z);
    }

    static mult(vec, value)
    {
        return new Vector3(vec.x * value, vec.y * value, vec.z * value);
    }

    static sub(a, b)
    {
        return new Vector3(b.x - a.x, b.y - a.y, b.z - a.z);
    }

    static add(a, b)
    {
        return new Vector3(b.x + a.x, b.y + a.y, b.z + a.z);
    }

    static distance(a, b)
    {
        return Vector3.length(Vector3.sub(a, b));
    }

    static length(vec)
    {
        const { x, y, z } = vec;
        return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
    }

    static rotate(yAxis, zAxis, vec)//yaw, pitch, roll, vec)
    {
        const sin = (deg) => Math.sin(deg * Math.PI / 180);
        const cos = (deg) => Math.cos(deg * Math.PI / 180);
        /**let x = cos(yaw) * cos(pitch) * vec.x + (cos(yaw) * sin(pitch) * sin(roll) - sin(yaw) * cos(roll)) * vec.y + (cos(yaw) * sin(pitch) * cos(roll) + sin(yaw) * sin(roll)) * vec.z
        let y = sin(yaw) * sin(pitch) * vec.x + (sin(yaw) * sin(pitch) * sin(roll) + cos(yaw) * cos(roll)) * vec.y + (sin(yaw) * sin(pitch) * cos(roll) - cos(yaw) * sin(roll)) * vec.z;
        let z = -sin(pitch) * vec.x + cos(pitch) * sin(roll) * vec.y + cos(pitch) * cos(roll) * vec.z; */
        let x = vec.x * cos(zAxis) * cos(yAxis) - vec.y * sin(zAxis) + vec.z * cos(zAxis) * sin(yAxis);
        let y = vec.x * sin(zAxis) * cos(yAxis) + vec.y * cos(zAxis) + vec.z * sin(zAxis) * sin(yAxis);
        let z = -vec.x * sin(yAxis) + vec.z * cos(yAxis);
        return new Vector3(x, y, z);
    };


    static qpq(Quaternion, Point)
    {
        const First = HamiltonProduct(Quaternion, Point);
        return HamiltonProduct(First, Quaternion.Conjugate());
    }

    static FromComplex({i, j, k})
    {
        return new Vector3(i, j, k);
    }

    ToComplex()
    {
        return { w: 0, i: this.x, j: this.y, k: this.z };
    }

    static rotateWithEuler(yaw, pitch, roll, vec)
    {
        const Qua = Quaternion.FromEulerAngles(yaw, pitch, roll);

        const Q = HamiltonProduct(Qua, vec.ToComplex());
        return Vector3.FromComplex(HamiltonProduct(Q, Qua.Conjugate()));
    }

    static rotateWithQuaternion(w, i, j, k, vec)
    {
        const Qua = new Quaternion(w, i, j, k);
        const Q = HamiltonProduct(Qua, vec.ToComplex());
        return Vector3.FromComplex(HamiltonProduct(Q, Qua.Conjugate()));
    }

    static rotate3d(yaw, pitch, roll, vec)//yaw, pitch, roll, vec)
    {
        const Matrix = [
            [cos(pitch) * cos(roll), sin(yaw) * sin(pitch) * cos(roll) - cos(yaw) * sin(roll), cos(yaw) * sin(pitch) * cos(roll) + sin(yaw) * sin(roll)],
            [cos(pitch) * sin(roll), sin(yaw) * sin(pitch) * sin(roll) + cos(yaw) * cos(roll), cos(yaw) * sin(pitch) * sin(roll) - sin(yaw) * cos(roll)],
            [-sin(pitch), sin(yaw) * cos(pitch), cos(yaw) * cos(pitch)]
        ];
        const x = Matrix[0][0] * vec.x + Matrix[0][1] * vec.y + Matrix[0][2] * vec.z;
        const y = Matrix[1][0] * vec.x + Matrix[1][1] * vec.y + Matrix[1][2] * vec.z;
        const z = Matrix[2][0] * vec.x + Matrix[2][1] * vec.y + Matrix[2][2] * vec.z;
        return new Vector3(x, y, z);
    };

    /**
     * 
     * @param { float } x 
     * @param { float } y 
     * @param { float } z 
     */
    constructor(x, y, z = 0)
    {
        this.set(x, y, z);
    }

    get length() 
    {
        return Vector3.length(this);
    }

    get unit()
    {
        const { length } = this;
        return Vector3.mult(this, 1 / length);
    }

    avg()
    {
        return Vector3.avg2([this.x, this.y, this.z]);
    }
    
    set(x, y, z)
    {
        Object.assign(this, {x, y, z});
    }

    sub(vec)
    {
        this.x -= vec.x;
        this.y -= vec.y;
        this.z -= vec.z;
    }

    add(vec)
    {
        this.x += vec.x;
        this.y += vec.y;
        this.z += vec.z;
    }

    distance(point)
    {
        return Vector3.distance(this, point);
    }

    get reverse()
    {
        return Vector3.mult(this, -1);
    }


    mult(value)
    {
        return new Vector3(this.x * value, this.y * value, this.z * value);
    }

    rotate(yAxis, zAxis)
    {
        if(isNaN(yAxis * zAxis))
            throw new TypeError(`Undefined argument in { yAxis: ${yAxis}, zAxis: ${zAxis} }`);
        
        const sin = (deg) => Math.sin(deg * Math.PI / 180);
        const cos = (deg) => Math.cos(deg * Math.PI / 180);
        const {x, y, z} = this;
        this.x = x * cos(zAxis) * cos(yAxis) - y * sin(zAxis) + z * cos(zAxis) * sin(yAxis);
        this.y = x * sin(zAxis) * cos(yAxis) + y * cos(zAxis) + z * sin(zAxis) * sin(yAxis);
        this.z = -x * sin(yAxis) + z * cos(yAxis);
    }

    dotProduct(point, sign = false)
    {
        const dot = this.x * point.x + this.y * point.y + this.z * point.z;
        return sign ? Math.sign(dot) : dot;
    }

    crossProduct(vec, unit = false)
    {
        
        const x = this.y * vec.z - this.z * vec.y;
        const y = this.z * vec.x - this.x * vec.z;
        const z = this.x * vec.y - this.y * vec.x;
        const res = new Vector3(x, y, z);
            
        return unit ? res.unit : res;
    }
}

export { Vector3 };
