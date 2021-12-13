import { styled } from '@mui/material/styles';

import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

const PREFIX = 'appbar-view';

const classes = {
    root: `${PREFIX}-root`,
    title: `${PREFIX}-title`
};

const StyledAppBar = styled(AppBar)(() => ({
    [`&.${classes.root}`]: {
        background: 'url(/assets/logo.png) no-repeat',
        backgroundColor: '#ea6753',
        backgroundSize: 'auto 80%',
        backgroundPosition: 'center left'
    },

    [`& .${classes.title}`]: {
        flexGrow: 1,
        marginLeft: '30px',
    }
}));

export default function MyAppBar(props) {


    return (
        <StyledAppBar position="static" className={classes.root}>
            <Toolbar>
                <Typography variant="h1" className={classes.title}>
                    Today's Menu
                </Typography>
                <ButtonGroup variant="contained" color="appbar" aria-label="outlined primary button group">
                    <Button onClick={props.onClickLoadMenu}>讀檔</Button>
                    <Button onClick={props.onClickSaveMenu}>存檔</Button>
                    <Button onClick={props.onClickShareMenu}>分享</Button>
                </ButtonGroup>
            </Toolbar>
        </StyledAppBar>
    );
}
