/* eslint-disable react/jsx-key */
/* eslint-disable no-prototype-builtins */
import { ApolloClient, ApolloProvider, InMemoryCache, useQuery, useMutation } from "@apollo/client";
import { CssBaseline, Grid } from '@mui/material';
import { blue, grey } from '@mui/material/colors';
import { createTheme, styled, StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import moment from 'moment';
import pako from 'pako';
import { render } from 'preact';
import Router from 'preact-router';
import MyAppBar from './appbar-view.jsx';
import DishList from './dish-pool.js';
import FileManager from './file-manager.js';
import FormDialog from './manual-input.jsx';
import EditDishForm from './edit-dish.jsx';
import MenuUtil from './menu-util.js';
import { DinnerPlanner, LunchPlanner } from './planner.js';
import { GetDishes, GetShareableMenu, ShareMenu, UpdateDishes } from './query.graphql';
import ShareDialog from './share-dialog.jsx';
import { useState } from "preact/hooks";
import GroceryList from "./grocery-list.jsx";
import DayMenu from "./menu-view.jsx";

const client = new ApolloClient({
    // FIXME: the uri needs to be configurable
    uri: 'http://localhost:8080/graphql',
    cache: new InMemoryCache()
});

const startDate = moment().day(7); // coming sunday
const DAYS = 7;

const theme = createTheme({
    palette: {
        secondary: blue,
        appbar: {
            main: grey[300],
            contrastText: 'black'
        },
    }
});

function App(props) {

    const [state, setState] = useState({
        share: false,
        showForm: false,
        formIndex: 0,
        formMeal: "",
        formDishNames: [],
        showEditDish: false,
        editingDish: {},
        menu: undefined,
    });
    let [updateDishes] = useMutation(UpdateDishes, {
        refetchQueries: [
            GetDishes
        ]
    });

    // TODO handle props.link for shareable menu

    const decodeMenu = (payload) => {
        let compressed = window.atob(window.decodeURIComponent(payload));
        let data = JSON.parse(pako.inflate(compressed, { to: 'string' }));
        setState((currentState) => ({ ...currentState, menu: data }));
    }

    const generateMenu = () => {
        let lunch = lunchPlanner.randomInit();
        let dinner = dinnerPlanner.randomInit();
        setState((currentState) => ({ ...currentState, menu: MenuUtil.composeMenu(startDate, DAYS, lunch, dinner) }));
    }

    const pickNextDish = (index, meal) => {
        const menu = [...state.menu];
        if (meal == "lunch") {
            menu[index].lunch = MenuUtil.cleanMealForView(lunchPlanner.pickNext(index));
        } else {
            menu[index].dinner = MenuUtil.cleanMealForView(dinnerPlanner.pickNext(index));
        }
        setState((currentState) => ({ ...currentState, menu }));
    }

    const showInputDishesForm = (index, meal) => {
        const { menu } = state;
        let formDishNames = menu[index][meal].map(dish => dish.name);
        setState((currentState) => ({ ...currentState, showForm: true, formIndex: index, formMeal: meal, formDishNames }));
    }

    const onManualInputCancel = () => {
        setState((currentState) => ({ ...currentState, showForm: false }));
    }

    const onManualInputConfirm = () => {
        manualSetDish(state.formIndex, state.formMeal, state.formDishNames);
        setState((currentState) => ({ ...currentState, showForm: false }));
    }

    const onManualInputUpdate = (_event, values) => {
        setState((currentState) => ({ ...currentState, formDishNames: values }));
    }

    const manualSetDish = (index, meal, names) => {
        if (!names) {
            return;
        }
        const { menu } = state;
        let dishes = names.map(name => allDishes.lookupByName(name)).filter(dish => dish != null);
        if (dishes.length == 0) {
            return;
        }
        menu[index][meal] = MenuUtil.cleanMealForView(dishes);
    }

    const showEditDishForm = (name) => {
        let editingDish = allDishes.lookupByName(name);
        setState((currentState) => ({ ...currentState, showEditDish: true, editingDish }));
    }

    const onEditDishCancel = () => {
        setState((currentState) => ({ ...currentState, showEditDish: false }));
    }

    const onEditDishChange = (editingDish) => {
        setState((currentState) => ({ ...currentState, editingDish }));
    }

    const onEditDishConfirm = (dish) => {
        updateDishes({
            variables: {
                "dishes": [
                    {
                        name: dish.name,
                        ingredients: dish.ingredients.map(item => (
                            {
                                name: item.ingredient.name,
                                quantity: item.quantity
                            }
                        ))
                    }
                ]
            }
        });
        setState((currentState) => ({ ...currentState, showEditDish: false }));
    }

    const saveMenu = () => {
        const { menu } = state;
        FileManager.saveJson(menu, 'todays_menu.json');
    }

    const loadMenu = () => {
        FileManager.loadJson((data) => {
            setState((currentState) => ({ ...currentState, menu: data }));
        });
    }

    const shareMenu = () => {
        const { menu } = state;
        let compressed = pako.deflate(JSON.stringify(menu), { to: 'string' });
        let payload = window.encodeURIComponent(window.btoa(compressed));
        // client.mutate({ mutation: ShareMenu, variables: { menu: { payload } } })
        //     .then(result => {
        //         setState((currentState) => ({ ...currentState, share: true, url: `${location.origin}/m/${result.data.shareMenu.key}` }));
        //    });
    }

    const closeShare = () => {
        setState((currentState) => ({ ...currentState, share: false }));
    }

    let { data, loading } = useQuery(GetDishes);

    if (loading) {
        return;
    }

    const allDishes = new DishList(data.dishes);
    const lunchPlanner = new LunchPlanner(data.dishes.filter(dish => (!dish.meal || dish.meal == "lunch")), DAYS);
    const dinnerPlanner = new DinnerPlanner(data.dishes.filter(dish => (!dish.meal || dish.meal == "dinner")), DAYS);

    if (state.menu == undefined) {
        generateMenu();
        return;
    }

    return (
        <StyledEngineProvider injectFirst>
            <CssBaseline />
            <ThemeProvider theme={theme}>
                <div>
                    <MyAppBar
                        onClickLoadMenu={loadMenu}
                        onClickSaveMenu={saveMenu}
                        onClickShareMenu={shareMenu}
                    />
                    <FormDialog
                        open={state.showForm}
                        defaultValue={state.formDishNames}
                        options={allDishes.dishes.map(dish => dish.name)}
                        onCancel={onManualInputCancel}
                        onClose={onManualInputConfirm}
                        onChange={onManualInputUpdate}
                    />
                    <EditDishForm
                        open={state.showEditDish}
                        defaultValue={state.editingDish}
                        options={data.ingredients}
                        onCancel={onEditDishCancel}
                        onClose={onEditDishConfirm}
                        onChange={onEditDishChange}
                    />
                    <div style={{ padding: 5 }}>
                        <Grid container spacing={3} alignItems="flex-start" justifyContent="center">
                            <Grid container item xs={12} md={6} lg={5} spacing={2}>
                                {state.menu.map((item, index) =>
                                    <DayMenu
                                        editDishCallback={showEditDishForm}
                                        nextLunchCallback={() => pickNextDish(index, "lunch")}
                                        nextDinnerCallback={() => pickNextDish(index, "dinner")}
                                        overrideLunchCallback={() => showInputDishesForm(index, "lunch")}
                                        overrideDinnerCallback={() => showInputDishesForm(index, "dinner")}
                                        item={item}
                                    />)}
                            </Grid>
                            <GroceryList menu={state.menu} allDishes={allDishes} />
                        </Grid>
                    </div>
                    <ShareDialog open={state.share} url={state.url} onClose={closeShare} />
                </div>
            </ThemeProvider>
        </StyledEngineProvider>
    );
}

const Main = () => (
    <ApolloProvider client={client}>
        <Router>
            <App path="/" />
            <App path="/m/:link" />
        </Router>
    </ApolloProvider>
);

const PREFIX = 'index';

const classes = {
    root: `${PREFIX}-root`
};

const StyledMain = styled(Main)(() => ({
    [`& .${classes.root}`]: {
        flexGrow: 1,
    }
}));

render(<StyledMain />, document.body);