class Deque{
    constructor(){
        this.deque = [];

    }
    push(element){
        this.deque.push(element);
    }

    pop(){
        return this.deque.pop();
    }

    shift(){
        return this.deque.shift();
    }

    unshift(element){
        this.deque.unshift(element);
    }

    peekFront(){
        if (this.deque.length === 0){
            return null;
        }
        return this.deque[0];
    }

    peekFrontNext(){
        if (this.deque.length === 0){
            return null;
        }
        return this.deque[1];
    }

    peekBack(){
        if (this.deque.length === 0){
            return null;
        }
        return this.deque[this.deque.length - 1];
    }

    peekBackPrev(){
        if (this.deque.length === 0){
            return null;
        }
        return this.deque[this.deque.length - 2];
    }

    length(){
        return this.deque.length;
    }
}

export {Deque} ;