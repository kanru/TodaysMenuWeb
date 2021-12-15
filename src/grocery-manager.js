/* eslint-disable no-prototype-builtins */

export const IngredientCategory = ["未知", "蔬菜", "肉", "海鮮", "其他", "主食", "調味料"];

export class GroceryManager {

    constructor(categories) {
        this.groceryCategory = categories;
    }

    _getCategory(ingredient) {
        if (!this.groceryCategory.hasOwnProperty(ingredient)) {
            return IngredientCategory[0];
        }
        return this.groceryCategory[ingredient];
    }

    aggregate(dishes) {
        let groceries = {};
        dishes.map((dish) => {
            dish.ingredient.map(ingred => {
                if (ingred.description === undefined) {
                    return;
                }
                let category = this._getCategory(ingred.description);
                if (!groceries.hasOwnProperty(category)) {
                    groceries[category] = {};
                }
                if (!groceries[category].hasOwnProperty(ingred.description)) {
                    groceries[category][ingred.description] = [[ingred.quantity, dish.name]];
                } else {
                    groceries[category][ingred.description].push([ingred.quantity, dish.name]);
                }
            })
        });
        return groceries;
    }

}