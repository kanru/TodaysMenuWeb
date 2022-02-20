/* eslint-disable react/jsx-key */
/* eslint-disable no-prototype-builtins */
import { ApolloClient, ApolloProvider, InMemoryCache, useQuery } from "@apollo/client";
import { CssBaseline } from '@mui/material';
import { blue, grey } from '@mui/material/colors';
import Grid from '@mui/material/Grid';
import { createTheme, styled, StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import moment from 'moment';
import pako from 'pako';
import { Component, render } from 'preact';
import Router from 'preact-router';
import MyAppBar from './appbar-view.jsx';
import DishList from './dish-pool.js';
import FileManager from './file-manager.js';
import GroceryManager from './grocery-manager.js';
import GroceryView from './grocery-view.jsx';
import FormDialog from './manual-input.jsx';
import EditDishForm from './edit-dish.jsx';
import MenuUtil from './menu-util.js';
import DayMenu from './menu-view.jsx';
import { DinnerPlanner, LunchPlanner } from './planner.js';
import { GetDishes, GetIngredients, GetShareableMenu, ShareMenu } from './query.graphql';
import ShareDialog from './share-dialog.jsx';

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

class App extends Component {

    state = {
        share: false,
        showForm: false,
        formIndex: 0,
        formMeal: "",
        formDishNames: [],
        showEditDish: false,
        editingDish: {},
    }

    constructor({ link }) {
        super();
        this.allDishes = { dishes: [] };
        this.allIngredients = [];
        if (typeof window !== "undefined") {
            Promise.all(
                [
                    client.query({ query: GetDishes })
                        .then(result => this.initDishes(result.data.dishes)),
                    client.query({ query: GetIngredients })
                        .then(result => this.initGrocery(result.data.ingredients))
                ])
                .then(() => {
                    if (link) {
                        client.query({ query: GetShareableMenu, variables: { key: link } })
                            .then(result => {
                                this.decodeMenu(result.data.shareableMenu.payload);
                            });
                    } else {
                        this.generateMenu();
                    }
                });
        }
        this.loadMenu = this.loadMenu.bind(this);
        this.saveMenu = this.saveMenu.bind(this);
        this.shareMenu = this.shareMenu.bind(this);
        this.closeShare = this.closeShare.bind(this);
        this.onManualInputCancel = this.onManualInputCancel.bind(this);
        this.onManualInputConfirm = this.onManualInputConfirm.bind(this);
        this.onManualInputUpdate = this.onManualInputUpdate.bind(this);
        this.onEditDishCancel = this.onEditDishCancel.bind(this);
        this.onEditDishChange = this.onEditDishChange.bind(this);
        this.onEditDishConfirm = this.onEditDishConfirm.bind(this);
    }

    initDishes(data) {
        this.allDishes = new DishList(data);
        this.lunchPlanner = new LunchPlanner(data.filter(dish => (!dish.meal || dish.meal == "lunch")), DAYS);
        this.dinnerPlanner = new DinnerPlanner(data.filter(dish => (!dish.meal || dish.meal == "dinner")), DAYS);
    }

    initGrocery(ingredients) {
        this.allIngredients = ingredients;
        this.groceryCategoryList = ingredients.reduce((retList, ingredient) =>
            retList.concat(ingredient.category), []);
        this.groceryManager = new GroceryManager();
    }

    bindMenuActions(menu) {
        menu.forEach((item, index) => {
            item.nextLunchCallback = this.pickNextDish.bind(this, index, "lunch");
            item.nextDinnerCallback = this.pickNextDish.bind(this, index, "dinner");
            item.overrideLunchCallback = this.showInputDishesForm.bind(this, index, "lunch");
            item.overrideDinnerCallback = this.showInputDishesForm.bind(this, index, "dinner");
            item.showEditDishCallback = this.showEditDishForm.bind(this);
        });
        return menu;
    }

    decodeMenu(payload) {
        let compressed = window.atob(window.decodeURIComponent(payload));
        let data = JSON.parse(pako.inflate(compressed, { to: 'string' }));
        let menu = this.bindMenuActions(data);
        this.setState({ menu }, () => this.aggregateGroceries());
    }

    generateMenu() {
        let lunch = this.lunchPlanner.randomInit();
        let dinner = this.dinnerPlanner.randomInit();
        let menu = this.bindMenuActions(MenuUtil.composeMenu(startDate, DAYS, lunch, dinner));
        this.setState({ menu }, () => this.aggregateGroceries());
    }

    pickNextDish(index, meal) {
        const { menu = [] } = this.state;
        if (meal == "lunch") {
            menu[index].lunch = MenuUtil.cleanMealForView(this.lunchPlanner.pickNext(index));
        } else {
            menu[index].dinner = MenuUtil.cleanMealForView(this.dinnerPlanner.pickNext(index));
        }
        this.setState({ menu }, () => this.aggregateGroceries());
    }

    showInputDishesForm(index, meal) {
        const { menu = [] } = this.state;
        let formDishNames = menu[index][meal].map(dish => dish.name);
        this.setState({ showForm: true, formIndex: index, formMeal: meal, formDishNames });
    }

    onManualInputCancel() {
        this.setState({ showForm: false });
    }

    onManualInputConfirm() {
        this.manualSetDish(this.state.formIndex, this.state.formMeal, this.state.formDishNames);
        this.setState({ showForm: false });
    }

    onManualInputUpdate(_event, values) {
        this.setState({ formDishNames: values });
    }

    manualSetDish(index, meal, names) {
        if (!names) {
            return;
        }
        const { menu = [] } = this.state;
        let dishes = names.map(name => this.allDishes.lookupByName(name)).filter(dish => dish != null);
        if (dishes.length == 0) {
            return;
        }
        menu[index][meal] = MenuUtil.cleanMealForView(dishes);
        this.setState({ menu }, () => this.aggregateGroceries());
    }

    showEditDishForm(name) {
        let editingDish = this.allDishes.lookupByName(name);
        this.setState({ showEditDish: true, editingDish });
    }

    onEditDishCancel() {
        this.setState({ showEditDish: false });
    }

    onEditDishChange(editingDish) {
        this.setState({ editingDish });
    }

    onEditDishConfirm(dish) {
        // TODO: update backend dish and ingredient
        this.allDishes.update(dish);
        dish.ingredients.forEach((element) => {
            if (!this.allIngredients.find((item) => item.name === element.ingredient.name)) {
                this.allIngredients = this.allIngredients.concat([element.ingredient]);
            }
        });
        // TODO: will need to update planner's dish pool too when we can update other dish details
        this.setState({ showEditDish: false });
        this.aggregateGroceries();
    }

    aggregateGroceries() {
        const { menu = [] } = this.state;
        let dishes = MenuUtil.extractDishes(menu)
            .reduce((list, dish) => list.concat([this.allDishes.lookupByName(dish.name)]), []);
        const groceries = this.groceryManager.aggregate(dishes);
        this.setState({ groceries });
    }

    saveMenu() {
        const { menu = [] } = this.state;
        FileManager.saveJson(menu, 'todays_menu.json');
    }

    loadMenu() {
        FileManager.loadJson((data) => {
            let menu = this.bindMenuActions(data);
            this.setState({ menu }, () => this.aggregateGroceries());
        });
    }

    shareMenu() {
        const { menu = [] } = this.state;
        let compressed = pako.deflate(JSON.stringify(menu), { to: 'string' });
        let payload = window.encodeURIComponent(window.btoa(compressed));
        client.mutate({ mutation: ShareMenu, variables: { menu: { payload } } })
            .then(result => {
                this.setState({ share: true, url: `${location.origin}/m/${result.data.shareMenu.key}` });
            });
    }

    closeShare() {
        this.setState({ share: false });
    }

    render({ }, { menu = [], groceries = {}, share, url }) {

        return (
            <StyledEngineProvider injectFirst>
                <CssBaseline />
                <ThemeProvider theme={theme}>
                    <div>
                        <MyAppBar onClickLoadMenu={this.loadMenu} onClickSaveMenu={this.saveMenu}
                            onClickShareMenu={this.shareMenu} />
                        <FormDialog open={this.state.showForm}
                            defaultValue={this.state.formDishNames}
                            options={this.allDishes.dishes.map(dish => dish.name)}
                            onCancel={this.onManualInputCancel}
                            onClose={this.onManualInputConfirm}
                            onChange={this.onManualInputUpdate} />
                        <EditDishForm
                            open={this.state.showEditDish}
                            defaultValue={this.state.editingDish}
                            options={this.allIngredients}
                            onCancel={this.onEditDishCancel}
                            onClose={this.onEditDishConfirm}
                            onChange={this.onEditDishChange}
                        />
                        <div style={{ padding: 5 }}>
                            <Grid container spacing={3} alignItems="flex-start" justifyContent="center">
                                <Grid container item xs={12} md={6} lg={5} spacing={2}>
                                    {menu.map(item => <DayMenu item={item} />)}
                                </Grid>
                                <Grid item xs={12} md={6} lg={5}>
                                    {this.groceryCategoryList && this.groceryCategoryList
                                        .filter(category => groceries[category])
                                        .map(category =>
                                            <GroceryView category={category} items={groceries[category]} />)}
                                </Grid>
                            </Grid>
                        </div>
                        <ShareDialog open={share} url={url} onClose={this.closeShare} />
                    </div>
                </ThemeProvider>
            </StyledEngineProvider>
        );
    }
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