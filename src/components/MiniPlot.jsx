import React from 'react';
import * as Plot from "@observablehq/plot";

  
const MiniPlot = (props) => {

    const ref = React.useRef();

    React.useEffect(() => {

        if (!props.data) return;

        const element = ref.current;

        const rect = element.getBoundingClientRect();

        let plot;
        
        try {
            plot = Plot.plot({
                grid: true,

                marginTop: 0,
                // marginLeft: 0,
                marginRight: 0,
                marginBottom: 0,

                width: rect.width,
                height: rect.height,

                marks: [
                    Plot.line( props.data,  {x: "date", y: "mean" })
                ],
                style: {
                    background: "transparent",
                    color: props.color,
                },
            })
        }
        catch(ex) {
            console.log(ex)
        }

        ref.current.appendChild(plot);

        return () => {
            if (ref.current) ref.current.removeChild(plot)
        }

    }, [props.data, props.color, ref]);

    return <div ref={ref} className="fill" style={{ fontSize: '0.5rem' }} />

}

export default MiniPlot;

