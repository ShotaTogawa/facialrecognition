import React from 'react';

const Rank = ({name, entries}) => {
    return (
        <div className="tc">
            <div className="white f3">
                {`${name}, your current rank is...`}
            </div>
            <div className="white f2"> 
                {entries}
            </div>
        </div>
    );
}

export default Rank