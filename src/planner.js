import { DishPool } from './dish-pool.js';

const DAYS = 7;

export class LunchPlanner {
    selected = [];
    history = [];

    constructor(inputDishes) {
        let dishes = inputDishes.filter(dish => !this.isSuppressed(dish));
        this.pool = new DishPool(dishes);
    }

    isSuppressed(dish) {
        return dish.suppressed == 1;
    }

    randomInit() {
        this.selected = [];
        for (let i = 0; i < DAYS; ++i) {
            this.selected.push([this.pool.next()]);
        }
        this.selected.sort((a, b) => a[0].cook_time - b[0].cook_time);

        return this.selected;
    }

    pickNext(index) {
        this.selected[index] = [this.pool.next()];
        return this.selected[index];
    }

    // deprecated
    setHistory(historyData) {
        this.history = historyData.flat().reduce((list, dish) => list.concat([dish.name]), []);
        this.pool.weighted(this.history);
    }
}

export class DinnerPlanner {
    selected = [];

    constructor(inputDishes) {
        let dishes = inputDishes.filter(dish => !this.isSuppressed(dish));
        this.soloPool = new DishPool(dishes.filter(dish => this.isSolo(dish)));
        this.meatPool = new DishPool(dishes.filter(dish => this.isMeat(dish)));
        this.vegePool = new DishPool(dishes.filter(dish => this.isVege(dish)));
    }

    isSuppressed(dish) {
        return dish.suppressed == 1;
    }

    isSolo(dish) {
        return dish.solo == 1;
    }

    isSoup(dish) {
        return dish.soup == 1;
    }

    isMeat(dish) {
        return !this.isSolo(dish) && !this.isSoup(dish) && 
                (dish.meat >= 0.5 || dish.seafood >= 0.5);
    }

    isVege(dish) {
        return !this.isSolo(dish) && !this.isSoup(dish) && 
                (dish.meat < 0.5 && dish.seafood < 0.5);
    }

    randomInit() {
        this.selected = [];
        for (let i = 0; i < DAYS; ++i) {
            this.selected.push(this.getOne());
        }

        return this.selected;
    }

    getOne() {
        if (Math.floor(Math.random() * 100) % 2) {
            return [this.soloPool.next()];
        }
        let first = this.meatPool.next();
        let second = this.vegePool.next();
        if (first == second) {
            second = this.vegePool.next();
        }
        return [first, second];

    }

    pickNext(index) {
        this.selected[index] = this.getOne();
        return this.selected[index];
    }

    // deprecated
    setHistory(historyData) {
        this.history = historyData.flat().reduce((list, dish) => list.concat([dish.name]), []);
        this.soloPool.weighted(this.history);
        this.meatPool.weighted(this.history);
        this.vegePool.weighted(this.history);
    }
}