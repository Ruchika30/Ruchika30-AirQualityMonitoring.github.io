import React, { useEffect, useState } from 'react'
import { getTxtColor, cities } from '../../helpers/utils'
import { w3cwebsocket as socket } from "websocket";
import { LineChart, CartesianGrid, XAxis, YAxis, BarChart, Bar, Line, ResponsiveContainer, Tooltip, } from 'recharts'
import './style.css'


let protocol = window.location.protocol === 'https:' ? 'wss' : 'ws',
    ws = new socket(`${protocol}:/city-ws.herokuapp.com`);


const CtrlBoard = () => {
    const [updatedTime, setupdatedTime] = useState('')
    const [cityWiseAqiDetails, setCityWiseAqiDetails] = useState([])
    const [selectedCity, setCityName] = useState('Mumbai')
    const [selectedCity1, setSelectedCity1] = useState('Mumbai')
    const [selectedCity2, setSelectedCity2] = useState('Mumbai')
    const [cityOneData, setCityOneData] = useState([])
    const [cityTwoData, setCityTwoData] = useState([])
    const [apiResponse, setResponse] = useState([])
    const [socketConnected, setSocketConnection] = useState(false)
    const [graphdata, setGraphData] = useState([{
        city: '',
        aqi: ''
    }])
    let cityAQIDetails = []

    const getUniqueCities = () => {
        const unique = cityAQIDetails.map(x => {
            return Object.values(x)[0]
        })
        return unique
    }

    const updateCityAQI = (response) => {
        response.map((item) => {
            if (!getUniqueCities().includes(item.city)) {
                item['aqiList'] = []
                let obj = {}
                obj.aqi = item.aqi
                obj.city = item.city
                item['aqiList'].push(obj)
                cityAQIDetails.push(item)

            }
            else {
                cityAQIDetails.map((cityAiq) => {
                    if (cityAiq.city == item.city) {
                        let obj = {}
                        obj.aqi = item.aqi
                        obj.city = item.city
                        cityAiq['aqiList'].push(obj)
                        cityAiq.aqi = item.aqi
                    }
                })
                if (cityAQIDetails)
                    // of the form [{ aqi: '';, city:'', aqiList: [] }]
                    setCityWiseAqiDetails(cityAQIDetails)
            }
        })
    }

    const handleCity1 = () => {
        cityWiseAqiDetails.filter((item) => {
            if (item.city == selectedCity1) {
                setCityOneData(item.aqiList)
            }

        })
    }

    const handleCity2 = () => {
        cityWiseAqiDetails.filter((item) => {
            if (item.city == selectedCity2) {
                setCityTwoData(item.aqiList)
            }

        })
    }
    useEffect(() => {
        handleCity2()
    }, [selectedCity2])

    useEffect(() => {
        handleCity1()
    }, [selectedCity1])

    const checkIfMatchesSelectedCity = () => {
        apiResponse?.filter((item) => {
            if (item.city == selectedCity) {
                if (graphdata.length > 30)
                    setGraphData(currentData => [...currentData.splice(0, currentData.length - 30), item])
                setGraphData(currentData => [...currentData, item])
            }
        })

    }

    const initWebsocket = () => {
        ws.onopen = () => {
            setSocketConnection(true)
        };
        ws.onmessage = (event) => {
            const response = JSON.parse(event.data);
            if (response.length) {
                setResponse(response)
                updateCityAQI(response)  // For tablular data
                checkIfMatchesSelectedCity() // For Graphical data
            }
            setupdatedTime(event.timeStamp)
        };
        ws.onclose = () => {
            setSocketConnection(false)
            initWebsocket();
        };
    };

    function getReadableTime(incomingTimeStamp) {
        return new Date(incomingTimeStamp).toLocaleTimeString()
    }


    useEffect(() => {
        initWebsocket();
    }, []);

    const updateCity = (e) => {
        setCityName(e.target.value)
    }

    useEffect(() => {
        checkIfMatchesSelectedCity()

    }, [selectedCity, apiResponse])

    const getTabularData = () => {
        return (
            <div className="container" style={{ minHeight: '650px' }}>
                <div className="mt-3" id="output">
                    <p>
                        WebSocket Status: <span id="websocket-status" ><span className="badge badge-info">
                            {socketConnected ? ' Connected' : ' Disconnected'}</span></span>
                        <span id="action-btn" className="float-right"> </span>
                    </p>

                </div>
                <h2>AQI Index Board</h2>
                <table className="table table-sm table-striped">
                    <thead className="thead-dark">
                        <tr className="">
                            <th scope="col">City</th>
                            <th scope="col">AQI</th>
                            <th scope="col">Last Updated Time</th>
                        </tr>
                    </thead>
                    <tbody id='tbody'>
                        {cityWiseAqiDetails?.map((item, index) => {
                            return (
                                <tr key={index + item.city}>
                                    <td style={{}}>{item.city}</td>
                                    <td style={{ textAlign: 'center', backgroundColor: getTxtColor(item.aqi) }}>{item?.aqi.toFixed(2)}</td>
                                    <td style={{ textAlign: 'center' }}>{getReadableTime(updatedTime)}</td>
                                </tr>)
                        })}
                    </tbody>
                </table>
            </div>
        )
    }


    const getGraphicalData = () => {
        return (
            <div className="container">
                <div>
                    <h2>LIVE tracking</h2>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ marginRight: '10px' }}>Choose City</div>
                        <select id="cars" onChange={updateCity} value={selectedCity} className="dropdown">
                            {cities.map((city, index) => (
                                <option value={city} key={index + city} className="dropdown-item" type="button" >{city}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <table className="table table-sm table-striped">
                    <thead className="thead-dark">
                        <tr className="">
                            <th scope="col">Choosen City</th>
                            <th scope="col">{selectedCity}</th>
                        </tr>
                    </thead>
                    <tbody id='tbody' >
                        <div className="graphContainer row" >
                            {apiResponse ?
                                <>
                                    <LineChart
                                        width={1000}
                                        height={400}
                                        data={graphdata}
                                        margin={{
                                            top: 5,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                    >
                                        <XAxis dataKey="city" />
                                        <YAxis />
                                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="aqi" />
                                    </LineChart>


                                    <div style={{ margin: '5% 0%' }}>
                                        <h2>Comparing cities</h2>

                                        <div style={{ display: 'flex' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                                    <div style={{ marginRight: '10px' }}>Choose City1</div>
                                                    <select id="cars" onChange={(e) => setSelectedCity1(e.target.value)} value={selectedCity1} className="dropdown">
                                                        {cities.map((city, index) => (
                                                            <option value={city} key={index + city} className="dropdown-item" type="button" >{city}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <BarChart
                                                    width={500}
                                                    height={300}
                                                    data={cityOneData}
                                                    margin={{
                                                        top: 5,
                                                        right: 30,
                                                        left: 20,
                                                        bottom: 5,
                                                    }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="city" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Bar dataKey="aqi" fill="#8884d8" />
                                                </BarChart>

                                            </div>

                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                                    <div style={{ marginRight: '10px' }}>Choose City2</div>
                                                    <select id="cars" onChange={(e) => setSelectedCity2(e.target.value)} value={selectedCity2} className="dropdown">
                                                        {cities.map((city, index) => (
                                                            <option value={city} key={index + city} className="dropdown-item" type="button" >{city}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <BarChart
                                                    width={500}
                                                    height={300}
                                                    data={cityTwoData}
                                                    margin={{
                                                        top: 5,
                                                        right: 30,
                                                        left: 20,
                                                        bottom: 5,
                                                    }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="city" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Bar dataKey="aqi" fill="#8884d8" />
                                                </BarChart>
                                            </div>

                                        </div>

                                    </div>
                                </>
                                : null
                            }
                        </div>
                    </tbody>
                </table>
            </div >
        )
    }

    return (
        <div className="wrapper">
            {getTabularData()}
            {getGraphicalData()}
        </div>
    )
}


export default CtrlBoard