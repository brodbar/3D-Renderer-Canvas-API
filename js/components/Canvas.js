class Canvas
{
    /**
     * 
     * @param { int } width 
     * @param { int } height 
     */
    constructor(width, height)
    {
        this.canvas = document.createElement('canvas');
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
        this.context = this.canvas.getContext('2d');
    }

    append()
    {
        document.body.appendChild(this.canvas);
    }

    arc(x, y, radius, color)
    {
        this.context.save();
        this.context.beginPath();
            this.context.fillStyle = color;
            this.context.arc(x, y, radius, 0, 2 * Math.PI);
            this.context.fill();
        this.context.closePath();
        this.context.restore();
    }
}

export { Canvas };
