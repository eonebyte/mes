// fetchDataResources.js
export const fetchResources = async () => {
    try {
        const response = await fetch('http://localhost:3080/api/resources');
        const data = await response.json();
        return data.data; // Pastikan data API sesuai dengan struktur ini
    } catch (error) {
        console.error("Error fetching resources:", error);
        throw error; // Rethrow error untuk penanganan di komponen
    }
};

export const fetchPlans = async () => {
    try {
        const response = await fetch('http://localhost:3080/api/plans');
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error("Error fetching plans:", error);
        throw error;
    }
};

export const fetchResourceById = async (resourceId) => {
    try {
        const response = await fetch(`http://localhost:3080/api/resource?resourceId=${resourceId}`);
        const result = await response.json();
        if (result && result.data && result.data.length > 0) {
            return result.data[0];
        }
        return null;
    } catch (error) {
        console.error("Error fetching resource:", error);
        return null;
    }
}

export const fetchPlanByResource = async (resourceId) => {
    try {
        const response = await fetch(`http://localhost:3080/api/plans/plan?resourceId=${resourceId}`);
        const result = await response.json();
        if (result && result.data && result.data.length > 0) {
            return result.data;
        }
        return null;
    } catch (error) {
        console.error("Error fetching resource:", error);
        return null;
    }
}

export const fetchPlanActive = async (resourceId) => {
    try {
        const response = await fetch(`http://localhost:3080/api/plans/plan/active?resourceId=${resourceId}`);
        const result = await response.json();
        if (result && result.data && result.data.length > 0) {
            return result.data[0];
        }
        return null;
    } catch (error) {
        console.error("Error fetching resource:", error);
        return null;
    }
}
