export class Timer {
    constructor(deltaTime = 1/60) {
        this.lastTime;
        this.accumulatedTime = 0;
        this.tick = 0;
        this.canPause = true;

        this.update = (time) => {
            this.callback(deltaTime);
            if(this.lastTime)
            {
                document.querySelector("#FPS").textContent = `${Math.floor(1000 / (performance.now() - this.lastTime))} FPS`;
            }
            /**if(this.lastTime) {
                this.accumulatedTime += (time - this.lastTime) / 1000;
                while(this.accumulatedTime > deltaTime) {
                    this.callback(deltaTime);
                    this.accumulatedTime -= deltaTime;
                    this.tick++;
                    if(this.tick > 500 && this.canPause)
                    {
                        this.pause();
                        return;
                    }
                }
            }
            this.lastTime = time; */
            this.lastTime = performance.now();
            this.enqueue();
        }

        ["keydown", "mousemove", "mousedown"].forEach(e => {
            window.addEventListener(e, () => {
                this.tick = 0;
                if(this.paused)
                {
                    this.paused = false;
                    this.start();
                }
            });
        });
    }

    evoke(callback) {
        this.callback = callback;
        this.start();
    }

    enqueue() {
        requestAnimationFrame(this.update);
    }
    
    pause()
    {
        this.lastTime = 0;
        this.accumulatedTime = 0;
        this.paused = true;
    }

    start() {
        this.enqueue();        
    }
}
