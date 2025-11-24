// p5Interop.js
// ES module exported functions
let _p5Instance = null;
let _containerElement = null;
let resizeObserver = null;

// -----------------------------------------------------------------------------
// Utility exports
// -----------------------------------------------------------------------------
export function setSpeed(multiplier) {
    vx *= multiplier;
    vy *= multiplier;
}

export function setColorCycle(enable) {
    colorCycle = enable;
}

// -----------------------------------------------------------------------------
// Main sketch start
// -----------------------------------------------------------------------------
export function startDVDSketch(elementId, imageUrl, width, height) {
    // If a sketch already exists, remove it first
    if (_p5Instance) {

        try {
            _p5Instance.remove();
        } catch (e) {
            console.warn('failed to remove existing p5 instance', e);
        }
        _p5Instance = null;
        _containerElement = null;
    }

    if (resizeObserver) {
        try {
            resizeObserver.disconnect();
        } catch (e) {
            console.warn('failed to disconnect resize observer', e);
        }
        resizeObserver = null;
    }

    _containerElement = document.getElementById(elementId);
    if (!_containerElement) {
        console.error(`startDVDSketch: element with id '${elementId}' not found`);
        return;
    }

    const sketch = (p) => {
        let img;
        let x = 0, y = 0;
        let vx = 3.5, vy = 2.7;
        let imgW = 120, imgH = 60; // fallback sizes

        let brbText = "BRB";
        let brbFontSize = 74;
        let brbPadding = 20;

        let brbW, brbH;  // text box size
        let brbX, brbY;  // centered position

        // tint values
        p.tintR = 255;
        p.tintG = 255;
        p.tintB = 255;

        // mode toggle
        p.colorCycle = false;

        p.preload = () => {
            if (imageUrl) img = p.loadImage(imageUrl);
        };


        p.setup = () => {
            const w = (width && width > 0) ? width : _containerElement.clientWidth;
            const h = (height && height > 0) ? height : _containerElement.clientHeight;
            const cnv = p.createCanvas(w, h);
            cnv.parent(elementId);


            if (img) {
                // If image already loaded, adapt sizes
                imgW = p.min(img.width, 320);
                imgH = (imgW / img.width) * img.height;
            }


            x = p.random(0, p.width - imgW);
            y = p.random(0, p.height - imgH);


            // give a slight random velocity so it doesn't always go same direction
            vx = (Math.random() > 0.5 ? 1 : -1) * (2.5 + Math.random() * 0.6);
            vy = (Math.random() > 0.5 ? 1 : -1) * (2.0 + Math.random() * 0.6);

            p.noSmooth();

            p.textSize(brbFontSize);
            brbW = p.textWidth(brbText) + brbPadding * 2;
            brbH = brbFontSize + brbPadding * 2;

            brbX = (p.width - brbW) / 2;
            brbY = (p.height - brbH) / 2;
        };


        p.draw = () => {
            // simple black background — you can change to whatever
            p.background(0);

            // color cycle mode
            if (p.colorCycle) {
                const t = p.millis() * 0.0005;
                p.tintR = (Math.sin(t) * 127 + 128);
                p.tintG = (Math.sin(t + 2) * 127 + 128);
                p.tintB = (Math.sin(t + 4) * 127 + 128);
            }


            // DRAW BRB TEXT (centered)
            p.fill(255);
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(brbFontSize);

            // optional: semi-transparent dark background box
            p.noStroke();
            p.fill(0, 150);
            p.rect(brbX, brbY, brbW, brbH, 10);

            p.fill(255);
            p.text(brbText, brbX + brbW / 2, brbY + brbH / 2);


            // draw image with tint
            p.push();
            p.tint(p.tintR, p.tintG, p.tintB);

            if (img) {
                p.image(img, x, y, imgW, imgH);
            } else {
                p.fill(p.tintR, p.tintG, p.tintB);
                p.rect(x, y, imgW, imgH);
            }
            p.pop();


            x += vx;
            y += vy;

            let bounced = false;

            if (x <= 0) { x = 0; vx *= -1; bounced = true; }
            if (y <= 0) { y = 0; vy *= -1; bounced = true; }
            if (x + imgW >= p.width) { x = p.width - imgW; vx *= -1; bounced = true; }
            if (y + imgH >= p.height) { y = p.height - imgH; vy *= -1; bounced = true; }

            // per-bounce random tint
            if (bounced && !p.colorCycle) {
                p.tintR = p.random(255);
                p.tintG = p.random(255);
                p.tintB = p.random(255);
            }

            // --- COLLISION WITH BRB TEXT BOX ---
            let nextX = x + vx;
            let nextY = y + vy;

            let dvdRight = nextX + imgW;
            let dvdBottom = nextY + imgH;

            let brbRight = brbX + brbW;
            let brbBottom = brbY + brbH;

            let hit = false;

            // AABB collision
            if (dvdRight > brbX &&
                nextX < brbRight &&
                dvdBottom > brbY &&
                nextY < brbBottom) {

                // Determine whether to bounce horizontally or vertically
                let overlapX = Math.min(dvdRight - brbX, brbRight - nextX);
                let overlapY = Math.min(dvdBottom - brbY, brbBottom - nextY);

                if (overlapX < overlapY) {
                    vx *= -1; // horizontal bounce
                } else {
                    vy *= -1; // vertical bounce
                }

                hit = true;
            }

            // If hit + not color cycle → random tint
            if (hit && !p.colorCycle) {
                p.tintR = p.random(255);
                p.tintG = p.random(255);
                p.tintB = p.random(255);
            }
        };

        p.windowResized = () => {
            const w = _containerElement.clientWidth;
            const h = _containerElement.clientHeight;
            p.resizeCanvas(w, h);

            brbX = (w - brbW) / 2;
            brbY = (h - brbH) / 2;
        };
    };


    // create and keep a reference to the p5 instance
    _p5Instance = new p5(sketch);

    resizeObserver = new ResizeObserver(() => {
        if (_p5Instance) {
            const w = _containerElement.clientWidth;
            const h = _containerElement.clientHeight;
            _p5Instance.resizeCanvas(w, h);
        }
    });
    resizeObserver.observe(_containerElement);
}

export function toggleColorCycle(enable) {
    colorCycle = enable;
}

export function stopDVDSketch() {
    if (_p5Instance) {
        try { _p5Instance.remove(); } catch (e) { console.warn('failed to remove p5 instance', e); }
        if (resizeObserver) {
            try { resizeObserver.disconnect(); } catch { }
            resizeObserver = null;
        }
        _p5Instance = null;
        _containerElement = null;
    }
}