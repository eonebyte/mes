// fetchDataResources.js

const BASE_URL = 'http://localhost:3080';
const PREFIX = '/api/v1';

export const fetchResources = async () => {
    try {
        const response = await fetch(`${BASE_URL}${PREFIX}/resource/resources`);
        const data = await response.json();
        return data.data; // Pastikan data API sesuai dengan struktur ini
    } catch (error) {
        console.error("Error fetching resources:", error);
        throw error; // Rethrow error untuk penanganan di komponen
    }
};

export const fetchPlans = async () => {
    try {
        const response = await fetch(`${BASE_URL}${PREFIX}/plan/plans`);
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error("Error fetching plans:", error);
        throw error;
    }
};

export const fetchResourceById = async (resourceId) => {
    try {
        const response = await fetch(`${BASE_URL}${PREFIX}/resource/resource?resourceId=${resourceId}`);
        const result = await response.json();
        if (result && result.data[0]) {
            return result.data[0];
        }

        return null;
    } catch (error) {
        console.error("Error fetching resource:", error);
        return null;
    }
}

export const fetchProductionDefects = async (planId) => {
    try {
        const response = await fetch(`${BASE_URL}${PREFIX}/production/defects/${planId}`);
        const data = await response.json();

        if (data && Array.isArray(data.result)) {
            return data.result;
        }

        return [];
    } catch (error) {
        console.error("Error fetching production defects:", error);
        return [];
    }
}

export const fetchPlanByResource = async (resourceId) => {
    try {
        const response = await fetch(`${BASE_URL}${PREFIX}/plan/resource/plans?resourceId=${resourceId}`);
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
        const response = await fetch(`${BASE_URL}${PREFIX}/plan/active?resourceId=${resourceId}`);
        const result = await response.json();

        if (result && result.data) {
            return result.data; // Mengembalikan array [plan1, plan2, ...] atau [plan1] atau []
        }

        return {};
    } catch (error) {
        console.error("Error fetching active plans:", error);
        return {};
    }
}

export const fetchDetailPlan = async (planId, moldId) => {
    try {
        const params = new URLSearchParams();
        if (planId) params.append("planId", planId);
        if (moldId) params.append("moldId", moldId);

        // Fetch data dengan query parameters yang valid
        const response = await fetch(`${BASE_URL}${PREFIX}/plan/detail?${params.toString()}`);

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

export const fetchMovementLines = async (planId) => {
    try {
        // Fetch data dengan query parameters yang valid
        const response = await fetch(`${BASE_URL}${PREFIX}/warehouse/movements?planId=${planId}`);

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
        const response = await fetch(`${BASE_URL}${PREFIX}/mold/molds`);
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

export const fetchHistoryDown = async (resourceId) => {
    try {
        const response = await fetch(`${BASE_URL}${PREFIX}/down/downs?resourceId=${resourceId}`);
        const result = await response.json();

        if (Array.isArray(result.data?.rows)) {

            return { historyDowns: result.data.rows };
        }

        return { historyDowns: [] };
    } catch (error) {
        console.error("Error fetching resource:", error);
        return { historyDowns: [] };
    }
};

export const fetchAssetEvents = async () => {
    try {
        const response = await fetch(`${BASE_URL}${PREFIX}/resource/timelines`);
        const result = await response.json();
        if (result && result.dataset && result.dataset.length > 0) {
            return result.dataset;
        }
        return null;
    } catch (error) {
        console.error("Error fetching resource:", error);
        return null;
    }
}



