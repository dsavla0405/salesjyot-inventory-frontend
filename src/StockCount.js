import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import SwapVertIcon from '@mui/icons-material/SwapVert'; // Import the SwapVertIcon from Material-UI

// Register the required components with Chart.js
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function StockCount() {
    const apiUrl = process.env.REACT_APP_API_URL;
    const [apiData, setApiData] = useState([]);
    const [filters, setFilters] = useState({
        skucode: '',
        description: '',
        sellerSKUCode: '',
        count: ''
    });
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    useEffect(() => {
        // Fetch data from the API
        const fetchData = async () => {
            try {
                const response = await axios.get('${apiUrl}/stock-counts/all');
                setApiData(response.data); // Assuming response.data is an array of items
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
    };

    const filteredData = apiData.filter(item => {
        return (
            item.item.skucode.toLowerCase().includes(filters.skucode.toLowerCase()) &&
            item.item.description.toLowerCase().includes(filters.description.toLowerCase()) &&
            item.item.sellerSKUCode.toLowerCase().includes(filters.sellerSKUCode.toLowerCase()) &&
            item.count.toString().toLowerCase().includes(filters.count.toLowerCase())
        );
    });

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };
    
    const sortedData = filteredData.sort((a, b) => {
        if (sortConfig.key) {
            const aValue = sortConfig.key === 'count' ? a.count : a.item[sortConfig.key];
            const bValue = sortConfig.key === 'count' ? b.count : b.item[sortConfig.key];
    
            if (typeof aValue === 'string') {
                return sortConfig.direction === 'asc' 
                    ? aValue.localeCompare(bValue) 
                    : bValue.localeCompare(aValue);
            }
            
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });
    
    const colors = [
        'rgba(75, 192, 192, 0.6)',
        'rgba(255, 99, 132, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)',
        'rgba(75, 192, 192, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
    ];

    const chartData = {
        labels: apiData.map(item => item.item.skucode),
        datasets: [
            {
                label: 'Stock Count',
                data: apiData.map(item => item.count),
                backgroundColor: apiData.map((_, index) => colors[index % colors.length]),
                borderColor: apiData.map((_, index) => colors[(index + 6) % colors.length]), // Use a different set of colors for borders
                borderWidth: 1,
            }
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 2000, // Animation duration in milliseconds
            easing: 'easeInOutBounce', // Animation easing function
        },
        scales: {
            x: {
                beginAtZero: true,
                ticks: {
                    font: {
                        size: 14, // Font size for x-axis labels
                    },
                },
            },
            y: {
                beginAtZero: true,
                ticks: {
                    font: {
                        size: 14, // Font size for y-axis labels
                    },
                },
            },
        },
        plugins: {
            legend: {
                labels: {
                    font: {
                        size: 16, // Font size for legend labels
                    },
                },
            },
            title: {
                display: true,
                text: 'Stock Count Overview',
                font: {
                    size: 24, // Font size for the title
                },
            },
        },
    };

    return (
        <Container fluid>
            <Row className="my-4">
                <Col>
                    <h1>Stock Count</h1>
                </Col>
            </Row>
            <Row>
                <Col md={6}>
                <div style={{ overflowX: 'auto' }}> 
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">
                                    SKU Code
                                    <input
                                        type="text"
                                        value={filters.skucode}
                                        onChange={e => handleFilterChange('skucode', e.target.value)}
                                        placeholder="Search SKU Code"
                                    />
                                    <SwapVertIcon onClick={() => handleSort('skucode')} />
                                </th>
                                <th scope="col">
                                    Description
                                    <input
                                        type="text"
                                        value={filters.description}
                                        onChange={e => handleFilterChange('description', e.target.value)}
                                        placeholder="Search Description"
                                    />
                                    <SwapVertIcon onClick={() => handleSort('description')} />
                                </th>
                                <th scope="col">
                                    Seller SKU
                                    <input
                                        type="text"
                                        value={filters.sellerSKUCode}
                                        onChange={e => handleFilterChange('sellerSKUCode', e.target.value)}
                                        placeholder="Search Seller SKU"
                                    />
                                    <SwapVertIcon onClick={() => handleSort('sellerSKUCode')} />
                                </th>
                                <th scope="col">
                                    Count
                                    <input
                                        type="text"
                                        value={filters.count}
                                        onChange={e => handleFilterChange('count', e.target.value)}
                                        placeholder="Search Count"
                                    />
                                    <SwapVertIcon onClick={() => handleSort('count')} />
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedData.map(item => (
                                <tr key={item.stockCountId}>
                                    <td>{item.item.skucode}</td>
                                    <td>{item.item.description}</td>
                                    <td>{item.item.sellerSKUCode}</td>
                                    <td>{item.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </Col>
                <Col md={6}>
                    <Card style={{ height: '100%' }}>
                        <Card.Header style={{ fontWeight: "bolder" }}>Stock Count Chart</Card.Header>
                        <Card.Body>
                            <div style={{ height: '500px' }}>
                                <Bar data={chartData} options={chartOptions} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default StockCount;
