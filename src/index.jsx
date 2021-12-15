/* eslint-disable react/jsx-key */
/* eslint-disable no-prototype-builtins */
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
import { GroceryManager, IngredientCategory } from './grocery-manager.js';
import GroceryView from './grocery-view.jsx';
import FormDialog from './manual-input.jsx';
import MenuUtil from './menu-util.js';
import DayMenu from './menu-view.jsx';
import { DinnerPlanner, LunchPlanner } from './planner.js';
import Redirect from './redirect.js';
import ShareDialog from './share-dialog.jsx';


const startDate = moment().day(7); // coming sunday
const DAYS = 7;

const theme = createTheme({
    palette: {
        secondary: blue,
        appbar: {
            main: grey[300],
            contrastText: 'black'
        }
    },
    typography: {
        h1: {
            color: 'white',
            fontSize: '1.25rem',
            fontWeight: 500,
            letterSpacing: "0.0075em"
        },
        h2: {
            color: 'black',
            fontSize: '1.25rem',
            fontWeight: 500,
            letterSpacing: "0.0075em"
        },
    }
});

class App extends Component {

    state = {
        share: false,
        showForm: false,
        formIndex: 0,
        formMeal: "",
        formDishNames: []
    }

    constructor({ payload }) {
        super();
        this.allDishes = { dishes: [] };
        if (typeof window !== "undefined") {
            Promise.all(
                [
                    fetch('/assets/dishes.json')
                        .then(response => response.json())
                        .then(data => this.initMeal(data)),
                    fetch('/assets/ingredient-category.json')
                        .then(response => response.json())
                        .then(data => this.initGrocery(data))
                ])
                .then(() => {
                    if (payload) {
                        let compressed = window.atob(window.decodeURIComponent(payload));
                        let data = JSON.parse(pako.inflate(compressed, { to: 'string' }));
                        let menu = this.wrapMenu(data);
                        this.setState({ menu }, () => this.aggregate());
                    } else {
                        this.aggregate()
                    }
                });
        }
        this.loadMenu = this.loadMenu.bind(this);
        this.saveMenu = this.saveMenu.bind(this);
        this.shareMenu = this.shareMenu.bind(this);
        this.closeShare = this.closeShare.bind(this);
        this.loadHistory = this.loadHistory.bind(this);
        this.getNextDish = this.getNextDish.bind(this);
        this.initManualInputDishes = this.initManualInputDishes.bind(this);
        this.onManualInputCancel = this.onManualInputCancel.bind(this);
        this.onManualInputConfirm = this.onManualInputConfirm.bind(this);
        this.onManualInputUpdate = this.onManualInputUpdate.bind(this);
        this.manualSetDish = this.manualSetDish.bind(this);
    }

    initMeal(data) {
        this.allDishes = new DishList(data);
        this.lunchPlanner = new LunchPlanner(data.filter(dish => dish.meal == "lunch"));
        this.dinnerPlanner = new DinnerPlanner(data.filter(dish => dish.meal == "dinner"));
        this.generateMenu();
    }

    initGrocery(categories) {
        this.groceryManager = new GroceryManager(categories);
    }

    wrapMenu(menu) {
        menu.forEach((item, index) => {
            item.nextLunch = this.getNextDish.bind(this, index, "lunch");
            item.nextDinner = this.getNextDish.bind(this, index, "dinner");
            item.overrideLunch = this.initManualInputDishes.bind(this, index, "lunch");
            item.overrideDinner = this.initManualInputDishes.bind(this, index, "dinner");
        });
        return menu;
    }

    generateMenu() {
        let lunch = this.lunchPlanner.randomInit();
        let dinner = this.dinnerPlanner.randomInit();
        let menu = this.wrapMenu(MenuUtil.composeMenu(startDate, DAYS, lunch, dinner));
        this.setState({ menu });
    }

    getNextDish(index, meal) {
        const { menu = [] } = this.state;
        if (meal == "lunch") {
            menu[index].lunch = MenuUtil.purifyMeal(this.lunchPlanner.pickNext(index));
        } else {
            menu[index].dinner = MenuUtil.purifyMeal(this.dinnerPlanner.pickNext(index));
        }
        this.setState({ menu }, () => this.aggregate());
    }

    initManualInputDishes(index, meal) {
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
        menu[index][meal] = MenuUtil.purifyMeal(dishes);
        this.setState({ menu }, () => this.aggregate());
    }

    aggregate() {
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
            let menu = this.wrapMenu(data);
            this.setState({ menu }, () => this.aggregate());
        });
    }

    shareMenu() {
        const { menu = [] } = this.state;
        const TM_SHARE_API = '/api/share';
        let compressed = pako.deflate(JSON.stringify(menu), { to: 'string' });
        let payload = window.encodeURIComponent(window.btoa(compressed));
        fetch(TM_SHARE_API, {
            method: 'POST',
            body: payload,
        })
            .then(res => res.text())
            .then(url => {
                this.setState({ share: true, url: `${location.origin}${url}` });
            });
    }

    closeShare() {
        this.setState({ share: false });
    }

    // deprecated
    loadHistory() {
        FileManager.loadJson((data) => {
            let menu = data.flat();
            this.lunchPlanner.setHistory(MenuUtil.extractMeals(menu, "lunch"));
            this.dinnerPlanner.setHistory(MenuUtil.extractMeals(menu, "dinner"));
            this.generateMenu();
        });
    }

    render({ }, { menu = [], groceries = {}, share, url }) {

        return (
            <StyledEngineProvider injectFirst>
                <CssBaseline />
                <ThemeProvider theme={theme}>
                    <div>
                        <MyAppBar onClickLoadMenu={this.loadMenu} onClickSaveMenu={this.saveMenu}
                            onClickLoadHistory={this.loadHistory} onClickShareMenu={this.shareMenu} />
                        <FormDialog open={this.state.showForm}
                            defaultValue={this.state.formDishNames}
                            options={this.allDishes.dishes.map(dish => dish.name)}
                            onCancel={this.onManualInputCancel}
                            onClose={this.onManualInputConfirm}
                            onChange={this.onManualInputUpdate} />
                        <div style={{ padding: 5 }}>
                            <Grid container spacing={3} alignItems="flex-start" justifyContent="center">
                                <Grid container item xs={12} md={6} lg={5}>
                                    {menu.map(item => <DayMenu item={item} />)}
                                </Grid>
                                <Grid item xs={12} md={6} lg={5}>
                                    {IngredientCategory
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

// eslint-disable-next-line react/display-name
const Main = () => (
    <Router>
        <App path="/" />
        <App path="/menu/:payload" />
        <Redirect path="/b/:link" />
    </Router>
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