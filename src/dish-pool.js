// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
Object.defineProperty(Array.prototype, 'shuffle', {
    value() {
        for (let i = this.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this[i], this[j]] = [this[j], this[i]];
        }
        return this;
    }
});

export default class DishList {
    constructor(dishes) {
        this.dishes = dishes;
    }

    length() {
        return this.dishes.length;
    }

    indexOf(index) {
        return this.dishes[index];
    }

    indexByName(name) {
        return this.dishes.findIndex((dish) => dish.name == name);
    }

    lookupByName(name) {
        const index = this.indexByName(name);
        if (index == -1) {
            return this.createByName(name);
        }
        return this.indexOf(index);
    }

    createByName(name) {
        let newDish = {};
        newDish.name = name;
        newDish.ingredients = [];
        this.dishes = this.dishes.concat(newDish);
        return newDish;
    }

    update(dish) {
        let updated = false;

        this.dishes = this.dishes.map(dishItem => {
            if (dish.name === dishItem.name ) {
                updated = true;
                return dish;
            }
            return dishItem;
        })
        if (!updated) {
            throw Error('Can not find the dish to update');
        }
    }
}

export class DishPool {

    constructor(dishes) {
        this.dishList = new DishList(dishes);
        this.candidates = (Array.from(Array(this.dishList.length()).keys())).shuffle();
        this.index = 0;
    }
    
    isEmpty() {
        return this.dishList.length() === 0;
    }

    next() {
        if (this.index == this.dishList.length()) {
            this.index = 0;
        }
        return this.dishList.indexOf(this.candidates[this.index++]);
    }

    weighted(namelist) {
        let indices = [];
        namelist.reverse().map((name) => {
            let index = this._lookup(name);
            if (index != -1 && !indices.includes(index)) {
                indices.push(index);
            }
        });
        let unweighted = this.candidates.filter(index => !indices.includes(index));
        this.candidates = unweighted.concat(indices.reverse());
        this.index = 0;
    }

    _lookup(name) {
        return this.dishList.indexByName(name);
    }
}