import { Colors } from './constants'

const { Good, Satisfactory, Moderate, Poor, VeryPoor, Severe } = Colors


export const getTxtColor = (aqi) => {
    if (0 <= aqi && aqi <= 50)
        return Good
    else if (50 <= aqi && aqi <= 100)
        return Satisfactory
    else if (101 <= aqi && aqi <= 200)
        return Moderate
    else if (201 <= aqi && aqi <= 300)
        return Poor
    else if (301 <= aqi && aqi <= 400)
        return VeryPoor
    else if (401 <= aqi && aqi <= 500)
        return Severe

}

export const cities = ['Mumbai', 'Bengaluru', 'Delhi', 'Chennai', 'Pune', 'Jaipur', 'Chandigarh', 'Bhubaneswar', 'Hyderabad', 'Indore', 'Lucknow', 'Kolkata']
