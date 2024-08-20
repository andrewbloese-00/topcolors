const PARENT = i => Math.floor(i/2);
const LEFT = i => 2*i;
const RIGHT = i => 2*i + 1;

export class MaxHeap {
    constructor(compare_fn){
        this._compare = compare_fn;
        this.size = 0;
        this.items = [null]
    }
    insert(item){
        this.size++;
        this.items.push(item)
        this._heapifyUp()
    }

    extract(){
        if(this.size == 0) {
            console.error("Heap is Empty!")
            return { error: "heap empty"}
        }
        const max = this.items[1]
        this.items[1] = this.items[this.size]
        this.size--;
        this.items.pop();
        this._heapifyDown()
        return { value: max };
    }

    _getGreaterChild(i){
        const [l,r] = [LEFT(i), RIGHT(i)];
        if(r > this.size) return l;
        if(this._compare(this.items[l],this.items[r]) > 0) return l;
        return r; 
    }

    _heapifyUp(){
        let i = this.size; 
        let p = PARENT(i)
        while(p > 0){
            const child = this.items[i]
            const parent = this.items[p]
            if(this._compare(parent,child) < 0){
                this.items[p] = child;
                this.items[i] = parent;
            }
            i = p;
            p = PARENT(i);
        }
    }

    _heapifyDown(){
        let i = 1; 
        while(LEFT(i) <= this.size){
            const greater = this._getGreaterChild(i)
            const p = this.items[i]
            const c = this.items[greater]
            if(this._compare(p,c) < 0){
                this.items[i] = c;
                this.items[greater] = p;
            }
            i = greater
        }
    }


}