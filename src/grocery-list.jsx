import { useQuery } from "@apollo/client";
import { Grid } from "@mui/material";
import GroceryManager from "./grocery-manager";
import GroceryView from "./grocery-view";
import MenuUtil from "./menu-util";
import { GetIngredients } from "./query.graphql";

export default function GroceryList(props) {

    const { data, loading } = useQuery(GetIngredients);

    if (loading) {
        return null;
    }

    const groceryManager = new GroceryManager();
    const groceryCategoryList = Array.from(data.ingredients
        .reduce((set, ingredient) => set.add(ingredient.category), new Set()));
    const dishes = MenuUtil
        .extractDishes(props.menu)
        .reduce((list, dish) => list.concat([props.allDishes.lookupByName(dish.name)]), []);
    const groceries = groceryManager.aggregate(dishes);

    return (
        <Grid item xs={12} md={6} lg={5}>
            {groceryCategoryList && groceryCategoryList
                .filter(category => groceries[category])
                .map(category =>
                    <GroceryView category={category} items={groceries[category]} />)}
        </Grid>
    );
}