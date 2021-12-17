/* eslint-disable no-prototype-builtins */

export default class GroceryManager {
    _getCategory(ingredient) {
        if (!ingredient.category) {
            return "未知";
        }
        return ingredient.category;
    }

    aggregate(dishes) {
        let groceries = {};
        dishes.map((dish) => {
            dish.ingredients.map(recipeIngredient => {
                let ingredient = recipeIngredient.ingredient;
                if (ingredient.name === undefined) {
                    return;
                }
                let category = this._getCategory(ingredient);
                if (!groceries.hasOwnProperty(category)) {
                    groceries[category] = {};
                }
                if (!groceries[category].hasOwnProperty(ingredient.name)) {
                    groceries[category][ingredient.name] = [[recipeIngredient.quantity, dish.name]];
                } else {
                    groceries[category][ingredient.name].push([recipeIngredient.quantity, dish.name]);
                }
            })
        });
        return groceries;
    }

}