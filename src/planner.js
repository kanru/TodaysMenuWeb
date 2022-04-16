import { DishPool } from './dish-pool.js';

class Planner {
    selected = [];
    days = 0;

    constructor(days) {
        this.days = days;
    }

    isSuppressed(dish) {
        return dish.suppressed === undefined ? false : dish.suppressed;
    }

    isOneDish(dish) {
        return dish.one_dish === undefined ? false : dish.one_dish;
    }

    isSoup(dish) {
        return dish.soup === undefined ? false : dish.soup;
    }

    ingredientsContainMeat(dish) {
        return dish.ingredients.find(item => ["肉", "海鮮"].includes(item.ingredient.category)) != undefined;
    }

    ingredientsContainVegetable(dish) {
        return dish.ingredients.find(item => ["蔬菜"].includes(item.ingredient.category)) != undefined;
    }

    isMeat(dish) {
        return !this.isOneDish(dish) && !this.isSoup(dish) && this.ingredientsContainMeat(dish);
    }

    isVegetable(dish) {
        return !this.isOneDish(dish) && !this.isSoup(dish) && !this.ingredientsContainMeat(dish) && this.ingredientsContainVegetable(dish);
    }

    cookTime(dish) {
        return dish.cook_time === undefined ? 0 : dish.cook_time;
    }
}

export class LunchPlanner extends Planner {
    constructor(inputDishes, days) {
        super(days);
        let dishes = inputDishes.filter(dish => !this.isSuppressed(dish));
        if (dishes.length == 0) {
            throw new Error("Need at least one dish!");
        }
        this.pool = new DishPool(dishes);
    }


    randomInit() {
        this.selected = [];
        for (let i = 0; i < this.days; ++i) {
            this.selected.push([this.pool.next()]);
        }

        this.selected.sort((a, b) => this.cookTime(a[0]) - this.cookTime(b[0]));

        return this.selected;
    }

    pickNext(index) {
        this.selected[index] = [this.pool.next()];
        return this.selected[index];
    }

}

export class DinnerPlanner extends Planner {
    constructor(inputDishes, days) {
        super(days);
        let dishes = inputDishes.filter(dish => !this.isSuppressed(dish));
        if (dishes.length == 0) {
            throw new Error("Need at least one dish!");
        }
        // FIXME: the pool separation is incomplete. It doesn't consider all dish characteristic.
        this.oneDishPool = new DishPool(dishes.filter(dish => this.isOneDish(dish)));
        this.meatPool = new DishPool(dishes.filter(dish => this.isMeat(dish)));
        this.vegetablePool = new DishPool(dishes.filter(dish => this.isVegetable(dish)));
    }

    isSuppressed(dish) {
        return dish.suppressed == 1;
    }

    randomInit() {
        this.selected = [];
        for (let i = 0; i < this.days; ++i) {
            this.selected.push(this.getOne());
        }

        return this.selected;
    }

    getOne() {
        // FIXME: the logic assumes either oneDishPool or non-oneDishPool won't be empty,
        // which is incorrect. They could all be empty.
        if (!this.oneDishPool.isEmpty() && Math.floor(Math.random() * 100) % 2) {
            return [this.oneDishPool.next()];
        }
        if (this.meatPool.isEmpty() || this.vegetablePool.isEmpty()) {
            return [];
        }
        let first = this.meatPool.next();
        let second = this.vegetablePool.next();
        if (first == second) {
            second = this.vegetablePool.next();
        }
        return [first, second];

    }

    pickNext(index) {
        this.selected[index] = this.getOne();
        return this.selected[index];
    }
}