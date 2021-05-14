import React from 'react';
import clsx from 'clsx';

const Layout = (props) => {

    return (
        <div className="flex row wide tall align-stretch">
            <div className="" style={{ width: "80%"}} >
                {props.main}        
            </div>
            <div className="" style={{ width: 360, marginLeft: 1 }}>
                {props.aside}        
            </div>    
        </div>
    )

}

export default Layout;