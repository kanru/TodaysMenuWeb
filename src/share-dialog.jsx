import FileCopy from '@mui/icons-material/FileCopy'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'

const ShareDialog = ({ open, url, onClose }) => {
    const handleClick = () => {
        navigator.clipboard.writeText(url).then(() => onClose());
    }
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>複製分享連結</DialogTitle>
            <DialogContent>
                {url}
                <IconButton onClick={handleClick} size="large">
                    <FileCopy />
                </IconButton>
            </DialogContent>
        </Dialog>
    );
}
export default ShareDialog;