import { Button } from "react-bootstrap";
import PropTypes from 'prop-types';


export default function MyButton({ text, variant, show, onClick }) {
    if (!show) return null;
    return (
        <Button variant={variant} onClick={onClick}>
            {text}
        </Button>
    )
}

MyButton.propTypes = {
    text: PropTypes.string.isRequired,
    variant: PropTypes.string.isRequired,
    show: PropTypes.bool,
    onClick: PropTypes.func
};


