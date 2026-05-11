const config = require('../../config/app');

const EARTH_RADIUS_METERS = 6371000;

const toRadians = (degrees) => (degrees * Math.PI) / 180;

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const lat1Rad = toRadians(lat1);
    const lat2Rad = toRadians(lat2);
    const latDiff = toRadians(lat2 - lat1);
    const lonDiff = toRadians(lon2 - lon1);

    const a =
        Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
        Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(lonDiff / 2) * Math.sin(lonDiff / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS_METERS * c;
};

const isWithinOfficeRadius = (latitude, longitude) => {
    const { latitude: officeLat, longitude: officeLon, radiusMeters } = config.office;

    const distance = calculateDistance(latitude, longitude, officeLat, officeLon);

    return {
        isWithinRadius: distance <= radiusMeters,
        distance: Math.round(distance),
        allowedRadius: radiusMeters,
    };
};

module.exports = {
    calculateDistance,
    isWithinOfficeRadius,
};
