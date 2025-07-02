// Import external libraries
import { DateTime } from 'luxon'; // atau gunakan Date bawaan jika tidak pakai luxon
import LayoutDashboard from "../../components/layouts/LayoutDashboard";
import { useCallback, useEffect, useState, useRef } from 'react';
import { fetchAssetEvents } from "../../data/fetchs";
import { Divider, Modal, Row, Spin } from "antd";
import socket from '../../libs/socket-io/socket.js'
import StatusButton from '../../components/Buttons/StatusButton.jsx';


const TimelineDown = () => {
    const chartRef = useRef(null);
    const datasetRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [assetEvents, setAssetEvents] = useState([]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [clickedBlockData, setClickedBlockData] = useState(null);

    const handleShowModal = useCallback((data) => {
        setClickedBlockData(data);
        setIsModalVisible(true);
    }, []);

    const handleOk = useCallback(() => {
        setIsModalVisible(false);
        setClickedBlockData(null);
    }, []);

    const handleCancel = useCallback(() => {
        setIsModalVisible(false);
        setClickedBlockData(null);
    }, []);


    function addCategoryIfNotExist(resourceId, catKeys) {
        if (!Array.isArray(catKeys)) return;

        const datasetItem = datasetRef.current.find(item => item.resourceId === resourceId);
        if (!datasetItem) return;

        if (!datasetItem.categories) {
            datasetItem.categories = {};
        }

        for (const catKey of catKeys) {
            if (!datasetItem.categories[catKey]) {
                datasetItem.categories[catKey] = {
                    class: `rect_${catKey}`,
                    tooltip_html: `<i class="fas fa-fw fa-circle tooltip_${catKey}"></i>`
                };
            }
        }
    }



    useEffect(() => {
        const onConnect = () => {
            console.log('Connected:', socket.id);
        };
        const onDisconnect = () => {
            console.log('Disconnected:', socket.id);
        };

        const onRefreshFetchData = (data = {}) => {
            const dataset = data?.data?.dataset;
            if (!data.status || !Array.isArray(dataset) || dataset.length === 0) return;

            if (!chartRef.current || !datasetRef.current) return;

            const updatedResourceIds = new Set();
            const nowUTC = DateTime.now().setZone("UTC").toFormat('yyyy-MM-dd HH:mm:ss');


            for (const newEvent of dataset) {
                const { resourceId, data: newDataRaw = [], categories = [], description = [] } = newEvent;

                const index = datasetRef.current.findIndex(item => item.resourceId === resourceId);

                if (index === -1) {
                    console.warn(`resourceId ${resourceId} tidak ditemukan di datasetRef`);
                    continue;
                }

                updatedResourceIds.add(resourceId);


                const targetData = datasetRef.current[index].data;
                const targetDescription = datasetRef.current[index].description;

                addCategoryIfNotExist(resourceId, categories);


                for (let i = 0; i < newDataRaw.length; i++) {
                    const rawEntry = newDataRaw[i];
                    const descEntry = description?.[i]?.[0] || 'No description';


                    if (targetData.length > 0) {
                        // Update waktu `end` dari data sebelumnya
                        targetData[targetData.length - 1][2] = rawEntry[0];
                    }

                    targetData.push(rawEntry);
                    targetDescription.push(descEntry);
                }
            }

            for (const resource of datasetRef.current) {
                if (updatedResourceIds.has(resource.resourceId)) continue;

                const data = resource?.data;
                if (Array.isArray(data) && data.length > 0) {
                    data[data.length - 1][2] = nowUTC;
                }
            }

            chartRef.current.updateGraph(datasetRef.current);

            // notification.info({
            //     message: 'Data Updated',
            //     description: data.message || 'Received real-time update from server',
            // });
        };



        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on('refreshFetchData', onRefreshFetchData);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off('refreshFetchData', onRefreshFetchData);
        };
    }, []);



    const loadAssetEvents = async () => {
        setLoading(true);
        try {
            // Fetch resource data
            const fetchedAssetEvents = await fetchAssetEvents();
            if (fetchedAssetEvents) {
                setAssetEvents(fetchedAssetEvents);
            }
            setLoading(false);
            return { success: true }
        } catch (error) {
            setLoading(false);
            console.error("Error fetching asset events:", error);
            return { success: false }
        }

    };

    useEffect(() => {
        const fetchData = async () => {
            const result = await loadAssetEvents();

            if (result.success) {
                console.log('Data berhasil di-fetch');
                // Jangan akses assetEvents di sini
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        // if (window._visavail_initialized) return;
        // window._visavail_initialized = true;

        const loadCss = (href, integrity = null, crossorigin = null) => {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = href;

            if (integrity) link.integrity = integrity;
            if (crossorigin) link.crossOrigin = crossorigin;

            document.head.appendChild(link);
        };

        loadCss("/visavail.css");
        loadCss("/bootstrap.min.css");
        loadCss(
            "https://use.fontawesome.com/releases/v5.0.12/css/all.css",
        );
        loadCss("/styleVisavail.css");

        // Load JS dynamically
        const loadScript = (src) => {
            return new Promise((resolve) => {
                const script = document.createElement("script");
                script.src = src;
                script.onload = resolve;
                document.body.appendChild(script);
            });
        };

        const loadAllScripts = async (aEvents) => {

            if (!assetEvents || assetEvents.length === 0) return;

            await loadScript("/moment-with-locales.js");

            await loadScript("/d3.min.js");
            await loadScript("/visavail.js");

            // Bersihkan grafik lama jika ada
            const graphEl = document.getElementById("visavail_graph");
            if (graphEl) graphEl.innerHTML = '';

            const dataset = aEvents.filter(event => event.data && event.data.length > 0);
            datasetRef.current = dataset;


            const today0730 = DateTime.now().setZone('Asia/Jakarta').set({ hour: 7, minute: 30, second: 0, millisecond: 0 });
            const today0730UTC = today0730.toUTC();
            const nowUTC = DateTime.now().toUTC()

            const formattedStartDate = today0730UTC.toFormat('yyyy-MM-dd HH:mm:ss');
            const formattedEndDate = nowUTC.toFormat('yyyy-MM-dd HH:mm:ss');

            console.log("Chart Start:", formattedStartDate); // Harus UTC 00:30
            console.log("Chart End  :", formattedEndDate);

            const options2 = {
                moment_locale: "id",
                id_div_container: "visavail_container",
                id_div_graph: "visavail_graph",

                icon: {
                    class_has_data: 'fas fa-fw fa-check',
                    class_has_no_data: 'fas fa-fw fa-exclamation-circle'
                },

                custom_categories: true,
                custom_time_format: {
                    format_millisecond: ".%L",      // Format milidetik (tetap sama)
                    format_second: ":%S",           // Format detik (tetap sama)
                    format_minute: "%H:%M",         // Format menit (jam:menit, seperti 14:30)
                    format_hour: "%H:%M",           // Format jam (gunakan 24 jam, misalnya 14:00)
                    format_day: "%A, %d %B %Y",     // Format hari, tanggal, bulan, tahun (contoh: Senin, 14 Mei 2025)
                    format_week: "%A, %d %B",       // Format minggu (contoh: Senin, 14 Mei)
                    format_month: "%B %Y",          // Format bulan dan tahun (contoh: Mei 2025)
                    format_year: "%Y"               // Format tahun (contoh: 2025)
                },


                zoom: {
                    enabled: true,
                },

                responsive: {
                    enabled: true
                },
                graph: {
                    type: "bar",
                    width: 20,
                    height: 20
                },
                sub_chart: {
                    enabled: true,
                    height: 90,
                    graph: { enabled: "" }
                },
                tooltip: {
                    height: 18,
                    position: "overlay",
                    left_spacing: 20,
                    date_plus_time: true
                },
                legend: {
                    enabled: false
                },
                title: {
                    enabled: true
                },
                sub_title: {
                    enabled: true
                },
                date_in_utc: true,
                display_date_range: [
                    formattedStartDate,
                    formattedEndDate,
                ],
                // --- TAMBAHKAN: Properti onClickBlock ---
                onClickBlock: function (d, i) {
                    let status = 'Status tidak ditemukan.';

                    for (const resource of datasetRef.current) {
                        status = resource.description[i]?.[0] || 'Tidak ada deskripsi.';
                    }

                    const modalData = {
                        start: window.moment(d[0]).format('DD MMMM YYYY, HH:mm:ss'),
                        end: window.moment(d[2]).format('DD MMMM YYYY, HH:mm:ss'),
                        status: status
                    };

                    handleShowModal(modalData);
                }
                // --- AKHIR DARI PENAMBAHAN onClickBlock ---

            };

            chartRef.current = window.visavail.generate(options2, datasetRef.current);

            // function addCategoryIfNotExist(catKey) {
            //     if (!dataset[0].categories[catKey]) {
            //         dataset[0].categories[catKey] = {
            //             class: `rect_${catKey}`,
            //             tooltip_html: `<i class="fas fa-fw fa-circle tooltip_${catKey}"></i>`
            //         };
            //     }
            // }

            // // Simulasi updateGraph setelah beberapa detik
            // setTimeout(() => {
            //     addCategoryIfNotExist("R4");
            //     dataset[0].data.push(["2025-05-15 09:13:11", "R4", "2025-05-15 09:29:20"]);
            //     chartRef.current.updateGraph(dataset);
            // }, 1000);

            // setTimeout(() => {
            //     addCategoryIfNotExist("R5");
            //     dataset[0].data.push(["2025-05-15 10:13:11", "R5", "2025-05-15 11:29:20"]);
            //     chartRef.current.updateGraph(dataset);
            // }, 2000);


        };

        loadAllScripts(assetEvents);


    }, [assetEvents, handleShowModal]);


    useEffect(() => {
        const interval = setInterval(() => {
            try {
                if (chartRef.current) {
                    const oldData = datasetRef.current[0]?.data;

                    if (oldData?.length > 0) {
                        const nowUTC = DateTime.now()
                            .setZone("UTC")
                            .toFormat('yyyy-MM-dd HH:mm:ss');

                        let updated = false;

                        for (const resource of datasetRef.current) {
                            const data = resource?.data;
                            if (Array.isArray(data) && data.length > 0) {
                                data[data.length - 1][2] = nowUTC;
                                updated = true;
                            }
                        }

                        if (updated) {
                            chartRef.current.updateGraph(datasetRef.current);
                            console.log("Chart updated (auto-refresh) at", nowUTC);
                        }
                    }
                }
            } catch (error) {
                console.error("Auto-refresh failed:", error);
            }
        }, 60000); // setiap 1 menit

        return () => clearInterval(interval);
    }, []);



    return (
        <LayoutDashboard>
            <div className="container my-4 p-4 rounded shadow-sm bg-white border" style={{ marginTop: 3 }}>
                <div className="row">
                    <div className="col">
                        <Row gutter={[8, 8]} style={{ maxWidth: '100%', marginTop: 5, marginBottom: 0 }}>
                            <StatusButton />
                        </Row>
                        <div
                            id="visavail_container"
                            className="visavail"
                            style={{
                                overflowX: "auto",
                                border: "1px solid #dee2e6",
                                borderRadius: "0.5rem",
                                padding: "1rem",
                                backgroundColor: "#f9f9f9",
                            }}
                        >
                            {loading ? (<Spin />) :
                                (
                                    <div id="visavail_graph">{/* Visavail.js chart will be placed here */}</div>
                                )}

                        </div>

                        {/* --- TAMBAHKAN: Komponen Modal --- */}
                        <Modal
                            title="Detail Event"
                            open={isModalVisible}
                            onOk={handleOk}
                            onCancel={handleCancel}
                            footer={null} // Tidak menampilkan tombol OK dan Cancel bawaan
                        >
                            {clickedBlockData && (
                                <div>
                                    <Divider style={{ marginTop: 1, marginBottom: 1 }} />
                                    <p style={{ marginTop: 1, marginBottom: 1 }}><strong>Status:</strong> {clickedBlockData.status}</p>
                                    <p style={{ marginTop: 1, marginBottom: 1 }}><strong>Start Time:</strong> {clickedBlockData.start}</p>
                                    <p style={{ marginTop: 1, marginBottom: 1 }}><strong>End Time:</strong> {clickedBlockData.end}</p>
                                </div>
                            )}
                        </Modal>
                        {/* --- AKHIR DARI PENAMBAHAN MODAL --- */}

                    </div>
                </div>
            </div>

        </LayoutDashboard>
    );
}

export default TimelineDown;
