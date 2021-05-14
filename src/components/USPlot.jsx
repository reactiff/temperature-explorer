import React from 'react';
import _ from 'lodash';
import Slider from '@material-ui/core/Slider';
import Switch from '@material-ui/core/Switch';
import * as Plot from "@observablehq/plot";
// app components
import temps from '../data/us_temps.json';
import Layout from './Layout';
import CityItem from './CityItem';
  
const USPlot = () => {

    const ref = React.useRef();

    const [cityNames] = React.useState(() => {
        return Object.keys(temps).filter(key => key!=='dates' && key!=='us');
    })

    ////////////////////////////////////////////////////////////////////////////////////////  DATA
    const [us_data] = React.useState(() => {
        return temps.dates.map((date, i) => {
            const d = new Date(date);
            const ms = d.getTime();

            // find absolue min and max across all cities

            return {
                ms,
                date: d,
                min: temps.us.min[i],
                max: temps.us.max[i],
                mean: temps.us.mean[i],
                abs_min: temps.us.abs_min[i],
                abs_max: temps.us.abs_max[i],
            }
        });
    });
    const [city_data] = React.useState(() => {
        const dict = {};
        cityNames.forEach(city => {
            dict[city] = temps.dates.map((date, i) => {
                const d = new Date(date);
                const ms = d.getTime();
                return {
                    ms,
                    date: d,
                    min: temps[city].temperatures.min[i],
                    max: temps[city].temperatures.max[i],
                    mean: temps[city].temperatures.mean[i],
                };
            });
        });
        return dict;
    });

    ///////////////////////////////////////////////////////////////////////////////////////  STATE
    
    // Date Range
    const [dateRange, setDateRange] = React.useState([0, 90]);
    const [msStart, setMsStart] = React.useState(() => us_data[dateRange[0]].date.getTime());
    const [msEnd, setMsEnd] = React.useState(() => us_data[dateRange[1]].date.getTime());
    const filterByDateRange = React.useCallback((series, start, end) => {
        return series.filter(x => x.ms >= start && x.ms <= end)
    }, []);

    // City checked state
    const [cityState, setCityState] = React.useState({});

    // Filtered data
    const [filteredUsData, setFilteredUsData] = React.useState([]);
    const [filteredCityData, setFilteredCityData] = React.useState({});
        
    ///////////////////////////////////////////////////////////////////////////////  CHART OPTIONS
    const [plotWeightedAverage, setPlotWeightedAverage] = React.useState(true);
    const togglePlotWeightedAverage = React.useCallback((event) => setPlotWeightedAverage(event.target.checked), [])

    const [plotAbsoluteMinMax, setPlotAbsoluteMinMax] = React.useState(false);
    const togglePlotAbsoluteMinMax = React.useCallback((event) => setPlotAbsoluteMinMax(event.target.checked), [])

    const [plotWeightedMinMax, setPlotWeightedMinMax] = React.useState(false);
    const togglePlotWeightedMinMax = React.useCallback((event) => setPlotWeightedMinMax(event.target.checked), [])


    /////////////////////////////////////////////////////////////////////////////////////  EFFECTS
    // Plot
    React.useEffect(() => {

        if (filteredUsData.length === 0) return;

        const rect = ref.current.getBoundingClientRect();

        const cities = Object.keys(cityState).filter(city => cityState[city].checked);
        const cityPlots = cities.map(city => {
            const plot = Plot.line( filteredCityData[city],  {x: "date", y: "mean", label: city, stroke: cityState[city].color });
            return plot;
        });

        const marks = [];

        if (plotAbsoluteMinMax) {
            marks.push(Plot.area(filteredUsData, { y1: 'abs_min', y2: 'min', x1: 'date', fill: '#aaaaff11' }));
            marks.push(Plot.area(filteredUsData, { y1: 'max', y2: 'abs_max', x1: 'date', fill: '#ffaaaa11' }));
        }

        if (plotWeightedMinMax) {
            marks.push(Plot.area(filteredUsData, { y1: 'min', y2: 'max', x1: 'date', fill: '#ffffff22' }));
        }

        if (plotWeightedAverage) {
            marks.push(Plot.line( filteredUsData,  {x: "date", y: "mean", stroke: '#fff' }));
        }


        const plot = Plot.plot({
            width: rect.width,
            grid: true,
            x: { domain: [filteredUsData[0].date, filteredUsData[filteredUsData.length - 1].date]}, 
            y: { },
            marks: [
                ...marks.concat(...cityPlots)
            ],
        })
        ref.current.appendChild(plot);
        return () => {
            if (ref.current) ref.current.removeChild(plot)
        }
    }, [cityState, filteredUsData, filteredCityData, plotWeightedAverage, plotWeightedMinMax, plotAbsoluteMinMax, ref]);

    ///////////////////////////////////////////////////////////////////////////////////  CALLBACKS

    const applyDateRange = React.useMemo(() => _.debounce((range) => {
        
        const start = us_data[range[0]].date.getTime();
        const end = us_data[range[1]].date.getTime();
        setMsStart(start);
        setMsEnd(end);

        const newUsData = filterByDateRange(us_data, start, end);
        console.log(start, end, newUsData.length);
        setFilteredUsData(newUsData);

        const newCityData = {};
        cityNames.forEach(city => {
            newCityData[city] = filterByDateRange(city_data[city], start, end);
        })
        setFilteredCityData(newCityData);

    }, 200), []);

    React.useEffect(() => {
        applyDateRange(dateRange, msStart, msEnd);
    }, []);


    // Date range slider
    const handleDateRangeChange = React.useCallback((event, newValue) => {
        setDateRange(newValue);
        setTimeout(() => applyDateRange(newValue), 0);
    }, []);

    // Slider tooltip caption
    const sliderHandleTooltip = React.useCallback((value) => {
        const d = us_data[value].date;
        return `${d.getMonth()}/${d.getDate()}/${d.getFullYear()}`;
    }, []);

    // City toggle
    const handleCityToggle = React.useCallback((city) => {
        setCityState((oldState) => {
            return {
                ...oldState,
                [city.name]: {
                    checked: city.checked,
                    color: city.color,
                },
            }
        });
    }, [])

    
    return (
        <Layout 
            main={
                <div className="sticky" style={{top: 0, padding: 0 }}>


                    <div className="flex column" style={{backgroundColor: '#00000011', paddingTop: 0, paddingLeft: 40, paddingRight: 30}}>
                        <h1>US temperature explorer</h1>
                    </div>

                    <div >
                        <div ref={ref} style={{ width: '100%' }} />
                    </div>

                    <div className="flex column" style={{backgroundColor: '#ffffff05', paddingTop: 30, paddingLeft: 40, paddingRight: 30, marginBottom:1 }}>
                        <div className="flex row align-center">
                            <div className="">
                                <h3>Date range</h3>
                            </div>
                            <div className="grow" style={{ paddingTop: 10, paddingLeft: 30 }}>
                                {
                                    us_data &&
                                    
                                    <Slider
                                        value={dateRange}
                                        onChange={handleDateRangeChange}
                                        valueLabelDisplay="auto"
                                        aria-labelledby="range-slider"
                                        valueLabelFormat={sliderHandleTooltip}
                                        valueLabelDisplay="auto"
                                        min={0}
                                        max={us_data.length - 1}
                                    />
                                
                                }
                            </div>
                        </div>
                    </div>

                    {/* CHART OPTION TOGGLES */}

                    {/* WEIGHTED AVERAGE */}
                    <div className="flex row align-center" style={{backgroundColor: '#ffffff05', padding: 15, marginBottom: 1}} >
                        <div className="grow" style={{textAlign: 'right', fontSize: '1.5em', paddingBottom: 6, paddingRight: 15 }}>
                            Population weighted national average:
                        </div>
                        <Switch
                            checked={plotWeightedAverage}
                            onChange={togglePlotWeightedAverage}
                            color="primary"
                            inputProps={{ 'aria-label': 'primary checkbox' }}
                        />
                    </div>

                    {/* WEIGHTED MIN/MAX */}
                    <div className="flex row align-center" style={{backgroundColor: '#ffffff05', padding: 15, marginBottom: 1}} >
                        <div className="grow" style={{textAlign: 'right', fontSize: '1.5em', paddingBottom: 6, paddingRight: 15 }}>
                            Weighted national min/max range:
                        </div>
                        <Switch
                            checked={plotWeightedMinMax}
                            onChange={togglePlotWeightedMinMax}
                            color="primary"
                            inputProps={{ 'aria-label': 'primary checkbox' }}
                        />
                    </div>

                    {/* ABSOLUTE MIN/MAX */}
                    <div className="flex row align-center" style={{backgroundColor: '#ffffff05', padding: 15, marginBottom: 1}} >
                        <div className="grow" style={{textAlign: 'right', fontSize: '1.5em', paddingBottom: 6, paddingRight: 15 }}>
                            Absolute national min/max range:
                        </div>
                        <Switch
                            checked={plotAbsoluteMinMax}
                            onChange={togglePlotAbsoluteMinMax}
                            color="primary"
                            inputProps={{ 'aria-label': 'primary checkbox' }}
                        />
                    </div>
                   
                </div>
            }
            aside={
                <>
                    {
                        cityNames.map((city, i) => {

                            return <CityItem key={city} index={i} name={city} onChange={handleCityToggle} data={filteredCityData[city]} />
                        })
                    }
                </>

                
            }
        />
        
    )

}

export default USPlot;


