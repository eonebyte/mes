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
        const response = await fetch(`http://localhost:3080/api/plans/resource/plans?resourceId=${resourceId}`);
        const result = await response.json();
        if (result && result.data) {
            return result.data;
        }
        return { singleTaskPlans: [], multipleTaskPlans: [] };
    } catch (error) {
        console.error("Error fetching resource:", error);
        return { singleTaskPlans: [], multipleTaskPlans: [] };
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

export const fetchDetailPlan = async (planId, moldId) => {
    try {
        const params = new URLSearchParams();
        if (planId) params.append("planId", planId);
        if (moldId) params.append("moldId", moldId);

        // Fetch data dengan query parameters yang valid
        const response = await fetch(`http://localhost:3080/api/plans/plan/detail?${params.toString()}`);

        const result = await response.json();
        if (result && result.data) {
            return result.data;  // Mengembalikan objek
        }
        return null;
    } catch (error) {
        console.error("Error fetching resource:", error);
        return null;
    }
}

export const fetchMolds = async () => {
    try {
        const response = await fetch(`http://localhost:3080/api/molds`);
        const result = await response.json();
        if (result && result.data) {
            return result.data;  // Mengembalikan objek
        }
        return null;
    } catch (error) {
        console.error("Error fetching resource:", error);
        return null;
    }
}
