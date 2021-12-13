import FileCopy from '@material-ui/icons/FileCopy'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import IconButton from '@material-ui/core/IconButton'

const ShareDialog = ({ open, url, onClose }) => {
    const handleClick = () => {
        navigator.clipboard.writeText(url).then(() => onClose());
    }
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>複製分享連結</DialogTitle>
            <DialogContent>
                {url}
                <IconButton onClick={handleClick}>
                    <FileCopy />
                </IconButton>
            </DialogContent>
        </Dialog>
    );
}
export default ShareDialog;