/* eslint-disable react/jsx-key */
/* eslint-disable no-prototype-builtins */
import { ApolloClient, ApolloProvider, InMemoryCache, useQuery, useMutation } from "@apollo/client";
import { setContext } from '@apollo/client/link/context';
import { createUploadLink } from "apollo-upload-client";
import { CssBaseline, Grid } from '@mui/material';
import { blue, grey } from '@mui/material/colors';
import { createTheme, styled, StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import moment from 'moment';
import pako from 'pako';
import { useState } from "react";
import { render } from 'react-dom';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import MyAppBar from './appbar-view.jsx';
import DishList from './dish-pool.js';
import FileManager from './file-manager.js';
import FormDialog from './manual-input.jsx';
import EditDishForm from './edit-dish.jsx';
import MenuUtil from './menu-util.js';
import { DinnerPlanner, LunchPlanner } from './planner.js';
import { GetDishes, GetShareableMenu, ShareMenu, AddNewDishes, UpdateDishes, LoginUser } from './query.graphql';
import ShareDialog from './share-dialog.jsx';
import GroceryList from "./grocery-list.jsx";
import DayMenu from "./menu-view.jsx";
import LoginDialog from "./login-dialog.jsx";

const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('authToken');
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
        }
    }
});

const client = new ApolloClient({
    // FIXME: the uri needs to be configurable
    link: authLink.concat(createUploadLink({ uri: import.meta.env.VITE_GRAPHQL_URL })),
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
        showLoginForm: false,
        editingDish: undefined,
        menu: undefined,
    });
    const [isLogin, setIsLogin] = useState(typeof localStorage.getItem('authToken') == 'string');

    let [updateDishes] = useMutation(UpdateDishes, {
        refetchQueries: [
            GetDishes
        ]
    });
    let [addNewDishes] = useMutation(AddNewDishes, {
        refetchQueries: [
            GetDishes
        ]
    });
    let [loginUser] = useMutation(LoginUser);

    // TODO handle props.link for shareable menu
    let params = useParams();

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
        let dishes = [
            {
                name: dish.name,
                ingredients: dish.ingredients.map(item => (
                    {
                        name: item.ingredient.name,
                        quantity: item.quantity
                    }
                )),
                photo: dish.photo
            }
        ];
        if (dish.isDraft) {
            addNewDishes({ variables: { dishes } })
        } else {
            updateDishes({ variables: { dishes } });
        }
        setState((currentState) => ({ ...currentState, showEditDish: false }));
    }

    const onClickLogin = () => {
        setState((currentState) => ({ ...currentState, showLoginForm: true }));
    }

    const onClickLogout = () => {
        localStorage.clear();
        setIsLogin(false);
    }

    const onLoginCancel = () => {
        setState((currentState) => ({ ...currentState, showLoginForm: false }));
    }

    const onLoginConfirm = async (userId, hashedPassword) => {
        const result = await loginUser({ variables: { userId, password: hashedPassword }});
        if (result.data.loginUser.success) {
            setState((currentState) => ({ ...currentState, showLoginForm: false }));
            setIsLogin(true);
            localStorage.setItem('authToken', result.data.loginUser.token);
        }
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
        return null;
    }

    const allDishes = new DishList(data.dishes);
    const lunchPlanner = new LunchPlanner(data.dishes.filter(dish => (!dish.meal || dish.meal == "lunch")), DAYS);
    const dinnerPlanner = new DinnerPlanner(data.dishes.filter(dish => (!dish.meal || dish.meal == "dinner")), DAYS);

    if (state.menu == undefined) {
        generateMenu();
        return null;
    }

    // TODO make state.menu slim
    // Currently the menu state also contains a snapshot of detail dish data
    // so we need to patch the dish data to the latest version.
    let patchedMenu = state.menu.map(dayMenu => (
        {
            ...dayMenu,
            lunch: dayMenu.lunch.map(lunchMenu => allDishes.lookupByName(lunchMenu.name)),
            dinner: dayMenu.dinner.map(dinnerMenu => allDishes.lookupByName(dinnerMenu.name))
        }
    ));

    return (
        <StyledEngineProvider injectFirst>
            <CssBaseline />
            <ThemeProvider theme={theme}>
                <div>
                    <MyAppBar
                        isLogin={isLogin}
                        onClickLogin={onClickLogin}
                        onClickLogout={onClickLogout}
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
                    <LoginDialog
                        open={state.showLoginForm}
                        onCancel={onLoginCancel}
                        onConfirm={onLoginConfirm}
                    />
                    <div style={{ padding: 5 }}>
                        <Grid container spacing={3} alignItems="flex-start" justifyContent="center">
                            <Grid container item xs={12} md={6} lg={5} spacing={2}>
                                {patchedMenu.map((item, index) =>
                                    <DayMenu
                                        key={index}
                                        editDishCallback={showEditDishForm}
                                        nextLunchCallback={() => pickNextDish(index, "lunch")}
                                        nextDinnerCallback={() => pickNextDish(index, "dinner")}
                                        overrideLunchCallback={() => showInputDishesForm(index, "lunch")}
                                        overrideDinnerCallback={() => showInputDishesForm(index, "dinner")}
                                        isLogin={isLogin}
                                        item={item}
                                    />)}
                            </Grid>
                            <GroceryList menu={patchedMenu} allDishes={allDishes} />
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
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/m/:link" element={<App />} />
            </Routes>
        </BrowserRouter>
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

render(<StyledMain />, document.getElementById('root'));
