export class AnimatedText{
    constructor(message, displayDuration, fadeDuration) {
        this.startTime = 0;
        this.displayDuration = displayDuration;
        this.fadeDuration = fadeDuration;
        this.message = message;
        this.ended = false;
    }

    start(p){
        this.startTime = p.millis();
    }

    draw(p) {
        if (this.startTime === 0) this.start(p);
        let elapsedTime = p.millis() - this.startTime;

        // opacity computing
        let alpha = 0;
        if (elapsedTime < this.fadeDuration) {
            // fade in
            alpha = p.map(elapsedTime, 0, this.fadeDuration, 0, 255);
        } else if (elapsedTime < this.displayDuration - 2 * this.fadeDuration) {
            // maintain
            alpha = 255;
        } else if (elapsedTime < this.displayDuration) {
            // fade out
            alpha = p.map(elapsedTime, this.displayDuration - this.fadeDuration, this.displayDuration, 255, 0);
        }

        p.fill(84, 79, 99, alpha);
        p.stroke(84, 79, 99, alpha);
        p.text(this.message, p.width / 2, 10);

        // Arrêter l'animation après 5 secondes
        if (elapsedTime > this.displayDuration) {
            this.ended = true;
            //p.noLoop();
        }
    }

    isEnded(){
        return this.ended;
    }
}