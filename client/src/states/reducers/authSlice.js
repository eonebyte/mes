import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3080';
const PREFIX = '/api/v1';

// checkAuthStatus (cek status auth saat awal)
export const checkAuthStatus = createAsyncThunk('auth/checkAuthStatus', async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}${PREFIX}/auth/cas`, { withCredentials: true });
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            // Jika 401, beri pesan khusus
            return rejectWithValue('Unauthorized. Please login.');
        }
        return rejectWithValue(error.response?.data || 'Server error');
    }
});

// login
export const login = createAsyncThunk('auth/login', async ({ username, password }, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${API_BASE_URL}${PREFIX}/auth/login/oracle`, { username, password }, { withCredentials: true });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || 'Login failed');
    }
});

// logout
export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${API_BASE_URL}${PREFIX}/auth/logout/oracle`, { withCredentials: true });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || 'Logout failed');
    }
});

// authSlice
const authSlice = createSlice({
    name: 'auth',
    initialState: {
        auth: false,
        user: null, // Menyimpan informasi pengguna
        isLoading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // login actions
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.auth = true;
                state.user = action.payload.user; // Simpan data user dari server jika ada
                state.isLoading = false;
            })
            .addCase(login.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            })

            // checkAuthStatus actions
            .addCase(checkAuthStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(checkAuthStatus.fulfilled, (state, action) => {
                state.auth = true;
                state.user = action.payload.user; // Simpan data user dari response cAS
                state.isLoading = false;
            })
            .addCase(checkAuthStatus.rejected, (state, action) => {
                state.auth = false;
                state.user = null;
                state.error = action.payload;
                state.isLoading = false;
            })

            // logout actions
            .addCase(logout.fulfilled, (state) => {
                state.auth = false;
                state.user = null;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(logout.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            });
    },
});

export default authSlice.reducer;
