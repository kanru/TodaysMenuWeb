import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

export default function MyAppBar(props) {

    return (
        <AppBar position="static" sx={{
            background: 'url(/assets/logo.png) no-repeat',
            backgroundColor: '#ea6753',
            backgroundSize: 'auto 80%',
            backgroundPosition: 'center left'
        }}>
            <Toolbar>
                <Typography variant="h1" sx={{ flexGrow: 1, marginLeft: '30px', fontSize: '1.25rem', fontWeight: '500' }}>
                    Today's Menu
                </Typography>
                <ButtonGroup variant="contained" color="appbar" aria-label="outlined primary button group">
                    { props.isLogin ? <Button onClick={props.onClickLogout}>登出</Button> : <Button onClick={props.onClickLogin}>登入</Button> }
                    <Button onClick={props.onClickLoadMenu}>讀檔</Button>
                    <Button onClick={props.onClickSaveMenu}>存檔</Button>
                    <Button onClick={props.onClickShareMenu}>分享</Button>
                </ButtonGroup>
            </Toolbar>
        </AppBar>
    );
}
