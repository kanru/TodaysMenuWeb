const Redirect = ({ link }) => {
    const BITLY_BASE = 'https://bit.ly';
    window.location = `${BITLY_BASE}/${link}`;
}
export default Redirect;