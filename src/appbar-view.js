import { makeStyles } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(() => ({
    root: {
        backgroundColor: '#ea6753',
        background: 'url(/assets/logo.png) no-repeat',
        backgroundSize: 'auto 80%',
        backgroundPosition: 'center left'
    },
    title: {
        flexGrow: 1,
        marginLeft: '30px',
    },
}));

export default function MyAppBar(props) {
    const classes = useStyles();

    return <AppBar position="static" className={classes.root}>
        <Toolbar>
            <Typography variant="h6" className={classes.title}>
                Today's Menu
            </Typography>
            <ButtonGroup variant="contained" aria-label="outlined primary button group">
                <Button onClick={props.onClickLoadMenu}>讀檔</Button>
                <Button onClick={props.onClickSaveMenu}>存檔</Button>
                <Button onClick={props.onClickShareMenu}>分享</Button>
            </ButtonGroup>
        </Toolbar>
    </AppBar>;
}
