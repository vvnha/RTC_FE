import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Box.scss';

Box.propTypes = {

};

function getUers() {
    // bla bla
}

const getRandomColor = () => {
    const COLOR_LIST = ['deepink', 'green', 'yellow', 'black'];
    const rdColor = Math.trunc(Math.random() * 4);
    return COLOR_LIST[rdColor]
}

function Box() {
    const [users, setUsers] = useState([])
    const [color, setColor] = useState(() => {
        const initColor = localStorage.getItem('color') || 'deeppink';
        return initColor;
    })

    function handleBox() {
        const newUsers = getUers();
        setUsers(newUsers);
    }

    const handleColor = () => {
        const newColor = getRandomColor();
        setColor(newColor);
        localStorage.setItem('color', newColor);

    }

    return (
        <div
            className="box"
            style={{ backgroundColor: color }}
            onClick={handleColor}
        >
            TEMP

        </div>
    );
}

export default Box;