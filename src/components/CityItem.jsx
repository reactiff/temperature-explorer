import React from 'react';
import Switch from '@material-ui/core/Switch';

import MiniPlot from './MiniPlot';

import getContrastColorByIndex from './CyclicalColorScheme';

export default function CityItem(props) {

  const [checked, setChecked] = React.useState(false);

    const color = getContrastColorByIndex(props.index, 76);

  const handleChange = (event) => {
    setChecked(event.target.checked);

    if (props.onChange) {
        props.onChange({ 
            name: props.name, 
            checked: event.target.checked,
            color,
        });
    }
  };

  return (
    
        <div className="flex row wide align-start" style={{backgroundColor: checked ? '#00000033' : '#00000011', marginBottom: 1, paddingBottom: 7}}>

            <div className="flex column grow" style={{paddingLeft: 15, paddingTop: 7 }}>    
                <div style={{ marginBottom: 10 }} >
                    {props.name}
                </div>
                <div className="relative" style={{ height: 40, marginLeft: 0, marginRight: 15, marginBottom: 5 }} >
                    <MiniPlot data={props.data} color={checked ? color : '#ffffff55'} />
                </div>
            </div>

            <div>
                <Switch
                    checked={checked}
                    onChange={handleChange}
                    color="primary"
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                />
            </div>
        
        </div>

        
    
  );
}

