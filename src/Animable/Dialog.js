export class Dialog {
    constructor(messages) {
        this.messages = messages;
        this.current = 0;
    }

    draw(p, observer) {
        if (this.current < this.messages.length) {
            let txt = this.messages[this.current];
            txt.draw(p);
            if (txt.isEnded()) this.current += 1;
        } else {
            observer.notify()
        }
    }
}